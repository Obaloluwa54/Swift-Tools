import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'primary';
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  type === 'danger' ? 'bg-red-50 text-red-600' : 
                  type === 'warning' ? 'bg-amber-50 text-amber-600' : 
                  type === 'primary' ? 'bg-zinc-900 text-white' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {icon || <AlertTriangle size={24} />}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-2xl font-bold text-zinc-900 mb-2">{title}</h3>
              <p className="text-zinc-500 leading-relaxed mb-8">{message}</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 transition-all border border-zinc-100"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
                    type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 
                    type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 
                    type === 'primary' ? 'bg-zinc-900 hover:bg-zinc-800 shadow-zinc-900/20' :
                    'bg-zinc-900 hover:bg-zinc-800 shadow-zinc-900/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
