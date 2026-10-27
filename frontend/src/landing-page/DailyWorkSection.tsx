import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar as CalendarIcon, Image as ImageIcon, Clock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const HINDI_MONTHS = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const HINDI_MONTHS_SHORT = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिसं'];

interface DailyWork {
  id: string;
  url: string;
  type: string;
  date: string;
  description: string | null;
}

export interface DailyWorkSectionProps {
  embedded?: boolean;
}

export const DailyWorkSection: React.FC<DailyWorkSectionProps> = React.memo(({ embedded = false }) => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [works, setWorks] = useState<DailyWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWork, setSelectedWork] = useState<DailyWork | null>(null);
  const [expandedWorkIds, setExpandedWorkIds] = useState<Record<string, boolean>>({});

  const toggleExpandWork = useCallback((id: string) => {
    setExpandedWorkIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  // Carousel state — responsive: 1 card on mobile, 2 on sm+
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(2);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update cardsPerView based on window width
  useEffect(() => {
    const updateCardsPerView = () => {
      setCardsPerView(window.innerWidth < 640 ? 1 : 2);
    };
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const fetchWorks = useCallback(async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

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
  }, [works.length]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    const work = works.find(w => isSameDay(parseISO(w.date), date));
    if (work) {
      setSelectedWork(work);
      // Also scroll carousel to this work
      const workIdx = works.indexOf(work);
      setCarouselIndex(Math.min(workIdx, Math.max(0, works.length - cardsPerView)));
    }
  }, [works]);

  const handleCardClick = useCallback((work: DailyWork) => {
    setSelectedWork(work);
    setSelectedDate(parseISO(work.date));
    setCurrentMonth(parseISO(work.date));
  }, []);

  const prevSlide = useCallback(() => {
    setCarouselIndex(prev => Math.max(0, prev - 1));
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, []);

  const nextSlide = useCallback(() => {
    const maxIndex = Math.max(0, works.length - cardsPerView);
    setCarouselIndex(prev => Math.min(maxIndex, prev + 1));
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, [works.length]);

  const prevMonth = useCallback(() => setCurrentMonth(prev => subMonths(prev, 1)), []);
  const nextMonth = useCallback(() => setCurrentMonth(prev => addMonths(prev, 1)), []);

  // Calendar
  const { monthStart, days } = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(start);
    const calStart = startOfWeek(start);
    const calEnd = endOfWeek(end);
    return {
      monthStart: start,
      days: eachDayOfInterval({ start: calStart, end: calEnd })
    };
  }, [currentMonth]);

  const weekDays = useMemo(() => isHi 
    ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'] 
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], 
    [isHi]
  );

  const visibleCards = useMemo(() => works.slice(carouselIndex, carouselIndex + cardsPerView), [works, carouselIndex]);

  const contentJSX = (
    <>
      <div id="blogs" className="absolute -top-20 left-0 h-1 w-1 pointer-events-none" />
      <div id="dailywork" className="absolute -top-20 left-0 h-1 w-1 pointer-events-none" />

      {/* Section Heading */}
      <div className="text-left mb-6 sm:mb-8 flex flex-col items-start">
        <h3 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 leading-tight">
          {isHi ? 'दैनिक कार्य' : 'Daily Operations'}
        </h3>
        <div className="h-1 w-20 bg-amber-400 rounded-full mt-3 mb-6" />
      </div>

      {/* Main Content: Carousel + Calendar */}
      <div className="flex flex-col lg:flex-row gap-0 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200/80 overflow-hidden">

        {/* LEFT: Card Carousel */}
        <div className="w-full lg:w-[60%] p-5 sm:p-6 flex flex-col">

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-[320px]">
              {[1, 2].map((idx) => (
                <div key={idx} className="animate-pulse bg-slate-100 rounded-2xl w-full h-80 flex flex-col justify-end p-5 sm:p-6 border border-slate-200">
                  <div className="h-4 w-28 bg-slate-200/80 rounded mb-3"></div>
                  <div className="h-6 w-3/4 bg-slate-200/80 rounded mb-2"></div>
                  <div className="h-6 w-1/2 bg-slate-200/80 rounded"></div>
                </div>
              ))}
            </div>
          ) : works.length > 0 ? (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-[320px]">
                {visibleCards.map((work) => {
                  const isActive = selectedWork?.id === work.id;
                  const dateObj = parseISO(work.date);
                  const monthBadge = isHi ? HINDI_MONTHS_SHORT[dateObj.getMonth()] : format(dateObj, 'MMM');
                  const dateFormatted = isHi 
                    ? `${format(dateObj, 'dd')} ${HINDI_MONTHS[dateObj.getMonth()]} ${format(dateObj, 'yyyy')}`
                    : format(dateObj, 'dd MMMM yyyy');

                  const isExpanded = !!expandedWorkIds[work.id];
                  const description = work.description || (isHi ? 'दैनिक कार्य विवरण' : 'Daily work update details');
                  const isLong = description.length > 55;

                  return (
                    <div
                      key={work.id}
                      onClick={() => handleCardClick(work)}
                      className={cn(
                        "group/card relative h-64 sm:h-80 w-full overflow-hidden border-0 rounded-2xl cursor-pointer transition-all duration-300 shadow-md",
                        isActive
                          ? "ring-2 ring-blue-500 shadow-xl shadow-blue-500/20"
                          : "hover:shadow-2xl"
                      )}
                    >
                      {/* Media Background */}
                      {work.type === 'video' ? (
                        <video
                          src={work.url}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover/card:scale-110"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : work.type === 'document' ? (
                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 transition-transform duration-500 group-hover/card:scale-110">
                          <FileText className="w-16 h-16 text-blue-400/80 mb-3 drop-shadow-sm" />
                        </div>
                      ) : (
                        <img
                          src={work.url}
                          alt="Daily Work"
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover/card:scale-110"
                          loading="lazy"
                          decoding="async"
                        />
                      )}

                      {/* Background fade effects */}
                      <div className={cn(
                        "absolute inset-x-0 bottom-0 transition-all duration-300 pointer-events-none",
                        isExpanded
                          ? "h-full bg-black/85 backdrop-blur-xs"
                          : "h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover/card:from-black/90"
                      )} />

                      {/* Status Icon (Top Right) */}
                      {work.type === 'document' && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-white/20 backdrop-blur-md rounded-full p-2 text-white border border-white/30">
                            <FileText className="w-4 h-4" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative flex h-full flex-col justify-end p-5 sm:p-6 z-10 pointer-events-none">
                        <div className={cn(
                          "flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-2 drop-shadow-md leading-normal pt-0.5",
                          !isHi && "uppercase tracking-wider"
                        )}>
                          <span>{dateFormatted}</span>
                        </div>

                        {/* Description with inline View More / View Less */}
                        <div className="pointer-events-auto">
                          <h4 className={cn(
                            "text-base sm:text-lg font-bold text-white leading-[1.55] drop-shadow-lg group-hover/card:text-amber-50 transition-all duration-200 pt-0.5",
                            !isExpanded && "line-clamp-2",
                            isExpanded && "max-h-44 overflow-y-auto pr-1 font-medium text-sm sm:text-base",
                            isHi && "font-hind"
                          )}>
                            {description}
                          </h4>

                          {isLong && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandWork(work.id);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer mt-1.5 focus:outline-none drop-shadow-md select-none"
                            >
                              <span>
                                {isExpanded 
                                  ? (isHi ? 'कम देखें' : 'View Less') 
                                  : (isHi ? 'और पढ़ें' : 'View More')}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
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
                    "w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                    carouselIndex === 0
                      ? "border-slate-200 text-slate-300 cursor-not-allowed"
                      : "border-slate-300 text-slate-600 hover:bg-navy-900 hover:text-white hover:border-navy-900"
                  )}
                  aria-label="Previous work"
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
                        "transition-all duration-300 rounded-full cursor-pointer",
                        i === carouselIndex
                          ? "w-6 h-2 bg-blue-600"
                          : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                      )}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  disabled={carouselIndex >= works.length - cardsPerView}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                    carouselIndex >= works.length - cardsPerView
                      ? "border-slate-200 text-slate-300 cursor-not-allowed"
                      : "border-blue-500 text-white bg-blue-600 hover:bg-blue-700"
                  )}
                  aria-label="Next work"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-slate-400">
              <ImageIcon className="w-16 h-16 mb-4 text-slate-200" />
              <p className="font-medium text-slate-500">
                {isHi ? 'वर्तमान में कोई दैनिक कार्य अपडेट उपलब्ध नहीं है।' : 'No daily work updates available yet.'}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Calendar */}
        <div className="w-full lg:w-[40%] bg-gradient-to-b from-sky-50/80 to-blue-50/50 lg:border-l border-t lg:border-t-0 border-slate-200 p-5 sm:p-6 flex flex-col">

          {/* Month Header */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-md flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h4 className={cn(
              "text-base sm:text-lg font-bold text-navy-900 leading-normal pt-1.5 pb-0.5 px-2 select-none text-center",
              !isHi && "uppercase tracking-wider"
            )}>
              {isHi ? `${HINDI_MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}` : format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-md flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
              aria-label="Next month"
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
                  "text-center text-[11px] font-bold py-2 border-b-2 leading-normal",
                  !isHi && "tracking-wider",
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
                    "relative flex items-center justify-center py-2.5 text-sm font-semibold transition-all border-b border-slate-100 cursor-pointer",
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
              <span className="font-medium">{isHi ? 'कार्य विवरण दर्ज' : 'Work Updated'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3.5 h-3.5 rounded-sm bg-red-500"></span>
              <span className="font-medium">{isHi ? 'रविवार / अवकाश' : 'Sunday / Holiday'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3.5 h-3.5 rounded-sm bg-blue-600"></span>
              <span className="font-medium">{isHi ? 'आज' : 'Today'}</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );

  if (embedded) {
    return (
      <div id="daily-work" className="relative scroll-mt-24">
        {contentJSX}
      </div>
    );
  }

  return (
    <section id="daily-work" className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {contentJSX}
      </div>
    </section>
  );
});

DailyWorkSection.displayName = 'DailyWorkSection';
