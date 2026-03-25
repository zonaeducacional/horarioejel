/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Calendar, 
  Users, 
  Bell, 
  BellOff, 
  Clock as ClockIcon,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { SCHOOL_DATA, DAYS, TURNS, TIME_SLOTS_MORNING, TIME_SLOTS_AFTERNOON } from './lib/data';
import { Clock } from './components/Clock';
import { Diary } from './components/Diary';
import { PWAInstall } from './components/PWAInstall';
import { useNotifications } from './hooks/useNotifications';
import { cn } from './lib/utils';

export default function App() {
  const [turn, setTurn] = useState<'morning' | 'afternoon'>('morning');
  const [day, setDay] = useState(DAYS[0]);
  const [selectedClass, setSelectedClass] = useState(Object.keys(SCHOOL_DATA.morning)[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [scheduleView, setScheduleView] = useState<'single' | 'integral'>('single');

  const { permission, requestPermission } = useNotifications(turn, selectedClass, day, SCHOOL_DATA);

  // Sync selected class when turn changes
  useEffect(() => {
    const classes = Object.keys(SCHOOL_DATA[turn]);
    if (!classes.includes(selectedClass)) {
      setSelectedClass(classes[0]);
    }
  }, [turn]);

  const timeSlots = turn === 'morning' ? TIME_SLOTS_MORNING : TIME_SLOTS_AFTERNOON;
  const currentSchedule = SCHOOL_DATA[turn][selectedClass]?.[day] || {};

  return (
    <div className="min-h-screen pb-4 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-morphism border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5 overflow-hidden p-1">
              <img 
                src="https://dev5.neocities.org/6/logo.png" 
                alt="Logo Escola Januário Eleodoro de Lima" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-syne">EJEL</h1>
                <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold text-slate-300">2026</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Escola Januário E. de Lima</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setTurn('morning')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  turn === 'morning' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Sun className="w-4 h-4" />
                Matutino
              </button>
              <button
                onClick={() => setTurn('afternoon')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  turn === 'afternoon' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Moon className="w-4 h-4" />
                Vespertino
              </button>
            </div>

            <button
              onClick={requestPermission}
              className={cn(
                "p-3 rounded-xl transition-all border",
                permission === 'granted' 
                  ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
              )}
            >
              {permission === 'granted' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Real-time Clock Section */}
        <Clock 
          selectedTurn={turn} 
          selectedClass={selectedClass} 
          selectedDay={day} 
          schoolData={SCHOOL_DATA} 
        />

        {/* Horizontal Selectors */}
        <div className="space-y-6 mb-12">
          {/* Turn Selector (Mobile) */}
          <div className="md:hidden flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Turno</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTurn('morning')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all font-bold",
                  turn === 'morning' ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 bg-white/5 text-slate-400"
                )}
              >
                <Sun className="w-4 h-4" />
                Manhã
              </button>
              <button
                onClick={() => setTurn('afternoon')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all font-bold",
                  turn === 'afternoon' ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 bg-white/5 text-slate-400"
                )}
              >
                <Moon className="w-4 h-4" />
                Tarde
              </button>
            </div>
          </div>

          {/* Class Selector - Horizontal Scroll */}
          {scheduleView === 'single' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
                <Users className="w-3 h-3" /> Turma
              </label>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {Object.keys(SCHOOL_DATA[turn]).map((className) => (
                  <button
                    key={className}
                    onClick={() => setSelectedClass(className)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border transition-all font-bold text-[11px] whitespace-nowrap",
                      selectedClass === className 
                        ? "border-blue-500 bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10" 
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                    )}
                  >
                    {className}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day Selector - Horizontal Scroll */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
              <Calendar className="w-3 h-3" /> Dia da Semana
            </label>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg border transition-all font-bold text-[10px] whitespace-nowrap",
                    day === d 
                      ? "border-white bg-white text-slate-900 shadow-lg" 
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Schedule Content */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h2 className="text-2xl font-bold text-white font-syne">Quadro de Horários</h2>
            <div className="flex items-center gap-4">
              {/* View Type Toggle */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setScheduleView('single')}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", scheduleView === 'single' ? "bg-white/10 text-white" : "text-slate-500")}
                >
                  Turma
                </button>
                <button 
                  onClick={() => setScheduleView('integral')}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", scheduleView === 'integral' ? "bg-white/10 text-white" : "text-slate-500")}
                >
                  Integral
                </button>
              </div>

              {/* Layout Toggle (Only for single view) */}
              {scheduleView === 'single' && (
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white/10 text-blue-400" : "text-slate-500")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white/10 text-blue-400" : "text-slate-500")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {scheduleView === 'single' ? (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {timeSlots.map((slot, index) => {
                  const subject = currentSchedule[slot];
                  const isInterval = slot === '09:45–10:00' || slot === '15:15–15:30';
                  
                  return (
                    <motion.div
                      key={`${selectedClass}-${day}-${slot}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "relative overflow-hidden p-6 rounded-3xl border transition-all group",
                        isInterval 
                          ? "bg-amber-500/10 border-amber-500/20" 
                          : subject 
                            ? "glass hover:bg-white/5 border-white/10 hover:border-blue-500/30 shadow-lg" 
                            : "bg-white/5 border-dashed border-white/10 opacity-50"
                      )}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                            isInterval ? "bg-amber-500/20 text-amber-400" : subject ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-slate-500"
                          )}>
                            <ClockIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 mb-0.5">{slot}</p>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                              {isInterval ? 'Intervalo' : subject?.name || 'Vago'}
                            </h3>
                          </div>
                        </div>

                        {subject && !isInterval && (
                          <div className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold border",
                            subject.color.replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-opacity-90 text-')
                          )}>
                            {subject.teacher}
                          </div>
                        )}
                      </div>

                      {/* Decorative elements */}
                      {!isInterval && subject && (
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-16 text-center">Horário</th>
                    {Object.keys(SCHOOL_DATA[turn]).map(className => (
                      <th key={className} className="p-2 text-xs font-bold text-white text-center">{className}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {timeSlots.map((slot) => {
                    const isInterval = slot === '09:45–10:00' || slot === '15:15–15:30';
                    return (
                      <tr key={slot} className="hover:bg-white/5 transition-colors">
                        <td className="p-2 text-[10px] font-mono font-medium text-slate-400 whitespace-nowrap text-center">
                          {slot}
                        </td>
                        {isInterval ? (
                          <td colSpan={Object.keys(SCHOOL_DATA[turn]).length} className="p-2 text-center">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 shadow-sm">
                              <ClockIcon className="w-2.5 h-2.5" />
                              Intervalo
                            </div>
                          </td>
                        ) : (
                          Object.keys(SCHOOL_DATA[turn]).map(className => {
                            const subject = SCHOOL_DATA[turn][className][day]?.[slot];
                            return (
                              <td key={className} className="p-1 text-center">
                                {subject ? (
                                  <div className={cn(
                                    "inline-flex flex-col items-center justify-center w-full min-h-[48px] p-1.5 rounded-lg border shadow-sm transition-all hover:scale-[1.02]",
                                    subject.color.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-opacity-90 text-')
                                  )}>
                                    <span className="text-[11px] font-bold leading-none mb-0.5">{subject.name}</span>
                                    <span className="text-[9px] font-medium opacity-80">{subject.teacher}</span>
                                  </div>
                                ) : (
                                  <div className="w-full min-h-[48px] rounded-lg border border-dashed border-white/10 flex items-center justify-center bg-white/5">
                                    <span className="text-[10px] text-slate-600 font-medium">Vago</span>
                                  </div>
                                )}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Diary Section */}
          <Diary selectedClass={selectedClass} selectedDay={day} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-4 py-2 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-[10px] font-bold tracking-wide">
          <p>Desenvolvido pelo Profº Sérgio Araújo 2026</p>
        </div>
      </footer>

      {/* PWA Install Banner */}
      <PWAInstall />
    </div>
  );
}
