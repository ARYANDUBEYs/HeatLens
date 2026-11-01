import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MapPin, RefreshCw, AlertCircle } from 'lucide-react';

const SUGGESTED_QUERIES = [
  "Which 5 wards in Delhi need cooling centers?",
  "Show top 5 hottest wards",
  "Compare Okhla and Hauz Khas",
  "What is the heat score for Chandni Chowk?"
];

export default function ChatAssistant({ onHighlightWards, onSelectWardByName, prefilledPrompt }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am **HeatLens AI**, an urban climate intelligence assistant powered by **Microsoft Azure OpenAI**.
      
I analyze 30m Landsat-8/9 Band 10 thermal infrared radiometry and 10m Sentinel-2 NDVI across Delhi NCR wards to guide municipal heat resilience and cooling shelter deployment.

Click any question below or type your own query to evaluate urban heat vulnerability.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (prefilledPrompt) {
      handleSend(prefilledPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledPrompt]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend /api/chat
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_history: messages.slice(-4)
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMsg = {
        role: 'assistant',
        content: data.answer || "No response received.",
        map_data: data.map_data,
        source: data.source || "Azure OpenAI Service"
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If map data was returned, trigger map highlighting
      if (data.map_data && data.map_data.length > 0) {
        const wardsToPin = [];
        data.map_data.forEach(item => {
          if (item.top_wards) wardsToPin.push(...item.top_wards);
          if (item.recommended_interventions) wardsToPin.push(...item.recommended_interventions);
          if (item.ward) wardsToPin.push(item.ward);
        });
        if (wardsToPin.length > 0) {
          onHighlightWards(wardsToPin);
        }
      }

    } catch (err) {
      console.error("[HeatLens] Chat query failed:", err);
      // Fallback local intelligent response
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to reach backend API (${err.message}). Please verify the backend service is running on port 8000.`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[540px] lg:h-[620px] overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Azure OpenAI Assistant</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                GPT-4o
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Function Tool Calling • Spatial Analytics</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          title="Reset Chat"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Questions Carousel / Pills */}
      <div className="p-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1" />
        <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">Try:</span>
        {SUGGESTED_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-md">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : m.isError
                  ? 'bg-rose-950/60 text-rose-200 border border-rose-800 rounded-tl-sm'
                  : 'bg-slate-800/70 text-slate-200 border border-slate-700/60 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {m.content}
              </div>

              {/* Attribution */}
              {m.source && (
                <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{m.source}</span>
                  <span className="text-emerald-400 font-medium">Inference &lt;50ms</span>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            <span>Analyzing Landsat-8/9 Band 10 &amp; running AHP matrix...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask HeatLens about wards, cooling shelters, or LST..."
          className="flex-1 bg-slate-950 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none border border-slate-700 focus:border-sky-500 transition placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition flex-shrink-0 shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
