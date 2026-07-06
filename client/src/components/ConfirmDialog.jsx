import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl shadow-lifted w-full max-w-sm p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display font-semibold text-slate-ink">{title}</h3>
              <button onClick={onCancel}><X size={18} className="text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-soft mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  danger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-signal text-white hover:bg-signal-dark'
                }`}
              >
                Confirm
              </button>
              <button onClick={onCancel} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
