import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalUserApi } from '../services/rentalUser.service';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const TenantProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTenant = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const res = await rentalUserApi.getTenantDetails(id);
        setTenant(res.data);
      } catch (err: any) {
        setError(err.message || (isHi ? 'किरायेदार विवरण लोड करने में असमर्थ' : 'Failed to load tenant details'));
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-bold text-slate-600">{isHi ? 'विवरण लोड हो रहा है...' : 'Loading tenant details...'}</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <AdminLayout
        title={isHi ? 'किरायेदार विवरण' : 'Tenant Details'}
        breadcrumbs={[
          { label: isHi ? 'किरायेदार' : 'Tenants', to: '/rental/admin/tenants' },
          { label: 'Not Found' },
        ]}
      >
        <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl text-center border border-slate-200">
          <p className="text-sm text-rose-600 font-bold mb-4">{error || 'Tenant not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/rental/admin/tenants')}
            className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800"
          >
            {isHi ? 'किरायेदार सूची पर वापस जाएं' : 'Back to Tenant List'}
          </button>
        </div>
      </AdminLayout>
    );
  }

  const activeAssignment = tenant.assignments?.find((a: any) => a.is_active) || tenant.assignments?.[0];

  return (
    <AdminLayout
      title={isHi ? 'किरायेदार प्रोफ़ाइल विवरण' : 'Tenant Profile & Asset Details'}
      breadcrumbs={[
        { label: isHi ? 'किरायेदार प्रबंधन' : 'Tenants', to: '/rental/admin/tenants' },
        { label: tenant.full_name || tenant.fullName || 'Tenant' },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/tenants')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? 'किरायेदार सूची पर वापस जाएं' : 'Back to Tenants List'}</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{tenant.status || 'ACTIVE'}</span>
          </span>
        </div>

        {/* 1. Tenant Overview Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          {tenant.profile_photo_url ? (
            <img
              src={tenant.profile_photo_url}
              alt={tenant.full_name}
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-900 font-extrabold text-2xl flex items-center justify-center border-4 border-slate-100">
              {(tenant.full_name || 'T').charAt(0)}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-navy-950">{tenant.full_name || tenant.fullName}</h1>
            <p className="font-mono text-xs font-bold text-navy-900 mt-0.5">
              User ID: <span className="bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{tenant.user_id || tenant.userCode}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span>📱 {tenant.mobile}</span>
              {tenant.email && <span>✉️ {tenant.email}</span>}
              <span>•</span>
              <span>कुल बकाया: <strong className="text-rose-600 font-bold">₹{Number(tenant.outstanding_balance ?? tenant.outstandingBalance ?? 0).toLocaleString('en-IN')}</strong></span>
            </p>
          </div>
        </div>

        {/* 2. Official Assigned Property */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>{isHi ? 'आवंटित दुकान / संपत्ति विवरण' : 'Allocated Commercial Shop / Asset'}</span>
          </h2>

          {activeAssignment?.property ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-medium block">{isHi ? 'दुकान संख्या:' : 'Shop Number:'}</span>
                <span className="text-sm font-extrabold text-navy-950">{activeAssignment.property.property_number || activeAssignment.property.property_id}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">{isHi ? 'बाजार / स्थान:' : 'Market Location:'}</span>
                <span className="text-sm font-bold text-slate-800">{activeAssignment.property.location}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">{isHi ? 'मासिक किराया दर:' : 'Monthly Rent:'}</span>
                <span className="text-sm font-extrabold text-emerald-700">₹{Number(activeAssignment.monthly_rent || activeAssignment.property.base_monthly_rent || 0).toLocaleString('en-IN')}/माह</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">{isHi ? 'वर्तमान में कोई सक्रिय दुकान आवंटित नहीं है।' : 'No property currently assigned.'}</p>
          )}
        </div>

        {/* 3. Address & Identity Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{isHi ? 'पता एवं पहचान विवरण' : 'Address & Identification'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold mb-0.5">{isHi ? 'स्थायी पता:' : 'Permanent Address:'}</span>
              <span className="font-bold text-slate-900">{tenant.permanent_address || tenant.permanentAddress}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold mb-0.5">{isHi ? 'वर्तमान पता:' : 'Current Address:'}</span>
              <span className="font-bold text-slate-900">{tenant.current_address || tenant.currentAddress || tenant.permanent_address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Aadhaar (Masked):</span>
              <span className="font-mono font-bold text-slate-900">{tenant.aadhaar_masked || 'XXXX-XXXX-****'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">PAN (Masked):</span>
              <span className="font-mono font-bold text-slate-900">{tenant.pan_masked || 'XXXXX****X'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-slate-500 block font-semibold">GSTIN:</span>
              <span className="font-mono font-bold text-slate-900">{tenant.gst_number || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* 4. Uploaded Identity Documents */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>{isHi ? 'अपलोड किए गए पहचान व अनुबंध दस्तावेज़' : 'Uploaded Verification Documents'}</span>
          </h2>

          {tenant.documents && tenant.documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tenant.documents.map((doc: any) => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{doc.doc_type || 'DOCUMENT'}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{doc.file_name}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const urlRes = await rentalUserApi.getSecureDocumentUrl(doc.id);
                        if (urlRes?.data?.presignedUrl) {
                          window.open(urlRes.data.presignedUrl, '_blank');
                        }
                      } catch {
                        alert('Unable to load document url');
                      }
                    }}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-blue-700 transition-colors"
                    title="View Document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">{isHi ? 'कोई दस्तावेज़ अपलोड नहीं है।' : 'No documents uploaded.'}</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TenantProfilePage;
