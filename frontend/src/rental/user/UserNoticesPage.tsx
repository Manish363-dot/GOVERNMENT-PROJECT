import React, { useState, useEffect } from 'react';
import { UserLayout } from './UserLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalNoticeApi, NoticeItem } from '../services/rentalNotice.service';
import {
  Bell,
  Calendar,
  AlertCircle,
  RefreshCw,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export const UserNoticesPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await rentalNoticeApi.listNotices({ limit: 50 });
      setNotices(res.data.data);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return (
    <UserLayout
      title={isHi ? 'सूचनाएं एवं परिपत्र' : 'Notices & Circulars'}
      subtitle={
        isHi
          ? 'जिला पंचायत अल्मोड़ा के सार्वजनिक आदेश, नियम, नीलामी सूचनाएं एवं व्यक्तिगत संदेश'
          : 'Public gazette orders, municipal bylaws, and direct tenant notifications'
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {isHi
              ? `कुल ${notices.length} सूचनाएं उपलब्ध हैं`
              : `Total ${notices.length} notices found`}
          </p>
          <button
            onClick={fetchNotices}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">{isHi ? 'सूचनाएं लोड हो रही हैं...' : 'Loading notices...'}</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">
              {isHi ? 'कोई सूचना उपलब्ध नहीं है' : 'No notices currently'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-700">
                        {n.noticeNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          n.category === 'PUBLIC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {n.category === 'PUBLIC'
                          ? isHi
                            ? 'सार्वजनिक'
                            : 'Public'
                          : isHi
                          ? 'व्यक्तिगत'
                          : 'Direct Notice'}
                      </span>
                      {n.priority === 'URGENT' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          URGENT
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};
