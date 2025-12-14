import React, { useState, useEffect, useRef } from 'react';
import { apiUploadBulkReports, apiGetJobStatus } from '../services/mockBackend';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Job } from '../types';
import { UploadCloud, FileText, Check, X, RefreshCw } from 'lucide-react';

const BulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<Job | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const pollInterval = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Reset state if new file
      setJobId(null);
      setJobStatus(null);
      if (pollInterval.current) clearInterval(pollInterval.current);
    }
  };

  const startPolling = (id: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    pollInterval.current = window.setInterval(async () => {
      const status = await apiGetJobStatus(id);
      setJobStatus(status);
      
      if (status && (status.status === 'completed' || status.status === 'failed')) {
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    }, 1000);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const text = await file.text();
      const id = await apiUploadBulkReports(text);
      setJobId(id);
      startPolling(id);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const getProgressPercentage = () => {
    if (!jobStatus || jobStatus.totalRows === 0) return 0;
    return Math.round((jobStatus.processedRows / jobStatus.totalRows) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader 
          title="Bulk Upload Reports" 
          description="Upload a CSV file containing multiple monthly reports."
        />
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-white transition-colors">
             <div className="flex flex-col items-center justify-center">
                <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
                <label className="cursor-pointer">
                  <span className="mt-2 block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                    Upload a CSV file
                  </span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  {file ? `Selected: ${file.name}` : "CSV format: NGO_ID, Month, People, Events, Funds"}
                </p>
             </div>
          </div>
          
          {file && !jobId && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleUpload} isLoading={isUploading} variant="secondary">
                Start Processing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Monitor */}
      {jobStatus && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader title="Processing Status" />
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    {jobStatus.status === 'processing' && <RefreshCw className="animate-spin h-4 w-4 text-indigo-500" />}
                    {jobStatus.status === 'completed' && <Check className="h-4 w-4 text-green-500" />}
                    Status: <span className="font-semibold capitalize">{jobStatus.status}</span>
                  </span>
                  <span>{jobStatus.processedRows} / {jobStatus.totalRows} rows</span>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                 <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${jobStatus.status === 'completed' ? 'bg-green-600' : 'bg-indigo-600'}`} 
                    style={{ width: `${getProgressPercentage()}%` }}
                 ></div>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">{jobStatus.successfulRows}</div>
                    <div className="text-xs text-green-600 uppercase tracking-wide">Success</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700">{jobStatus.failedRows}</div>
                    <div className="text-xs text-red-600 uppercase tracking-wide">Failed</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{getProgressPercentage()}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Complete</div>
                  </div>
               </div>

               {/* Error Log */}
               {jobStatus.errors.length > 0 && (
                 <div className="mt-4 bg-red-50 border border-red-100 rounded-md p-4">
                   <h4 className="text-sm font-semibold text-red-800 mb-2">Error Log</h4>
                   <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
                     {jobStatus.errors.map((err, idx) => (
                       <li key={idx} className="flex items-start gap-2">
                         <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                         {err}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>
          </CardContent>
        </Card>
      )}

      {/* Helper text for the demo */}
      <div className="text-xs text-gray-400 text-center">
        Tip: Create a CSV with header <code>ngoId, month, people, events, funds</code> and 10+ rows to see the progress bar in action.
      </div>
    </div>
  );
};

export default BulkUpload;