import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { rentalBillingApi, DashboardAnalytics } from "../services/rentalBilling.service";
import {
  Revenue3DBarChart,
  RevenuePatternAreaChart,
  PropertyPatternDonutChart,
  MunicipalRadialScoresChart,
} from "./components/RentalCharts";
import { Landmark, Download, Printer, ArrowRight, RefreshCw } from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await rentalBillingApi.getAnalytics();
      if (res && res.data) setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load dashboard analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const formatCurrency = (amount: number) =>
    "₹" + Number(amount || 0).toLocaleString("en-IN");

  const downloadTodayAuditCSV = () => {
    if (!analytics?.todayAudit || analytics.todayAudit.length === 0) {
      alert(isHi ? "आज का कोई भुगतान रिकॉर्ड उपलब्ध नहीं है।" : "No payment records available for today.");
      return;
    }
    const headers = ["Receipt No","Tenant Name","Mobile","Tenant Code","Shop No","Location","Amount (INR)","Payment Mode","Date Time","Billing Month"];
    const rows = analytics.todayAudit.map((item) => [
      item.receiptNumber, `"${item.tenantName}"`, item.tenantMobile,
      item.tenantCode, `"${item.shopNumber}"`, `"${item.location}"`,
      item.amount, item.paymentMethod,
      new Date(item.createdAt).toLocaleString("en-IN"), item.billingMonth,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `ZPA_Today_Collections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const collectionPct =
    analytics?.expectedMonthlyRent && analytics.expectedMonthlyRent > 0
      ? Math.round(((analytics.collectedThisMonth || 0) / analytics.expectedMonthlyRent) * 100)
      : 0;

  const trendData = analytics?.monthlyTrends || [];

  return (
    <AdminLayout
      title={isHi ? "मुख्य डैशबोर्ड" : "Admin Dashboard"}
      breadcrumbs={[{ label: isHi ? "डैशबोर्ड" : "Dashboard" }]}
    >

      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <Landmark className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isHi ? `स्वागत है, ${user?.name || "Super Admin"}` : `Welcome, ${user?.name || "Super Admin"}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHi ? "किराया प्रबंधन प्रणाली — जिला पंचायत अल्मोड़ा" : "Rental Management System — Zila Panchayat Almora"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
            साफ प्रशासन &nbsp;|&nbsp; डिजिटल सेवा &nbsp;|&nbsp; समृद्ध अल्मोड़ा
          </span>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{isHi ? "कुल किरायेदार" : "Total Tenants"}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1.5 font-mono">{loading ? "—" : analytics?.totalUsers ?? 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">{isHi ? "पंजीकृत" : "Registered"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{isHi ? "दुकानें" : "Shops"}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1.5 font-mono">{loading ? "—" : analytics?.totalProperties ?? 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics?.allottedProperties ?? 0} {isHi ? "आवंटित" : "allotted"} · {analytics?.vacantProperties ?? 0} {isHi ? "रिक्त" : "vacant"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{isHi ? "मासिक मांग" : "Monthly Demand"}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1.5 font-mono">{loading ? "—" : formatCurrency(analytics?.expectedMonthlyRent ?? 0)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{isHi ? "देय राशि" : "Expected"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{isHi ? "इस माह वसूली" : "Collected"}</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1.5 font-mono">{loading ? "—" : formatCurrency(analytics?.collectedThisMonth ?? 0)}</p>
          <p className="text-[11px] text-emerald-500 mt-1">{collectionPct}% {isHi ? "लक्ष्य" : "of target"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{isHi ? "कुल बकाया" : "Overdue"}</p>
          <p className="text-2xl font-bold text-rose-600 mt-1.5 font-mono">{loading ? "—" : formatCurrency(analytics?.totalOverdue ?? 0)}</p>
          <p className="text-[11px] text-rose-400 mt-1">{isHi ? "लंबित" : "Pending clearance"}</p>
        </div>
      </div>

      {/* Charts Row 1: Bar + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Revenue3DBarChart data={trendData} isHi={isHi} />
        </div>
        <div className="lg:col-span-1">
          <PropertyPatternDonutChart
            allotted={analytics?.allottedProperties ?? 0}
            vacant={analytics?.vacantProperties ?? 0}
            total={analytics?.totalProperties ?? 0}
            isHi={isHi}
          />
        </div>
      </div>

      {/* Charts Row 2: Area + Radial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenuePatternAreaChart data={trendData} isHi={isHi} />
        </div>
        <div className="lg:col-span-1">
          <MunicipalRadialScoresChart
            occupancyScore={analytics?.occupancyRate || 82}
            collectionScore={Math.min(100, collectionPct)}
            complianceScore={88}
            isHi={isHi}
          />
        </div>
      </div>

      {/* Today Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <h3 className="text-sm font-semibold text-slate-800">
                {isHi ? "आज का भुगतान ऑडिट" : "Today's Collections"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHi
                ? `आज: ${formatCurrency(analytics?.todayCollected ?? 0)} (${analytics?.todayTransactionsCount ?? 0} भुगतान)`
                : `${formatCurrency(analytics?.todayCollected ?? 0)} · ${analytics?.todayTransactionsCount ?? 0} transactions`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTodayAuditCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isHi ? "CSV" : "Export CSV"}
            </button>
            <NavLink
              to="/rental/admin/records"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
            >
              {isHi ? "सभी रिकॉर्ड" : "All Records"}
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        <div className="overflow-x-auto">
          {analytics?.todayAudit && analytics.todayAudit.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wide">
                  <th className="py-3 px-4">{isHi ? "रसीद संख्या" : "Receipt No"}</th>
                  <th className="py-3 px-4">{isHi ? "किरायेदार" : "Tenant"}</th>
                  <th className="py-3 px-4">{isHi ? "दुकान" : "Shop"}</th>
                  <th className="py-3 px-4">{isHi ? "माह" : "Month"}</th>
                  <th className="py-3 px-4">{isHi ? "राशि" : "Amount"}</th>
                  <th className="py-3 px-4">{isHi ? "माध्यम" : "Mode"}</th>
                  <th className="py-3 px-4">{isHi ? "समय" : "Time"}</th>
                  <th className="py-3 px-4 text-right">{isHi ? "रसीद" : "Receipt"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.todayAudit.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{p.receiptNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{p.tenantName}</div>
                      <div className="text-[10px] text-slate-400">{p.tenantMobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{p.shopNumber}</div>
                      <div className="text-[10px] text-slate-400">{p.location}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{p.billingMonth}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{p.paymentMethod}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-800 text-slate-600 text-xs font-medium transition"
                      >
                        <Printer className="w-3 h-3" />
                        {isHi ? "देखें" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400">
                {isHi ? "आज का कोई भुगतान रिकॉर्ड उपलब्ध नहीं है।" : "No payment records for today yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{isHi ? "सरकारी किराया रसीद" : "Official Rent Receipt"}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Zila Panchayat Almora · Govt. of Uttarakhand</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>
            <div className="space-y-2 text-xs font-mono bg-slate-50 rounded-lg p-4 border border-slate-100">
              {([
                ["Receipt No", selectedReceipt.receiptNumber],
                ["Tenant", selectedReceipt.tenantName],
                ["Shop / Location", `${selectedReceipt.shopNumber} (${selectedReceipt.location})`],
                ["Period", selectedReceipt.billingMonth],
                ["Payment Mode", selectedReceipt.paymentMethod],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}:</span>
                  <span className="font-semibold text-slate-700">{val}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-sm mt-1">
                <span className="font-semibold text-slate-600">{isHi ? "कुल राशि" : "Amount Paid"}:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                {isHi ? "प्रिंट" : "Print"}
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200"
              >
                {isHi ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
