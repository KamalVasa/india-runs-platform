import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import api from '../api/client';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    api.get('analytics').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-slate-400">Loading Analytics Dashboard... (Ensure backend is running)</div>;

  return (
    <div className="p-8 h-full overflow-y-auto text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Talent Pool Analytics</h1>
        <p className="text-slate-400">Deep insights into candidate distributions, experience, and behavioral signals.</p>
      </div>

      {/* Recruiter Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg flex items-center">
          <div className="bg-blue-500/20 p-4 rounded-lg mr-4"><Users className="text-primary"/></div>
          <div><p className="text-sm text-slate-400">Total Pool</p><p className="text-2xl font-bold">{data.summary.total_candidates.toLocaleString()}</p></div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg flex items-center">
          <div className="bg-emerald-500/20 p-4 rounded-lg mr-4"><ShieldCheck className="text-emerald-400"/></div>
          <div><p className="text-sm text-slate-400">Active Candidates</p><p className="text-2xl font-bold">{data.summary.active_pool.toLocaleString()}</p></div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg flex items-center">
          <div className="bg-amber-500/20 p-4 rounded-lg mr-4"><TrendingUp className="text-amber-400"/></div>
          <div><p className="text-sm text-slate-400">Avg Experience</p><p className="text-2xl font-bold">{data.summary.avg_experience} yrs</p></div>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg flex items-center">
          <div className="bg-red-500/20 p-4 rounded-lg mr-4"><AlertTriangle className="text-red-400"/></div>
          <div><p className="text-sm text-slate-400">Honeypots Caught</p><p className="text-2xl font-bold">{data.summary.honeypots_caught.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Match Curve */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold mb-6">Candidate Match Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.matchCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px'}} itemStyle={{color: '#fff'}}/>
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold mb-6">Experience Demographics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.experience}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{fill: '#334155'}} contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px'}} itemStyle={{color: '#fff'}}/>
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* GitHub Signals */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold mb-6">GitHub Activity Signals</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.github} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.github.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px'}} itemStyle={{color: '#fff'}}/>
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="ml-4 space-y-3 w-1/3">
              {data.github.map((entry, index) => (
                <div key={index} className="flex items-center text-sm text-slate-300">
                  <div className="w-3 h-3 rounded-full mr-3 shadow" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recruiter Response */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold mb-6">Recruiter Response Rates</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.response} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.response.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+2) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px'}} itemStyle={{color: '#fff'}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-4 space-y-3 w-1/3">
              {data.response.map((entry, index) => (
                <div key={index} className="flex items-center text-sm text-slate-300">
                  <div className="w-3 h-3 rounded-full mr-3 shadow" style={{backgroundColor: COLORS[(index+2) % COLORS.length]}}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
