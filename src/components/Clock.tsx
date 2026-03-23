import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock as ClockIcon, Timer, BookOpen, Coffee } from 'lucide-react';
import { format, isWithinInterval, parse, addMinutes, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SchoolData, TIME_SLOTS_MORNING, TIME_SLOTS_AFTERNOON } from '../lib/data';
import { cn } from '../lib/utils';

interface ClockProps {
  selectedTurn: 'morning' | 'afternoon';
  selectedClass: string;
  selectedDay: string;
  schoolData: SchoolData;
}

export const Clock: React.FC<ClockProps> = ({ selectedTurn, selectedClass, selectedDay, schoolData }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStatus = useMemo(() => {
    const timeSlots = selectedTurn === 'morning' ? TIME_SLOTS_MORNING : TIME_SLOTS_AFTERNOON;
    const currentTimeStr = format(now, 'HH:mm');
    const currentTime = parse(currentTimeStr, 'HH:mm', now);

    for (const slot of timeSlots) {
      const [startStr, endStr] = slot.split('–');
      const startTime = parse(startStr, 'HH:mm', now);
      const endTime = parse(endStr, 'HH:mm', now);

      if (isWithinInterval(currentTime, { start: startTime, end: endTime })) {
        const isInterval = slot === '09:45–10:00' || slot === '15:15–15:30';
        const subject = schoolData[selectedTurn][selectedClass]?.[selectedDay]?.[slot];
        const totalMinutes = differenceInMinutes(endTime, startTime);
        const elapsedMinutes = differenceInMinutes(currentTime, startTime);
        const remainingMinutes = differenceInMinutes(endTime, currentTime);
        const progress = (elapsedMinutes / totalMinutes) * 100;

        return {
          isActive: true,
          isInterval,
          slot,
          subject: isInterval ? { name: 'Intervalo', teacher: 'Descanso', color: 'bg-amber-100 text-amber-700 border-amber-200' } : subject,
          remainingMinutes,
          progress,
        };
      }
    }

    return { isActive: false };
  }, [now, selectedTurn, selectedClass, selectedDay, schoolData]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="glass-morphism rounded-[2rem] p-5 shadow-2xl border border-white/10 overflow-hidden relative">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl animate-pulse" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
              <ClockIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tighter text-white font-syne">
                {format(now, 'HH:mm')}
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStatus.isActive ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center md:items-end text-center md:text-right"
              >
                <div className="flex items-center gap-2 mb-1">
                  {currentStatus.isInterval ? (
                    <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {currentStatus.isInterval ? 'Em Intervalo' : 'Aula Atual'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {currentStatus.subject?.name || 'Sem Aula'}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Faltam {currentStatus.remainingMinutes} min</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center md:text-right"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">
                  Status
                </span>
                <h3 className="text-xl font-bold text-slate-600 italic">
                  Fora do horário
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {currentStatus.isActive && (
          <div className="mt-4">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentStatus.progress}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                  currentStatus.isInterval ? "bg-amber-500" : "bg-blue-500"
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
