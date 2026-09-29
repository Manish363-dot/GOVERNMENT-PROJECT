import React, { useState, useEffect, useRef } from 'react';
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
  parseISO,
  getDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Image as ImageIcon, Clock, ArrowRight, FileText } from 'lucide-react';
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

  // Carousel state — show 2 cards at a time
  const [carouselIndex, setCarouselIndex] = useState(0);
  const cardsPerView = 2;
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchWorks();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (works.length <= cardsPerView) return;
    autoPlayRef.current = setInterval(() => {
      setCarouselIndex(prev => {
        const maxIndex = Math.max(0, works.length - cardsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [works]);

  const fetchWorks = async () => {
    try {
      const res = await fetch(`${API_URL}/media/daily-work`);
      if (res.ok) {
        const data = await res.json();
        setWorks(data);
        if (data.length > 0) {
          const workForToday = data.find((w: DailyWork) => isSameDay(parseISO(w.date), new Date()));
          setSelectedWork(workForToday || data[0]);
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
      // Also scroll carousel to this work
      const workIdx = works.indexOf(work);
      setCarouselIndex(Math.min(workIdx, Math.max(0, works.length - cardsPerView)));
    }
  };

  const handleCardClick = (work: DailyWork) => {
    setSelectedWork(work);
    setSelectedDate(parseISO(work.date));
    setCurrentMonth(parseISO(work.date));
  };

  const prevSlide = () => {
    setCarouselIndex(prev => Math.max(0, prev - 1));
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, works.length - cardsPerView);
    setCarouselIndex(prev => Math.min(maxIndex, prev + 1));
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const visibleCards = works.slice(carouselIndex, carouselIndex + cardsPerView);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <CalendarIcon className="w-4 h-4" />
            {t('nav.dailyWorkTitle', 'Daily Work Updates')}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">
            {t('nav.dailyWorkHeading', 'Our Day-to-Day Progress')}
          </h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto text-sm">
            {t('nav.dailyWorkDesc', 'Check out our day-to-day progress. Select a date on the calendar to see the work accomplished.')}
          </p>
        </div>

        {/* Main Content: Carousel + Calendar */}
        <div className="flex flex-col lg:flex-row gap-0 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200/80 overflow-hidden">

          {/* LEFT: Card Carousel */}
          <div className="w-full lg:w-[60%] p-5 sm:p-6 flex flex-col">

            {works.length > 0 ? (
              <>
                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-[320px]">
                  {visibleCards.map((work) => {
                    const isActive = selectedWork?.id === work.id;
                    return (
                      <div
                        key={work.id}
                        onClick={() => handleCardClick(work)}
                        className={cn(
                          "rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col bg-white border group",
                          isActive 
                            ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20" 
                            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                        )}
                      >
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          {work.type === 'video' ? (
                            <video
                              src={work.url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              autoPlay
                              playsInline
                            />
                          ) : work.type === 'document' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50">
                              <FileText className="w-16 h-16 text-blue-400 mb-3" />
                              <a href={work.url} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                                Open Document
                              </a>
                            </div>
                          ) : (
                            <img
                              src={work.url}
                              alt="Daily Work"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                          {/* Date Badge */}
                          <div className="absolute top-3 left-3">
                            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm border border-white/50">
                              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                {format(parseISO(work.date), 'MMM')}
                              </p>
                              <p className="text-lg font-black text-navy-900 leading-tight -mt-0.5">
                                {format(parseISO(work.date), 'dd')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3.5 flex-1 flex flex-col">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{format(parseISO(work.date), 'dd MMMM yyyy')}</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-snug line-clamp-3 flex-1">
                            {work.description || 'Daily work update — click to view details.'}
                          </p>
                          <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold mt-2.5 group-hover:gap-2 transition-all">
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Carousel Navigation */}
                <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={prevSlide}
                    disabled={carouselIndex === 0}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border transition-all",
                      carouselIndex === 0 
                        ? "border-slate-200 text-slate-300 cursor-not-allowed" 
                        : "border-slate-300 text-slate-600 hover:bg-navy-900 hover:text-white hover:border-navy-900"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Dot indicators */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.max(1, works.length - cardsPerView + 1) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={cn(
                          "transition-all duration-300 rounded-full",
                          i === carouselIndex 
                            ? "w-6 h-2 bg-blue-600" 
                            : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                        )}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    disabled={carouselIndex >= works.length - cardsPerView}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border transition-all",
                      carouselIndex >= works.length - cardsPerView
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-blue-500 text-white bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-slate-400">
                <ImageIcon className="w-16 h-16 mb-4 text-slate-200" />
                <p className="font-medium text-slate-500">No daily work updates available yet.</p>
              </div>
            )}
          </div>

          {/* RIGHT: Calendar */}
          <div className="w-full lg:w-[40%] bg-gradient-to-b from-sky-50/80 to-blue-50/50 lg:border-l border-t lg:border-t-0 border-slate-200 p-5 sm:p-6 flex flex-col">
            
            {/* Month Header */}
            <div className="flex items-center justify-between mb-5">
              <button 
                onClick={prevMonth}
                className="w-8 h-8 rounded-md flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-base font-extrabold text-navy-900 uppercase tracking-wider">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button 
                onClick={nextMonth}
                className="w-8 h-8 rounded-md flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekDays.map((day, i) => (
                <div 
                  key={day} 
                  className={cn(
                    "text-center text-[11px] font-bold tracking-wider py-2.5 border-b-2",
                    i === 0 ? "text-red-500 border-red-200" : "text-slate-500 border-slate-200"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1">
              {days.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const hasWork = works.some(w => isSameDay(parseISO(w.date), day));
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const isSunday = getDay(day) === 0;

                return (
                  <button
                    key={day.toString() + idx}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "relative flex items-center justify-center py-2.5 text-sm font-semibold transition-all border-b border-slate-100",
                      !isCurrentMonth && "text-slate-300",
                      isCurrentMonth && !isSelected && !isToday && !isSunday && "text-slate-700 hover:bg-blue-50",
                      isSunday && isCurrentMonth && !isSelected && "text-red-500",
                      isToday && !isSelected && "text-white bg-blue-600 rounded-md mx-0.5",
                      isSelected && "text-white bg-navy-900 rounded-md mx-0.5 shadow-md",
                      hasWork && !isSelected && !isToday && isCurrentMonth && "text-emerald-700 font-bold"
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasWork && isCurrentMonth && (
                      <span className={cn(
                        "absolute bottom-0.5 w-1.5 h-1.5 rounded-full",
                        isSelected || isToday ? "bg-amber-400" : "bg-emerald-500"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500"></span>
                <span className="font-medium">Work Updated</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3.5 h-3.5 rounded-sm bg-red-500"></span>
                <span className="font-medium">Sunday / Holiday</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3.5 h-3.5 rounded-sm bg-blue-600"></span>
                <span className="font-medium">Today</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
