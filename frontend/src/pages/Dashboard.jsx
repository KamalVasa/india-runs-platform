import { useEffect, useState } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { Search, Sliders } from 'lucide-react';

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  
  useEffect(() => {
    api.get('candidates').then(res => setCandidates(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Candidate Pipeline</h1>
          <p className="text-slate-400 text-sm">Top 100 AI Engineer matches for the selected JD</p>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => alert('Weight adjustment is locked for the Hackathon Sandbox. To adjust scoring weights, manually edit the rules in rank.py')} className="flex items-center px-4 py-2 bg-surface border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition">
            <Sliders size={16} className="mr-2 text-primary"/> Adjust Weights
          </button>
        </div>
      </div>
      
      <div className="flex-1 bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700 bg-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">Candidate</div>
          <div className="col-span-2">Experience</div>
          <div className="col-span-2">Response Rate</div>
          <div className="col-span-2">GitHub Score</div>
          <div className="col-span-2 text-right">Match Score</div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {candidates.map(c => (
            <Link to={`/candidate/${c.candidate_id}`} key={c.candidate_id} className="grid grid-cols-12 gap-4 p-3 bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-slate-600 rounded-lg items-center transition group">
              <div className="col-span-1 text-lg font-bold text-slate-500 group-hover:text-primary transition">#{c.rank}</div>
              <div className="col-span-3">
                <div className="font-semibold text-white group-hover:text-primary transition">{c.anonymized_name || c.candidate_id}</div>
                <div className="text-xs text-slate-400 truncate">{c.current_title}</div>
              </div>
              <div className="col-span-2 text-sm text-slate-300">{c.years_of_experience} yrs</div>
              <div className="col-span-2 text-sm text-slate-300">{(c.recruiter_response_rate * 100).toFixed(0)}%</div>
              <div className="col-span-2 text-sm text-slate-300">{c.github_activity_score > 0 ? c.github_activity_score : 'N/A'}</div>
              <div className="col-span-2 text-right">
                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold text-sm">
                  {(c.score * 100).toFixed(1)}%
                </span>
              </div>
            </Link>
          ))}
          {candidates.length === 0 && (
             <div className="p-8 text-center text-slate-400">Loading candidates... (or run load_data.py first)</div>
          )}
        </div>
      </div>
    </div>
  )
}
