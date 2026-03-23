import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Save, CheckCircle2, Loader2, Maximize2, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface DiaryProps {
  selectedClass: string;
  selectedDay: string;
}

export const Diary: React.FC<DiaryProps> = ({ selectedClass, selectedDay }) => {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  const storageKey = `diary_${selectedClass}_${selectedDay}`;

  // Load note
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setNote(saved || '');
    setStatus('idle');
  }, [storageKey]);

  const handleManualSave = () => {
    setStatus('saving');
    localStorage.setItem(storageKey, note);
    setTimeout(() => setStatus('saved'), 500);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir todas as anotações desta turma e dia?')) {
      setNote('');
      localStorage.removeItem(storageKey);
      setStatus('saved');
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (status === 'idle' && note === (localStorage.getItem(storageKey) || '')) return;

    const timeout = setTimeout(() => {
      setStatus('saving');
      localStorage.setItem(storageKey, note);
      setTimeout(() => setStatus('saved'), 500);
    }, 1500); // Slower auto-save to allow manual save to feel meaningful

    return () => clearTimeout(timeout);
  }, [note, storageKey]);

  // Reset saved status after a while
  useEffect(() => {
    if (status === 'saved') {
      const timeout = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const DiaryContent = (
    <div className={cn(
      "flex flex-col h-full",
      isExpanded ? "p-8" : "p-0"
    )}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-syne">Diário de Bordo</h2>
            <p className="text-sm text-slate-500 font-medium">Anotações para {selectedClass} • {selectedDay}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 mr-2">
            <AnimatePresence mode="wait">
              {status === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-slate-400 text-xs font-bold"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Salvando...
                </motion.div>
              )}
              {status === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 text-emerald-400 text-xs font-bold"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Salvo
                </motion.div>
              )}
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-600 text-xs font-bold"
                >
                  <Save className="w-3 h-3" />
                  Pronto
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleManualSave}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            title="Salvar Manualmente"
          >
            <Save className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 transition-all active:scale-95"
            title={isExpanded ? "Fechar" : "Expandir"}
          >
            {isExpanded ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleDelete}
            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all active:scale-95"
            title="Excluir"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={cn(
          "w-full p-8 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border transition-all duration-500 outline-none text-slate-200 leading-relaxed resize-none shadow-inner ring-1 ring-white/5",
          status === 'saved' ? "border-emerald-500/40 bg-emerald-500/[0.02]" : "border-white/10",
          status === 'saving' ? "border-indigo-500/20" : "",
          isExpanded ? "flex-grow text-xl" : "min-h-[300px] text-lg"
        )}
      />
    </div>
  );

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="glass-morphism rounded-[2.5rem] p-8 shadow-2xl border border-white/10">
          {DiaryContent}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-6 md:p-12"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full max-w-6xl mx-auto glass-morphism rounded-[3rem] border border-white/10 overflow-hidden"
            >
              {DiaryContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
