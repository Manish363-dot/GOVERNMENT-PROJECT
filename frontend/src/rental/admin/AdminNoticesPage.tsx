import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminConfirmModal } from './AdminConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import {
  rentalNoticeApi,
  NoticeItem,
  NoticeListResponse,
  CreateNoticeInput,
  WhatsAppApiStatus,
} from '../services/rentalNotice.service';
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
  MessageCircle,
  ExternalLink,
  Send,
} from 'lucide-react';

export const AdminNoticesPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const initialNoticeCache = api.peekCache<{ data: NoticeListResponse }>(
    '/rental/notices?category=ALL&page=1&limit=15'
  )?.data;
  const [notices, setNotices] = useState<NoticeItem[]>(initialNoticeCache?.data || []);
  const [total, setTotal] = useState(initialNoticeCache?.total || 0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(!initialNoticeCache);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [waStatus, setWaStatus] = useState<WhatsAppApiStatus | null>(null);
  const [sendingWaId, setSendingWaId] = useState<string | null>(null);
  const [whatsappBanner, setWhatsappBanner] = useState<{
    url: string;
    mobile: string;
    tenantName: string;
    sentViaApi: boolean;
    messageId?: string;
    error?: string;
  } | null>(null);

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

  const refreshWaStatus = () => {
    rentalNoticeApi
      .getWhatsAppStatus()
      .then((res) => {
        if (res?.data) setWaStatus(res.data);
      })
      .catch(() => {
        // Ignore status indicator failures
      });
  };

  const fetchNotices = async (force = false) => {
    if (force) {
      api.invalidateCache('/rental/notices');
      refreshWaStatus();
    }
    if (force || notices.length === 0) setLoading(true);
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
    fetchNotices(false);
  }, [page, categoryFilter]);

  useEffect(() => {
    refreshWaStatus();
  }, []);

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

  const selectedTenantObj = tenants.find((t) => t.id === newNotice.recipientUserId);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNotice.category === 'INDIVIDUAL' && !newNotice.recipientUserId) {
      setError(isHi ? 'कृपया किरायेदार चुनें।' : 'Please select a recipient tenant.');
      return;
    }

    setSubmitting(true);
    setError('');
    setWhatsappBanner(null);
    try {
      const payload: CreateNoticeInput = {
        ...newNotice,
        recipientUserId: newNotice.category === 'INDIVIDUAL' ? newNotice.recipientUserId : undefined,
      };
      const res = await rentalNoticeApi.createNotice(payload);
      const created = res.data;

      if (newNotice.category === 'INDIVIDUAL' && created?.whatsapp) {
        const wa = created.whatsapp;
        const recipientName = created.recipient?.fullName || selectedTenantObj?.fullName || '';
        setWhatsappBanner({
          url: wa.whatsappUrl,
          mobile: wa.mobile,
          tenantName: recipientName,
          sentViaApi: Boolean(wa.sent),
          messageId: wa.messageId,
          error: wa.error,
        });
        setSuccessMsg(
          wa.sent
            ? isHi
              ? `व्यक्तिगत सूचना जारी की गई और Meta WhatsApp API से ${recipientName} (+91 ${wa.mobile}) को स्वतः भेजी गई${wa.messageId ? ` (ID: ${wa.messageId})` : ''}।`
              : `Individual notice published & dispatched via Meta WhatsApp API to ${recipientName} (+91 ${wa.mobile})${wa.messageId ? ` (ID: ${wa.messageId})` : ''}.`
            : isHi
            ? `सूचना सुरक्षित हो गई है, लेकिन Meta WhatsApp API डिलीवरी नहीं हो सकी: ${wa.error || 'अज्ञात त्रुटि'}`
            : `Notice published, but Meta WhatsApp API dispatch failed: ${wa.error || 'Unknown error'}`
        );
      } else {
        setSuccessMsg(
          isHi
            ? 'सार्वजनिक सूचना सफलतापूर्वक जारी की गई (रेंटल पोर्टल होम पेज पर लाइव)।'
            : 'Public notice published and live on the Rental Portal home page.'
        );
      }

      setIsModalOpen(false);
      setNewNotice({
        title: '',
        message: '',
        category: 'PUBLIC',
        priority: 'NORMAL',
        recipientUserId: tenants[0]?.id,
      });
      fetchNotices(true);
    } catch (err: any) {
      setError(err.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noticeId: string | null;
    title: string;
    loading: boolean;
  }>({
    isOpen: false,
    noticeId: null,
    title: '',
    loading: false,
  });

  const requestDeleteNotice = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      noticeId: id,
      title,
      loading: false,
    });
  };

  const handleConfirmDeleteNotice = async () => {
    if (!deleteModal.noticeId) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await rentalNoticeApi.deleteNotice(deleteModal.noticeId);
      setSuccessMsg(isHi ? 'सूचना हटा दी गई।' : 'Notice deleted successfully.');
      setDeleteModal({ isOpen: false, noticeId: null, title: '', loading: false });
      fetchNotices(true);
    } catch (err: any) {
      setError(err.message || 'Failed to delete notice.');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSendViaMetaApi = async (notice: NoticeItem) => {
    setSendingWaId(notice.id);
    setError('');
    setSuccessMsg('');
    setWhatsappBanner(null);
    try {
      const res = await rentalNoticeApi.sendWhatsAppNotice(notice.id);
      const wa = res.data;
      refreshWaStatus();
      const recipientName = notice.recipient?.fullName || '';
      setWhatsappBanner({
        url: wa.whatsappUrl,
        mobile: wa.mobile,
        tenantName: recipientName,
        sentViaApi: Boolean(wa.sent),
        messageId: wa.messageId,
        error: wa.error,
      });
      if (wa.sent) {
        setSuccessMsg(
          isHi
            ? `${notice.noticeNumber} को Meta WhatsApp API से ${recipientName} (+91 ${wa.mobile}) पर भेज दिया गया${wa.messageId ? ` (ID: ${wa.messageId})` : ''}।`
            : `${notice.noticeNumber} sent via Meta WhatsApp API to ${recipientName} (+91 ${wa.mobile})${wa.messageId ? ` (ID: ${wa.messageId})` : ''}.`
        );
      } else {
        setError(
          isHi
            ? `Meta WhatsApp API त्रुटि (${notice.noticeNumber}): ${wa.error || 'संदेश नहीं भेजा जा सका'}`
            : `Meta WhatsApp API error (${notice.noticeNumber}): ${wa.error || 'Could not dispatch message'}`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch via Meta WhatsApp API.');
    } finally {
      setSendingWaId(null);
    }
  };

  return (
    <AdminLayout
      title={isHi ? 'आधिकारिक सूचनाएं एवं परिपत्र' : 'Notices & Circulars'}
      breadcrumbs={[{ label: isHi ? 'सूचनाएं' : 'Notices' }]}
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <span>{isHi ? 'नई सूचना जारी करें' : 'Publish Notice'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
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
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div
            className={`p-3.5 border rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 ${
              whatsappBanner && !whatsappBanner.sentViaApi
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {whatsappBanner && !whatsappBanner.sentViaApi ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              )}
              <span>{successMsg}</span>
            </div>
            {whatsappBanner && !whatsappBanner.sentViaApi && whatsappBanner.url && (
              <a
                href={whatsappBanner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>
                  {isHi
                    ? `मैनुअल WhatsApp Web (+91 ${whatsappBanner.mobile})`
                    : `Manual WhatsApp Web (+91 ${whatsappBanner.mobile})`}
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
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
                    type="button"
                    onClick={() => requestDeleteNotice(notice.id, notice.title)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                    title={isHi ? 'सूचना हटाएं' : 'Delete Notice'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{notice.message}</p>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(notice.publishedAt).toLocaleDateString('en-IN')}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.recipient && (
                      <div className="text-slate-700 font-semibold">
                        {notice.recipient.fullName} ({notice.recipient.mobile})
                      </div>
                    )}
                    {notice.category === 'INDIVIDUAL' && notice.recipient?.mobile && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSendViaMetaApi(notice)}
                          disabled={sendingWaId === notice.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          {sendingWaId === notice.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>
                            {sendingWaId === notice.id
                              ? isHi
                                ? 'भेजा जा रहा है...'
                                : 'Sending...'
                              : isHi
                              ? 'WhatsApp API से भेजें'
                              : 'Send via WhatsApp API'}
                          </span>
                        </button>
                        {!waStatus?.configured && (
                          <a
                            href={
                              notice.whatsappUrl ||
                              `https://wa.me/91${notice.recipient.mobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                                `🏛️ कार्यालय जिला पंचायत अल्मोड़ा\nसूचना सं.: ${notice.noticeNumber}\nविषय: ${notice.title}\n\n${notice.message}`
                              )}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title={isHi ? 'WhatsApp Web से मैनुअल भेजें' : 'Manual WhatsApp Web Fallback'}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#16A34A] hover:border-emerald-200 transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Publish Notice */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
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
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'किरायेदार चुनें *' : 'Select Target Tenant *'}
                    </label>
                    <select
                      value={newNotice.recipientUserId || ''}
                      onChange={(e) => setNewNotice({ ...newNotice, recipientUserId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.mobile})
                        </option>
                      ))}
                    </select>
                    {selectedTenantObj?.mobile && (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 px-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>
                          {isHi
                            ? `यह सूचना सीधे +91 ${selectedTenantObj.mobile} के WhatsApp पर भेजी जाएगी।`
                            : `Notice will be dispatched to registered WhatsApp: +91 ${selectedTenantObj.mobile}`}
                        </span>
                      </p>
                    )}
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

        {/* Confirmation Dialog */}
        <AdminConfirmModal
          isOpen={deleteModal.isOpen}
          title={isHi ? 'आधिकारिक सूचना हटाएं' : 'Delete Notice'}
          message={
            isHi
              ? 'क्या आप वाकई इस आधिकारिक सूचना को पोर्टल से स्थायी रूप से हटाना चाहते हैं?'
              : 'Are you sure you want to permanently delete this official notice from the portal?'
          }
          subject={deleteModal.title || undefined}
          variant="danger"
          iconType="trash"
          confirmText={isHi ? 'हां, हटाएं' : 'Delete Notice'}
          denyText={isHi ? 'रद्द करें' : 'Cancel'}
          loading={deleteModal.loading}
          onConfirm={handleConfirmDeleteNotice}
          onDeny={() => setDeleteModal({ isOpen: false, noticeId: null, title: '', loading: false })}
        />
      </div>
    </AdminLayout>
  );
};
