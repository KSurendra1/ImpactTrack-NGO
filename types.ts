export interface Report {
  id: string;
  ngoId: string;
  month: string; // YYYY-MM
  peopleHelped: number;
  eventsConducted: number;
  fundsUtilized: number;
  submittedAt: string;
}

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalNGOs: number;
  totalPeopleHelped: number;
  totalEvents: number;
  totalFunds: number;
  reportsCount: number;
}
