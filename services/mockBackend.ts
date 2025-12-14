import { Report, Job, DashboardStats } from '../types';

// Keys for LocalStorage
const REPORTS_KEY = 'impact_track_reports';
const JOBS_KEY = 'impact_track_jobs';

// Helper to delay (simulate network latency)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Database Simulation ---

const getReports = (): Report[] => {
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveReports = (reports: Report[]) => {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

const getJobs = (): Record<string, Job> => {
  const data = localStorage.getItem(JOBS_KEY);
  return data ? JSON.parse(data) : {};
};

const saveJob = (job: Job) => {
  const jobs = getJobs();
  jobs[job.id] = job;
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
};

// --- Public API Methods ---

export const apiSubmitReport = async (reportData: Omit<Report, 'id' | 'submittedAt'>): Promise<Report> => {
  await delay(600); // Simulate network

  const reports = getReports();
  
  // Idempotency Check: Prevent same NGO submitting for same month
  const exists = reports.find(r => r.ngoId === reportData.ngoId && r.month === reportData.month);
  if (exists) {
    throw new Error(`Report for NGO ${reportData.ngoId} in ${reportData.month} already exists.`);
  }

  const newReport: Report = {
    ...reportData,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };

  reports.push(newReport);
  saveReports(reports);
  return newReport;
};

export const apiGetDashboardStats = async (month: string): Promise<DashboardStats> => {
  await delay(400); // Simulate network
  const reports = getReports();
  
  // Filter by month
  const monthlyReports = reports.filter(r => r.month === month);

  // Aggregate
  const uniqueNGOs = new Set(monthlyReports.map(r => r.ngoId));
  
  return {
    totalNGOs: uniqueNGOs.size,
    totalPeopleHelped: monthlyReports.reduce((sum, r) => sum + r.peopleHelped, 0),
    totalEvents: monthlyReports.reduce((sum, r) => sum + r.eventsConducted, 0),
    totalFunds: monthlyReports.reduce((sum, r) => sum + r.fundsUtilized, 0),
    reportsCount: monthlyReports.length
  };
};

export const apiGetJobStatus = async (jobId: string): Promise<Job | null> => {
  // Fast polling
  const jobs = getJobs();
  return jobs[jobId] || null;
};

// --- Async Job Processor Simulation ---

export const apiUploadBulkReports = async (csvContent: string): Promise<string> => {
  await delay(800); // Simulate upload time

  const rows = csvContent.trim().split('\n');
  const headers = rows[0].split(',').map(h => h.trim());
  const dataRows = rows.slice(1);

  const jobId = crypto.randomUUID();
  
  const newJob: Job = {
    id: jobId,
    status: 'pending',
    totalRows: dataRows.length,
    processedRows: 0,
    successfulRows: 0,
    failedRows: 0,
    errors: [],
    createdAt: new Date().toISOString()
  };

  saveJob(newJob);

  // Trigger "Background Process" (Simulated via setTimeout loop)
  // In a real app, this would be a message queue (RabbitMQ/Redis)
  simulateBackgroundProcessing(jobId, dataRows);

  return jobId;
};

const simulateBackgroundProcessing = (jobId: string, rows: string[]) => {
  let currentIndex = 0;
  
  const processBatch = () => {
    const jobs = getJobs();
    const job = jobs[jobId];
    if (!job) return;

    job.status = 'processing';
    
    // Process a "chunk" of 5 rows at a time
    const batchSize = 5;
    const end = Math.min(currentIndex + batchSize, rows.length);

    for (let i = currentIndex; i < end; i++) {
      const row = rows[i];
      try {
        const cols = row.split(',').map(c => c.trim());
        if (cols.length < 5) throw new Error("Invalid column count");
        
        // Parse
        const [ngoId, month, peopleStr, eventsStr, fundsStr] = cols;
        const people = parseInt(peopleStr);
        const events = parseInt(eventsStr);
        const funds = parseFloat(fundsStr);

        if (isNaN(people) || isNaN(events) || isNaN(funds)) throw new Error("Invalid number format");

        // "Save" to DB (Checking idempotency silently)
        const reports = getReports();
        const exists = reports.find(r => r.ngoId === ngoId && r.month === month);
        
        if (exists) {
           // For bulk, we might skip or overwrite. Let's skip and mark error for demo.
           throw new Error(`Duplicate entry for ${ngoId} - ${month}`);
        }

        reports.push({
            id: crypto.randomUUID(),
            ngoId, month, peopleHelped: people, eventsConducted: events, fundsUtilized: funds,
            submittedAt: new Date().toISOString()
        });
        saveReports(reports);
        
        job.successfulRows++;
      } catch (err: any) {
        job.failedRows++;
        job.errors.push(`Row ${i + 1}: ${err.message}`);
      }
      job.processedRows++;
    }

    currentIndex = end;
    saveJob(job);

    if (currentIndex < rows.length) {
      // Continue processing next batch after delay
      setTimeout(processBatch, 1000); 
    } else {
      // Finish
      job.status = 'completed';
      saveJob(job);
    }
  };

  // Start the worker
  setTimeout(processBatch, 1000);
};
