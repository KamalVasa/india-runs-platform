import { useState } from 'react';
import api from '../api/client';
import { MessageSquare, X, Send } from 'lucide-react';

export default function CopilotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{role: 'ai', text: 'Hi, I am your AI Recruiter Copilot. Ask me anything about the candidate pipeline!'}]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if(!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setInput('');
    
    try {
      const res = await api.post('/ai/copilot', { query: userMsg });
      setMessages(prev => [...prev, {role: 'ai', text: res.data.reply}]);
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Unknown network error';
      setMessages(prev => [...prev, {role: 'ai', text: `Error: ${errMsg}`}]);
    }
  };

  if(!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-primary p-4 rounded-full shadow-lg hover:bg-blue-600 transition z-50">
      <MessageSquare size={24} className="text-white"/>
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-surface rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden z-50">
      <div className="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700">
        <h3 className="font-semibold text-white flex items-center"><MessageSquare size={18} className="mr-2 text-primary"/> AI Copilot</h3>
        <button onClick={() => setIsOpen(false)}><X size={18} className="text-slate-400 hover:text-white"/></button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role==='user' ? 'bg-primary text-white' : 'bg-slate-700 text-slate-200'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-700 bg-slate-800 flex">
        <input 
          value={input} onChange={e=>setInput(e.target.value)} 
          onKeyDown={e=>e.key==='Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-l-lg px-3 text-sm text-white focus:outline-none focus:border-primary"
        />
        <button onClick={handleSend} className="bg-primary px-3 rounded-r-lg hover:bg-blue-600 flex items-center justify-center">
          <Send size={16} className="text-white"/>
        </button>
      </div>
    </div>
  );
}
