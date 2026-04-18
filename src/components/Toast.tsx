import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  onClose: (id: string) => void;
}

export function Toast({ id, title, message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  };

  const backgrounds = {
    error: 'bg-red-500/10 border-red-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    info: 'bg-cyan-500/10 border-cyan-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-2xl min-w-[320px] max-w-md pointer-events-auto",
        backgrounds[type]
      )}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)}
        className="text-gray-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[], onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
