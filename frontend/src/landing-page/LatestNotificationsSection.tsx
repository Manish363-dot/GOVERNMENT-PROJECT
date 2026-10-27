import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { LATEST_UPDATES_DATA, NotificationUpdateItem } from './media/media.data';

export const LatestNotificationsSection: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));
  const [isExpanded, setIsExpanded] = useState(false);

  // Initial display shows first 2 notifications (matching design), expanding reveals all
  const displayedItems = isExpanded
    ? LATEST_UPDATES_DATA
    : LATEST_UPDATES_DATA.slice(0, 2);

  return (
    <section id="updates" className="relative pt-6 pb-16 sm:pb-20 bg-slate-50">
      {/* Anchor duplicates for smooth compatibility */}
      <div id="social-engagement" className="absolute -top-16 left-0 h-1 w-1 pointer-events-none" />
      <div id="notifications" className="absolute -top-16 left-0 h-1 w-1 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading - Matching all other sections and pages */}
        <div className="text-left mb-6 sm:mb-8 flex flex-col items-start">
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 leading-tight">
            {isHi ? 'नवीनतम सूचनाएं' : 'Latest Notifications'}
          </h2>
          <div className="h-1 w-20 bg-amber-400 rounded-full mt-3" />
        </div>

        {/* Main Card Container with Notification items */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7">
          
          {/* List of Notification Cards */}
          <div className="space-y-3.5 sm:space-y-4">
            {displayedItems.map((item: NotificationUpdateItem) => {
              const title = isHi ? (item.titleHi || item.titleEn) : (item.titleEn || item.titleHi);
              const place = isHi ? (item.placeHi || item.placeEn) : (item.placeEn || item.placeHi);
              const department = isHi ? (item.departmentHi || item.departmentEn) : (item.departmentEn || item.departmentHi);
              const description = isHi ? (item.descriptionHi || item.descriptionEn) : (item.descriptionEn || item.descriptionHi);
              const tag = isHi ? (item.tagHi || item.tagEn) : (item.tagEn || item.tagHi);

              const hasMeta = Boolean(item.date || place || department || tag);

              return (
                <div
                  key={item.id}
                  className="relative bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 border-l-4 border-l-blue-600"
                >
                  {/* Title (Prominent Bold) */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {title}
                  </h3>

                  {/* Flexible Metadata Fields (only render if present) */}
                  {hasMeta && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500">
                      {/* Date (if available) */}
                      {item.date && (
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.date}</span>
                        </span>
                      )}

                      {/* Place (if available) */}
                      {place && (
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{place}</span>
                        </span>
                      )}

                      {/* Department (if available) */}
                      {department && (
                        <span className="font-medium text-slate-500">
                          • {department}
                        </span>
                      )}

                      {/* Tag/Pill (if available) */}
                      {tag && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
                          {tag}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description / Summary (if available) */}
                  {description && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Toggle Expand / Collapse Button (at bottom center, as shown in screenshot) */}
          {LATEST_UPDATES_DATA.length > 2 && (
            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-1.5 px-4 rounded-lg hover:bg-blue-50/70"
              >
                <span>
                  {isExpanded
                    ? (isHi ? 'कम सूचनाएं देखें ▲' : 'View Less Notifications ▲')
                    : (isHi ? 'सभी सूचनाएं देखें ▼' : 'View All Notifications ▼')}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
});

LatestNotificationsSection.displayName = 'LatestNotificationsSection';
export default LatestNotificationsSection;
