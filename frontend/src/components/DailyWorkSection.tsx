import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Video, Calendar as CalendarIcon, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface DailyWork {
  id: string;
  url: string;
  type: string;
  date: string;
  description: string | null;
}

export function DailyWorkSection() {
  const { t } = useTranslation();
  const [works, setWorks] = useState<DailyWork[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWork, setSelectedWork] = useState<DailyWork | null>(null);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const res = await fetch(`${API_URL}/media/daily-work`);
      if (res.ok) {
        const data = await res.json();
        setWorks(data);
        if (data.length > 0) {
          // If the selected date has a work, select it. Otherwise select the most recent one.
          const workForToday = data.find((w: DailyWork) => isSameDay(parseISO(w.date), new Date()));
          setSelectedWork(workForToday || data[0]); // Default to today or the most recent
          if (!workForToday) {
             setSelectedDate(parseISO(data[0].date));
             setCurrentMonth(parseISO(data[0].date));
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch daily works', e);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const work = works.find(w => isSameDay(parseISO(w.date), date));
    if (work) {
      setSelectedWork(work);
    } else {
      // If no work on this date, fallback to the most recent work
      if (works.length > 0) {
         setSelectedWork(works[0]);
      }
    }
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <section className="py-16 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight flex items-center justify-center gap-3">
            <CalendarIcon className="w-8 h-8 text-amber-500" />
            {t('nav.dailyWorkTitle', 'Daily Work Updates')}
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            {t('nav.dailyWorkDesc', 'Check out our day-to-day progress. Select a date on the calendar to see the work accomplished.')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200 overflow-hidden">
          
          {/* Left Side: Media & Details */}
          <div className="w-full lg:w-2/3 p-6 sm:p-8 flex flex-col h-full min-h-[400px]">
            {selectedWork ? (
              <div className="flex flex-col h-full animate-in fade-in duration-500">
                <div className="relative w-full aspect-video md:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                  {selectedWork.type === 'video' ? (
                    <video 
                      src={selectedWork.url} 
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img 
                      src={selectedWork.url} 
                      alt="Daily Work" 
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold tracking-wider flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                    {format(parseISO(selectedWork.date), 'dd MMMM yyyy')}
                  </div>
                </div>
                
                <div className="mt-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-navy-900 mb-2 border-b border-slate-100 pb-2">
                    Work Description
                  </h3>
                  <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex-1">
                    {selectedWork.description || 'No description provided for this date.'}
                  </p>
                  
                  {!isSameDay(parseISO(selectedWork.date), selectedDate) && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 text-amber-800 text-sm border border-amber-200 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 shrink-0" />
                      <span>No images uploaded for <strong>{format(selectedDate, 'dd MMM yyyy')}</strong>. Displaying the most recent update instead.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ImageIcon className="w-16 h-16 mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-500">No daily work updates available yet.</p>
              </div>
            )}
          </div>

          {/* Right Side: Calendar */}
          <div className="w-full lg:w-1/3 bg-slate-50 p-6 sm:p-8 lg:border-l border-t lg:border-t-0 border-slate-200 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-1">
                <button 
                  onClick={prevMonth}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextMonth}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const hasWork = works.some(w => isSameDay(parseISO(w.date), day));
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toString() + idx}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all relative",
                      !isCurrentMonth && "text-slate-300",
                      isCurrentMonth && !isSelected && "text-slate-700 hover:bg-slate-200",
                      isSelected && "bg-navy-900 text-white shadow-md scale-105",
                      isToday && !isSelected && "border-2 border-amber-400 text-amber-700",
                      hasWork && !isSelected && "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    )}
                  >
                    <span>{format(day, dateFormat)}</span>
                    {hasWork && (
                      <span className={cn(
                        "absolute bottom-1.5 w-1 h-1 rounded-full",
                        isSelected ? "bg-amber-400" : "bg-emerald-500"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span>
                <span>Work Update Available</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full bg-navy-900"></span>
                <span>Selected Date</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
