import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, Bot, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createChat } from '../services/gemini';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

export function Chatbot({ handleError }: { handleError: (e: any) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useHighThinking, setUseHighThinking] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initChat = () => {
    chatRef.current = createChat(
      "You are LANCE: success engine, a specialized Freelancing Career Coach. Your goal is to help freelancers optimize their profiles, find high-paying clients, and scale their business. Be professional, encouraging, and data-driven.",
      useHighThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
      useHighThinking
    );
  };

  useEffect(() => {
    initChat();
  }, [useHighThinking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage(input);
      const modelMessage: ChatMessage = { role: 'model', text: result.text, timestamp: Date.now() };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      handleError(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-extrabold">LANCE: <span className="font-sans font-normal">success engine</span></h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setUseHighThinking(!useHighThinking)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border font-sans",
              useHighThinking ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text" : "bg-white/5 border-white/10 text-gray-500"
            )}
          >
            <BrainCircuit className="w-4 h-4" />
            High Thinking
          </button>
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Bot className="w-8 h-8" />
            </div>
            <p className="text-sm max-w-[240px]">Ask me anything about your freelance career, from pricing to client outreach.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
              msg.role === 'user' ? "bg-cyan-600 border-cyan-400" : "bg-white/5 border-white/10"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' ? "bg-cyan-600 text-white rounded-tr-none" : "bg-white/5 text-gray-200 rounded-tl-none border border-white/5"
            )}>
              <div className="markdown-body">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
