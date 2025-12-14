import React, { useState } from 'react';
import { apiSubmitReport } from '../services/mockBackend';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState({
    ngoId: '',
    month: new Date().toISOString().slice(0, 7), // Default current month YYYY-MM
    peopleHelped: '',
    eventsConducted: '',
    fundsUtilized: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setMsg('');

    try {
      await apiSubmitReport({
        ngoId: formData.ngoId,
        month: formData.month,
        peopleHelped: parseInt(formData.peopleHelped),
        eventsConducted: parseInt(formData.eventsConducted),
        fundsUtilized: parseFloat(formData.fundsUtilized)
      });
      setStatus('success');
      setMsg('Report submitted successfully!');
      // Reset numbers but keep ID/Month for convenience
      setFormData(prev => ({ ...prev, peopleHelped: '', eventsConducted: '', fundsUtilized: '' }));
    } catch (err: any) {
      setStatus('error');
      setMsg(err.message || "Failed to submit report.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader 
          title="Submit Monthly Report" 
          description="Enter impact data for a single NGO and month."
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NGO ID</label>
                <input 
                  type="text" 
                  name="ngoId"
                  required
                  placeholder="e.g. NGO-1024"
                  className="w-full rounded-md border-gray-300 border shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.ngoId}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input 
                  type="month" 
                  name="month"
                  required
                  className="w-full rounded-md border-gray-300 border shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.month}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">People Helped</label>
                <input 
                  type="number" 
                  name="peopleHelped"
                  min="0"
                  required
                  className="w-full rounded-md border-gray-300 border shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.peopleHelped}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Events Conducted</label>
                <input 
                  type="number" 
                  name="eventsConducted"
                  min="0"
                  required
                  className="w-full rounded-md border-gray-300 border shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.eventsConducted}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funds Utilized (₹)</label>
                <input 
                  type="number" 
                  name="fundsUtilized"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-md border-gray-300 border shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.fundsUtilized}
                  onChange={handleChange}
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="p-4 rounded-md bg-red-50 text-red-700 flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{msg}</span>
              </div>
            )}
            
            {status === 'success' && (
              <div className="p-4 rounded-md bg-green-50 text-green-700 flex items-center gap-2">
                <CheckCircle size={20} />
                <span>{msg}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" isLoading={status === 'submitting'}>
                Submit Report
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportForm;