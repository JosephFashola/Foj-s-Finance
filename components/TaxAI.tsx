import React, { useState, useRef, useEffect } from 'react';
import { getTaxAdvice } from '../services/geminiService';
import { Send, Bot, User, Calculator, X, ChevronRight } from 'lucide-react';
import { ChatMessage } from '../types';
import { FeatureGate } from './FeatureGate';

interface TaxAIProps {
  logAction: (action: string, details: string, entityId?: string) => void;
  userPlan: string;
}

export const TaxAI: React.FC<TaxAIProps> = ({ logAction, userPlan }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'model', 
      text: 'Hello! I am LedgerBot, your AI Tax Consultant. How can I help you regarding Nigerian tax laws (CAMA, VAT, CIT) or accounting standards today?' 
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  // Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcRevenue, setCalcRevenue] = useState('');
  const [calcExpenses, setCalcExpenses] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToAI = async (text: string, logContext: string = 'TAX_CONSULTATION') => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    logAction(logContext, `User Query: ${text.substring(0, 60)}...`);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const responseText = await getTaxAdvice(history, userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the tax database. Please check your connection and try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    await sendMessageToAI(text);
  };

  const handleCalculateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcRevenue || !calcExpenses) return;

    const revenue = parseFloat(calcRevenue);
    const expenses = parseFloat(calcExpenses);

    const prompt = `
I need a tax assessment for a Nigerian business with the following annual figures:

- Total Revenue: ₦${revenue.toLocaleString()}
- Total Allowable Expenses: ₦${expenses.toLocaleString()}

Please calculate and explain the estimated liability for:
1. Companies Income Tax (CIT) - Determine if Small (0%), Medium (20%), or Large (30%) company based on revenue.
2. Tertiary Education Tax (2.5% of Assessable Profit).
3. VAT (Value Added Tax) implications (Assuming standard 7.5% on revenue if applicable).

Provide a clear summary of total estimated tax payable.
    `.trim();

    setShowCalculator(false);
    setCalcRevenue('');
    setCalcExpenses('');
    
    await sendMessageToAI(prompt, 'TAX_CALCULATION');
  };

  return (
    <FeatureGate 
      currentPlan={userPlan} 
      requiredPlans={['Startup', 'Enterprise']}
      title="AI Tax Consultant Locked"
      description="Unlimited real-time tax advice and calculation is available on Startup and Enterprise plans."
      features={["Real-time CIT & VAT estimation", "Interactive tax law Q&A", "Personalized financial advice"]}
    >
      <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                  <Bot size={24} />
              </div>
              <div>
                  <h3 className="font-bold">Tax & Accounting Assistant</h3>
                  <p className="text-xs text-blue-100">Powered by Gemini • Nigerian Finance Act Context</p>
              </div>
          </div>
          <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showCalculator ? 'bg-white text-indigo-600' : 'bg-indigo-500/50 hover:bg-indigo-500 text-white'}`}
          >
              {showCalculator ? <X size={16} /> : <Calculator size={16} />}
              <span>{showCalculator ? 'Close Calc' : 'Tax Calculator'}</span>
          </button>
        </div>

        {/* Calculator Panel (Slide down) */}
        <div className={`bg-indigo-50 border-b border-indigo-100 transition-all duration-300 ease-in-out overflow-hidden ${showCalculator ? 'max-h-96 opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}`}>
           <div className="max-w-2xl mx-auto">
               <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                   <Calculator size={16} /> Quick Tax Liability Estimator
               </h4>
               <form onSubmit={handleCalculateSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                   <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">Annual Revenue (₦)</label>
                       <input 
                          type="number" 
                          required
                          value={calcRevenue}
                          onChange={(e) => setCalcRevenue(e.target.value)}
                          placeholder="e.g. 50000000"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">Allowable Expenses (₦)</label>
                       <input 
                          type="number" 
                          required
                          value={calcExpenses}
                          onChange={(e) => setCalcExpenses(e.target.value)}
                          placeholder="e.g. 30000000"
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                       />
                   </div>
                   <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors h-[38px]"
                   >
                      Calculate & Explain <ChevronRight size={14} />
                   </button>
               </form>
               <p className="text-[10px] text-indigo-400 mt-2">
                   *Estimates are based on standard CIT rates (0%, 20%, 30%) and Education Tax (2.5%). Actual liability may vary based on capital allowances and specific industry regulations.
               </p>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-1 rounded-full flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-gray-100'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-indigo-600"/>}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 z-10">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask specific questions about tax laws..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1.5 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-medium text-gray-400 whitespace-nowrap px-2">Try asking:</span>
              {["What is the VAT rate?", "Can I deduct lunch expenses?", "Explain Withholding Tax"].map((q, i) => (
                  <button 
                      key={i} 
                      onClick={() => setInput(q)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full whitespace-nowrap transition-colors border border-transparent hover:border-gray-300"
                  >
                      {q}
                  </button>
              ))}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};