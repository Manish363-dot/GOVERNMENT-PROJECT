import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalNoticeApi, NoticeItem, CreateNoticeInput } from '../services/rentalNotice.service';
import { rentalUserApi, TenantListItem } from '../services/rentalUser.service';
import {
  Bell,
  PlusCircle,
  Filter,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AdminNoticesPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState<CreateNoticeInput>({
    title: '',
    message: '',
    category: 'PUBLIC',
    priority: 'NORMAL',
  });
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalNoticeApi.listNotices({
        category: categoryFilter,
        search,
        page,
        limit: 15,
      });
      if (res && res.data) {
        setNotices(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [page, categoryFilter]);

  const loadTenants = async () => {
    try {
      const res = await rentalUserApi.listTenants({ limit: 100 });
      setTenants(res.data.data);
      if (res.data.data.length > 0 && !newNotice.recipientUserId) {
        setNewNotice((prev) => ({ ...prev, recipientUserId: res.data.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
    loadTenants();
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await rentalNoticeApi.createNotice(newNotice);
      setSuccessMsg(isHi ? 'सूचना सफलतापूर्वक जारी की गई।' : 'Notice published successfully.');
      setIsModalOpen(false);
      setNewNotice({
        title: '',
        message: '',
        category: 'PUBLIC',
        priority: 'NORMAL',
      });
      fetchNotices();
    } catch (err: any) {
      setError(err.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm(isHi ? 'क्या आप वाकई इस सूचना को हटाना चाहते हैं?' : 'Are you sure you want to delete this notice?')) {
      return;
    }
    try {
      await rentalNoticeApi.deleteNotice(id);
      setSuccessMsg(isHi ? 'सूचना हटा दी गई।' : 'Notice deleted successfully.');
      fetchNotices();
    } catch (err: any) {
      setError(err.message || 'Failed to delete notice.');
    }
  };

  return (
    <AdminLayout
      title={isHi ? 'आधिकारिक सूचनाएं एवं परिपत्र' : 'Public & Tenant Notices Management'}
      subtitle={
        isHi
          ? 'जिला पंचायत अल्मोड़ा के सार्वजनिक आदेश, निविदा सूचनाएं एवं व्यक्तिगत किरायेदार संदेश'
          : 'Issue public gazette notices, auction alerts, and private tenant notifications'
      }
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isHi ? 'नई सूचना जारी करें' : 'Publish Notice'}</span>
            </button>
            <button
              onClick={fetchNotices}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">{isHi ? 'सभी श्रेणियां' : 'All Categories'}</option>
              <option value="PUBLIC">{isHi ? 'सार्वजनिक सूचना' : 'Public Notices'}</option>
              <option value="INDIVIDUAL">{isHi ? 'व्यक्तिगत किरायेदार' : 'Individual Tenant'}</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Notices Cards List */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-xs">{isHi ? 'सूचनाएं लोड हो रही हैं...' : 'Loading notices...'}</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">
              {isHi ? 'कोई सूचना नहीं मिली' : 'No notices issued yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-700">
                        {notice.noticeNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          notice.category === 'PUBLIC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {notice.category}
                      </span>
                      {notice.priority === 'URGENT' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          URGENT
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">{notice.title}</h4>
                  </div>

                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{notice.message}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(notice.publishedAt).toLocaleDateString()}</span>
                  </div>

                  {notice.recipient && (
                    <div className="text-slate-600 font-medium">
                      Recipient: {notice.recipient.fullName} ({notice.recipient.userCode})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Publish Notice */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'नई सूचना जारी करें' : 'Publish Notice / Circular'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'सूचना का शीर्षक *' : 'Notice Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    placeholder="e.g., Notice regarding Annual Rent Revision 2026-27"
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'श्रेणी *' : 'Category *'}
                    </label>
                    <select
                      value={newNotice.category}
                      onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="PUBLIC">Public Notice (सार्वजनिक)</option>
                      <option value="INDIVIDUAL">Individual Tenant (व्यक्तिगत)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'प्राथमिकता' : 'Priority'}
                    </label>
                    <select
                      value={newNotice.priority}
                      onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="IMPORTANT">Important</option>
                      <option value="URGENT">Urgent (अति आवश्यक)</option>
                    </select>
                  </div>
                </div>

                {newNotice.category === 'INDIVIDUAL' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'किरायेदार चुनें *' : 'Select Target Tenant *'}
                    </label>
                    <select
                      value={newNotice.recipientUserId}
                      onChange={(e) => setNewNotice({ ...newNotice, recipientUserId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.userCode} - {t.mobile})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'सूचना का विस्तृत विवरण *' : 'Notice Body / Message *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newNotice.message}
                    onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                    placeholder="Enter the full circular text or reminder message..."
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl transition disabled:opacity-50"
                  >
                    {submitting
                      ? isHi
                        ? 'जारी कर रहे हैं...'
                        : 'Publishing...'
                      : isHi
                      ? 'सूचना जारी करें'
                      : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
