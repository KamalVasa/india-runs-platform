import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, BrainCircuit, UserCheck } from 'lucide-react';

export default function CandidateDetail() {
  const { id } = useParams();
  const [cand, setCand] = useState(null);
  const [report, setReport] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    api.get(`candidates/${id}`).then(res => setCand(res.data)).catch(console.error);
  }, [id]);

  const generateReport = async () => {
    setLoadingAI(true);
    try {
      const res = await api.post(`/ai/explain/${id}`);
      setReport(res.data.report);
    } catch (e) {
      setReport("Gemini API Error: AI features are disabled. Please configure your .env file.");
    }
    setLoadingAI(false);
  };

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await api.post(`/ai/interview/${id}`);
      setQuestions(res.data.questions);
    } catch (e) {
      setQuestions("Gemini API Error: AI features are disabled. Please configure your .env file.");
    }
    setLoadingQuestions(false);
  };

  if(!cand) return <div className="p-8 text-slate-400">Loading candidate...</div>;

  return (
    <div className="p-8 h-full overflow-y-auto">
      <Link to="/" className="flex items-center text-sm text-primary mb-6 hover:underline"><ArrowLeft size={16} className="mr-1"/> Back to Pipeline</Link>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{cand.anonymized_name || cand.candidate_id}</h1>
          <p className="text-slate-400 text-lg">{cand.current_title} @ {cand.current_company} • {cand.years_of_experience} yrs exp</p>
        </div>
        <div className="flex space-x-4">
          <button onClick={generateQuestions} disabled={loadingQuestions} className="flex items-center px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50">
            <UserCheck size={18} className="mr-2"/> {loadingQuestions ? 'Generating...' : 'Prepare Interview'}
          </button>
          <button onClick={generateReport} disabled={loadingAI} className="flex items-center px-4 py-2 bg-accent hover:bg-purple-600 text-white rounded-lg transition shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50">
            <BrainCircuit size={18} className="mr-2"/> {loadingAI ? 'Analyzing...' : 'Generate Match Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {report && (
            <div className="p-6 bg-slate-800 border border-accent/30 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><BrainCircuit className="mr-2 text-accent"/> AI Analysis & Recommendation</h3>
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">{report}</div>
            </div>
          )}
          
          {questions && (
            <div className="p-6 bg-slate-800 border border-primary/30 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><UserCheck className="mr-2 text-primary"/> Targeted Interview Questions</h3>
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">{questions}</div>
            </div>
          )}
          
          <div className="p-6 bg-surface border border-slate-700 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Career History</h3>
            <div className="space-y-6">
              {cand.career_history?.map((job, i) => (
                <div key={i} className="border-l-2 border-slate-700 pl-4 pb-2">
                  <div className="font-semibold text-white text-lg">{job.title}</div>
                  <div className="text-sm text-primary font-medium">{job.company}</div>
                  <div className="text-sm text-slate-400 mt-2 leading-relaxed">{job.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-surface border border-slate-700 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Key Signals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50"><span className="text-slate-400">Response Rate</span><span className="text-white font-semibold">{(cand.recruiter_response_rate*100).toFixed(0)}%</span></div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50"><span className="text-slate-400">GitHub Score</span><span className="text-white font-semibold">{cand.github_activity_score>0 ? cand.github_activity_score : 'None'}</span></div>
              <div className="flex justify-between items-center py-2"><span className="text-slate-400">Honeypot Flag</span><span className={cand.is_honeypot ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{cand.is_honeypot ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
