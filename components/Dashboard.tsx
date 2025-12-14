import React, { useEffect, useState } from 'react';
import { apiGetDashboardStats } from '../services/mockBackend';
import { DashboardStats } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Calendar, DollarSign, Building } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <Card className="border-l-4" style={{ borderLeftColor: color }}>
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-6 w-6" style={{ color: color }} />
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await apiGetDashboardStats(month);
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [month]);

  // Transform data for charts
  const chartData = stats ? [
    { name: 'People Helped', value: stats.totalPeopleHelped, color: '#4F46E5' },
    { name: 'Events', value: stats.totalEvents, color: '#10B981' },
    // Scaling funds down for visual comparability in this specific chart type, usually you'd have separate charts
    { name: 'Funds (k)', value: Math.round(stats.totalFunds / 1000), color: '#F59E0B' }, 
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Impact Dashboard</h1>
           <p className="text-gray-500">Overview of NGO performance and resource utilization.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Reporting Period:</span>
            <input 
              type="month" 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-md border-gray-300 border shadow-sm px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
      </div>

      {loading ? (
         <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
         </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="NGOs Reporting" 
              value={stats.totalNGOs} 
              icon={Building} 
              color="#6366F1" 
            />
            <StatCard 
              title="People Helped" 
              value={stats.totalPeopleHelped.toLocaleString()} 
              icon={Users} 
              color="#10B981" 
            />
            <StatCard 
              title="Events Held" 
              value={stats.totalEvents} 
              icon={Calendar} 
              color="#EC4899" 
            />
            <StatCard 
              title="Funds Used" 
              value={`₹${stats.totalFunds.toLocaleString()}`} 
              icon={DollarSign} 
              color="#F59E0B" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader title="Metrics Overview" description={`Comparative metrics for ${month}`} />
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
               <CardHeader title="System Status" />
               <CardContent>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Reports Processed</span>
                        <span className="font-bold text-gray-900">{stats.reportsCount}</span>
                     </div>
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Storage Used (Sim)</span>
                        <span className="font-bold text-gray-900">~{JSON.stringify(localStorage).length / 1024} KB</span>
                     </div>
                     <div className="text-xs text-gray-400 mt-4">
                        * All data is stored locally in your browser for this demo.
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No data available for the selected month.
        </div>
      )}
    </div>
  );
};

export default Dashboard;