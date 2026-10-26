import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  rentalLedgerApi,
  LedgerOverview,
  LedgerTransactionRecord,
  TenantLedgerStatementResponse,
  TenantDropdownItem,
} from '../services/rentalLedger.service';
import { PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  Receipt,
  RefreshCw,
  CreditCard,
  Wallet,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldCheck,
  FileText,
  UserCheck,
  X,
  Eye,
} from 'lucide-react';

export const RentLedgerPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'master' (दैनिक व समग्र राजस्व लेजर) or 'tenant' (किरायेदार बहीखाता व भुगतान इतिहास)
  const initialTab = searchParams.get('tab') === 'tenant' || searchParams.get('tenantId') ? 'tenant' : 'master';
  const [activeTab, setActiveTab] = useState<'master' | 'tenant'>(initialTab);

  // Sub-tab in Tenant View: 'payments' (भुगतान इतिहास) vs 'ledger' (डेबिट-क्रेडिट बहीखाता) vs 'bills' (माहवार मांग बिल)
  const [tenantSubTab, setTenantSubTab] = useState<'payments' | 'ledger' | 'bills'>('payments');

  // Dates
  const now = new Date();
  const currentYearStr = now.getFullYear().toString();
  const currentMonthStr = `${currentYearStr}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Filters for Master Ledger
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Overview KPIs
  const [overview, setOverview] = useState<LedgerOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Master Ledger Transactions
  const [transactions, setTransactions] = useState<LedgerTransactionRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalFilteredAmount, setTotalFilteredAmount] = useState(0);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Tenant State
  const [tenantsList, setTenantsList] = useState<TenantDropdownItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(searchParams.get('tenantId') || '');
  const [tenantStatement, setTenantStatement] = useState<TenantLedgerStatementResponse | null>(null);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [statementError, setStatementError] = useState('');

  // Formatting helpers
  const formatCurrency = (amt: number | null | undefined) => {
    return '₹ ' + Number(amt || 0).toLocaleString('en-IN');
  };

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatDateTime = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return String(dateStr);
    }
  };

  // Load Overview KPIs
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await rentalLedgerApi.getOverview({
        date: dateFilter || undefined,
        month: monthFilter || undefined,
        year: yearFilter !== 'ALL' ? yearFilter : undefined,
      });
      if (res && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      console.error('Failed to load ledger overview', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  // Load Master Transactions
  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const res = await rentalLedgerApi.getTransactions({
        date: dateFilter || undefined,
        month: monthFilter || undefined,
        year: yearFilter !== 'ALL' ? yearFilter : undefined,
        paymentMethod: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: pageSize,
      });
      if (res && res.data) {
        setTransactions(res.data.records);
        setTotalCount(res.data.totalCount);
        setTotalFilteredAmount(res.data.totalFilteredAmount);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Load Tenants List for selector
  const fetchTenantsList = async () => {
    try {
      const res = await rentalLedgerApi.getTenantsList();
      if (res && res.data) {
        setTenantsList(res.data);
        if (!selectedTenantId && res.data.length > 0) {
          const fromParam = searchParams.get('tenantId');
          if (fromParam) {
            setSelectedTenantId(fromParam);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load tenants', err);
    }
  };

  // Load Tenant 360 Statement
  const fetchTenantStatement = async (id: string) => {
    if (!id) return;
    setLoadingStatement(true);
    setStatementError('');
    try {
      const res = await rentalLedgerApi.getTenantLedger(id);
      if (res && res.data) {
        setTenantStatement(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load tenant statement', err);
      setStatementError(
        err?.response?.data?.message || (isHi ? 'किरायेदार का लेजर विवरण लोड करने में असमर्थ।' : 'Failed to load statement.')
      );
    } finally {
      setLoadingStatement(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchTransactions();
  }, [dateFilter, monthFilter, yearFilter, paymentMethodFilter, currentPage]);

  useEffect(() => {
    fetchTenantsList();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      fetchTenantStatement(selectedTenantId);
    }
  }, [selectedTenantId]);

  useEffect(() => {
    const fromParam = searchParams.get('tenantId');
    if (fromParam && fromParam !== selectedTenantId) {
      setSelectedTenantId(fromParam);
      setActiveTab('tenant');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'master' | 'tenant') => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  const handleSelectTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'tenant');
    newParams.set('tenantId', tenantId);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setDateFilter('');
    setMonthFilter('');
    setYearFilter('ALL');
    setPaymentMethodFilter('ALL');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // ── 1. REAL FORMATTED EXCEL WORKBOOK: Master Daily Ledger ──────────────────
  const exportMasterToExcel = () => {
    if (transactions.length === 0) {
      alert(isHi ? 'डाउनलोड के लिए कोई रिकॉर्ड उपलब्ध नहीं है।' : 'No records to export.');
      return;
    }

    const wb = XLSX.utils.book_new();

    const wsData: any[][] = [
      ['कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखंड शासन)'],
      ['OFFICE OF ZILA PANCHAYAT ALMORA (UTTARAKHAND)'],
      ['दैनिक एवं समग्र राजस्व संकलन बहीखाता (Daily & General Revenue Ledger)'],
      ['रिपोर्ट जारी दिनांक:', new Date().toLocaleString('en-IN')],
      ['फ़िल्टर विवरण:', dateFilter ? `विशिष्ट तिथि: ${dateFilter}` : monthFilter ? `माह: ${monthFilter}` : 'समस्त रिकॉर्ड'],
      [],
      [
        'क्र.सं.',
        'भुगतान दिनांक व समय (Payment Date & Time)',
        'रसीद संख्या (Receipt No)',
        'किरायेदार का नाम (Tenant Name)',
        'किरायेदार कोड (Tenant Code)',
        'मोबाइल नंबर (Mobile)',
        'दुकान संख्या (Shop No)',
        'स्थान (Location)',
        'बिल माह (Billing Month)',
        'जमा राशि रुपये (Amount Paid INR)',
        'भुगतान माध्यम (Mode)',
        'लेनदेन संदर्भ (Txn Ref)',
        'स्थिति (Status)'
      ],
      ...transactions.map((t, idx) => [
        idx + 1,
        formatDateTime(t.date),
        t.receiptNumber,
        t.tenantName,
        t.tenantCode,
        t.tenantMobile,
        t.shopNumber,
        t.location,
        t.billingMonth,
        Number(t.amount),
        t.paymentMethod,
        t.paymentReference,
        t.status
      ]),
      [],
      ['', '', '', '', '', '', '', '', 'कुल संकलित राशि योग:', Number(totalFilteredAmount), '', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Optimized Column Widths for Microsoft Excel
    ws['!cols'] = [
      { wch: 8 },   // S.No
      { wch: 25 },  // Date Time
      { wch: 22 },  // Receipt
      { wch: 24 },  // Name
      { wch: 18 },  // Code
      { wch: 16 },  // Mobile
      { wch: 16 },  // Shop
      { wch: 22 },  // Location
      { wch: 14 },  // Month
      { wch: 18 },  // Amount
      { wch: 16 },  // Mode
      { wch: 24 },  // Ref
      { wch: 14 }   // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Daily_Revenue_Ledger');
    XLSX.writeFile(wb, `ZPA_Daily_Revenue_Ledger_${todayStr}.xlsx`);
  };

  // ── 2. REAL FORMATTED EXCEL WORKBOOK: Tenant Payment History & Statement ───
  const exportTenantToExcel = () => {
    if (!tenantStatement) {
      alert(isHi ? 'किरायेदार का डेटा उपलब्ध नहीं है।' : 'No tenant data available.');
      return;
    }

    const { tenant, allotment, summary, rawPayments } = tenantStatement;
    const wb = XLSX.utils.book_new();

    const wsData: any[][] = [
      ['कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखंड शासन)'],
      ['OFFICE OF ZILA PANCHAYAT ALMORA (UTTARAKHAND)'],
      ['वाणिज्यिक परिसंपत्ति एवं किराया बहीखाता विवरण पत्र (Commercial Rent & Revenue Ledger)'],
      ['रिपोर्ट जारी दिनांक:', new Date().toLocaleString('en-IN')],
      [],
      ['१. किरायेदार पहचान विवरण (TENANT IDENTIFICATION)'],
      ['किरायेदार कोड (Code):', tenant.tenantCode, 'पूरा नाम (Full Name):', tenant.fullName],
      ['मोबाइल नंबर (Mobile):', tenant.mobile, 'ईमेल (Email):', tenant.email || 'N/A'],
      ['पंजीकरण दिनांक (Reg Date):', formatDateTime(tenant.registrationDate), 'खाता स्थिति (Status):', tenant.status],
      ['पहचान (Identity):', `Aadhaar: ${tenant.aadhaarMasked} | PAN: ${tenant.panMasked}`, 'GSTIN:', tenant.gstNumber || 'N/A'],
      ['स्थायी पता (Address):', tenant.permanentAddress],
      [],
      ['२. दुकान आवंटन एवं पट्टा वैधता विवरण (ASSET & LEASE VALIDITY)'],
      ['दुकान / संपत्ति सं. (Shop):', allotment?.propertyNumber || 'N/A', 'स्थान (Location):', allotment?.location || 'N/A'],
      ['मासिक स्वीकृत किराया (Rent):', Number(allotment?.monthlyRent || 0), 'पट्टा प्रारंभ (Start Date):', formatDate(allotment?.leaseStartDate)],
      ['पट्टा कब तक वैध है (Valid Till):', formatDate(allotment?.leaseEndDate), 'पट्टा स्थिति (Lease Status):', allotment?.isExpired ? 'अवधि समाप्त (EXPIRED)' : 'सक्रिय एवं वैध (VALID LEASE)'],
      [],
      ['३. कुल वित्तीय स्थिति संक्षेप (FINANCIAL SUMMARY)'],
      ['कुल मांग किराया (Total Billed):', Number(summary.totalBilled), 'कुल जमा किराया (Total Paid):', Number(summary.totalPaid), 'बकाया अवशेष (Outstanding Dues):', Number(summary.totalOutstanding)],
      [],
      ['४. संपूर्ण भुगतान इतिहास (PAYMENT HISTORY — कब-कब भुगतान किया गया)'],
      [
        'क्र.सं.',
        'भुगतान दिनांक व समय (Payment Date & Time)',
        'रसीद संख्या (Receipt No)',
        'बिल अवधि (Billing Month)',
        'दुकान सं. (Shop No)',
        'जमा राशि रुपये (Amount Paid INR)',
        'भुगतान माध्यम (Payment Mode)',
        'संदर्भ संख्या (Txn Reference)',
        'सत्यापन स्थिति (Status)'
      ],
      ...rawPayments.map((p, idx) => [
        idx + 1,
        formatDateTime(p.date),
        p.receiptNumber,
        p.billingMonth,
        p.shopNumber || allotment?.propertyNumber || 'N/A',
        Number(p.amount),
        p.paymentMethod,
        p.gatewayRef || p.paymentReference,
        'सत्यापित (Verified)'
      ]),
      [],
      ['', '', '', '', 'कुल जमा योग (Total Paid):', Number(summary.totalPaid), '', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Optimized Column Widths
    ws['!cols'] = [
      { wch: 8 },   // S.No.
      { wch: 25 },  // Date Time
      { wch: 22 },  // Receipt No
      { wch: 16 },  // Billing Month
      { wch: 16 },  // Shop No
      { wch: 20 },  // Amount
      { wch: 16 },  // Mode
      { wch: 28 },  // Reference
      { wch: 18 }   // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Payment_History_Ledger');
    XLSX.writeFile(wb, `ZPA_Tenant_${tenant.tenantCode}_Payment_Ledger.xlsx`);
  };

  // ── 3. ISOLATED CLEAN PRINT & PDF GENERATOR ────────────────────────────────
  const printOfficialStatement = () => {
    if (!tenantStatement) return;
    const { tenant, allotment, summary, rawPayments } = tenantStatement;

    const printWindow = window.open('', '_blank', 'width=920,height=1000');
    if (!printWindow) {
      alert(isHi ? 'कृपया पॉप-अप विंडो की अनुमति दें।' : 'Please allow pop-ups to print PDF.');
      return;
    }

    const rowsHtml = rawPayments
      .map(
        (p, idx) => `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #475569; text-align: center;">${idx + 1}</td>
          <td style="padding: 6px 8px; border: 1px solid #475569; font-weight: bold;">${formatDateTime(p.date)}</td>
          <td style="padding: 6px 8px; border: 1px solid #475569;">${p.receiptNumber}</td>
          <td style="padding: 6px 8px; border: 1px solid #475569;">${p.billingMonth}</td>
          <td style="padding: 6px 8px; border: 1px solid #475569; text-align: right; font-weight: bold;">₹ ${Number(p.amount).toLocaleString('en-IN')}</td>
          <td style="padding: 6px 8px; border: 1px solid #475569; text-align: center;">${p.paymentMethod}</td>
          <td style="padding: 6px 8px; border: 1px solid #475569;">${p.gatewayRef || p.paymentReference}</td>
          <td style="padding: 6px 8px; border: 1px solid #475569; text-align: center; color: #047857; font-weight: bold;">प्रमाणित</td>
        </tr>`
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ZPA_Ledger_${tenant.tenantCode}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: 'Times New Roman', serif, Arial; color: #111; margin: 0; padding: 10px; font-size: 11pt; line-height: 1.35; }
            .header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
            .title-hi { font-size: 15pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 0; }
            .title-en { font-size: 11pt; font-weight: bold; text-align: center; margin: 2px 0 0 0; }
            .subtitle { font-size: 9pt; text-align: center; color: #444; margin: 2px 0 0 0; font-family: Arial, sans-serif; }
            .meta-strip { display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 12px; border-bottom: 1px dashed #666; padding-bottom: 4px; font-family: Arial, sans-serif; }
            .info-box { width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt; }
            .info-box td { padding: 5px 8px; border: 1px solid #999; vertical-align: top; }
            .box-heading { font-weight: bold; background-color: #f1f5f9; text-transform: uppercase; font-size: 9pt; }
            .summary-box { width: 100%; border: 1.5px solid #000; border-collapse: collapse; margin-bottom: 14px; background-color: #f8fafc; font-size: 10pt; font-weight: bold; }
            .summary-box td { padding: 8px; text-align: center; border: 1px solid #666; }
            .data-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 20px; }
            .data-table th { background-color: #f1f5f9; border: 1px solid #000; padding: 6px; font-weight: bold; text-align: left; }
            .data-table td { border: 1px solid #475569; }
            .sign-section { margin-top: 40px; display: flex; justify-content: space-between; font-size: 9.5pt; text-align: center; }
            .sign-box { width: 220px; }
            .sign-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 4px; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 15px; border-radius: 6px; text-align: center; font-family: Arial, sans-serif;">
            <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; font-size: 14px; cursor: pointer;">
              🖨️ अभी प्रिंट / PDF सेव करें (Print / Save as PDF)
            </button>
            <span style="margin-left: 10px; font-size: 12px; color: #475569;">(Destination में 'Save as PDF' चुनें)</span>
          </div>

          <table class="header-table">
            <tr>
              <td style="width: 70px; vertical-align: middle;">
                <img src="${PANCHAYATI_RAJ_LOGO_URL}" alt="Emblem" style="width: 60px; height: 60px; object-fit: contain;" />
              </td>
              <td style="text-align: center;">
                <h1 class="title-hi">कार्यालय जिला पंचायत अल्मोड़ा</h1>
                <h2 class="title-en">OFFICE OF ZILA PANCHAYAT ALMORA (UTTARAKHAND)</h2>
                <div class="subtitle">वाणिज्यिक परिसंपत्ति एवं किराया बहीखाता प्रमाण-पत्र / विवरण पत्र</div>
              </td>
              <td style="width: 70px;"></td>
            </tr>
          </table>

          <div class="meta-strip">
            <span><strong>प्रमाण-पत्र सं:</strong> ZPA/RENT/${new Date().getFullYear()}/${tenant.tenantCode}</span>
            <span><strong>जारी दिनांक:</strong> ${new Date().toLocaleString('en-IN')}</span>
          </div>

          <!-- Tenant & Allotment Information Box -->
          <table class="info-box">
            <tr>
              <td colspan="2" class="box-heading">१. किरायेदार पहचान एवं पंजीकरण विवरण (Tenant Identity & Registration)</td>
              <td colspan="2" class="box-heading">२. दुकान आवंटन एवं वैधता विवरण (Asset & Lease Validity)</td>
            </tr>
            <tr>
              <td style="width: 25%;"><strong>किरायेदार का नाम:</strong></td>
              <td style="width: 25%; font-weight: bold;">${tenant.fullName}</td>
              <td style="width: 25%;"><strong>आवंटित दुकान / संपत्ति सं.:</strong></td>
              <td style="width: 25%; font-weight: bold;">${allotment?.propertyNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>किरायेदार कोड:</strong></td>
              <td style="font-family: monospace; font-weight: bold;">${tenant.tenantCode}</td>
              <td><strong>बाजार / स्थान:</strong></td>
              <td>${allotment?.location || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>मोबाइल नंबर:</strong></td>
              <td>${tenant.mobile}</td>
              <td><strong>मासिक स्वीकृत किराया:</strong></td>
              <td style="font-weight: bold;">₹ ${allotment?.monthlyRent ? allotment.monthlyRent.toLocaleString('en-IN') : 0} / माह</td>
            </tr>
            <tr>
              <td><strong>पंजीकरण दिनांक:</strong></td>
              <td style="font-weight: bold;">${formatDateTime(tenant.registrationDate)}</td>
              <td><strong>पट्टा कब तक वैध है:</strong></td>
              <td style="font-weight: bold; color: ${allotment?.isExpired ? '#b91c1c' : '#047857'};">
                ${formatDate(allotment?.leaseEndDate)} (${allotment?.isExpired ? 'अवधि समाप्त' : 'वैध पट्टा'})
              </td>
            </tr>
            <tr>
              <td><strong>आधार / पहचान:</strong></td>
              <td>XXXX-${tenant.aadhaarMasked.slice(-4)} | PAN: ${tenant.panMasked}</td>
              <td><strong>पट्टा प्रारंभ दिनांक:</strong></td>
              <td>${formatDate(allotment?.leaseStartDate)}</td>
            </tr>
            <tr>
              <td><strong>स्थायी पता:</strong></td>
              <td colspan="3">${tenant.permanentAddress}</td>
            </tr>
          </table>

          <!-- Financial Position Summary -->
          <table class="summary-box">
            <tr>
              <td style="color: #0f172a;">कुल मांग किराया (Billed)<br/><span style="font-size: 13pt;">₹ ${summary.totalBilled.toLocaleString('en-IN')}</span></td>
              <td style="color: #047857;">कुल जमा किया गया किराया (Paid)<br/><span style="font-size: 13pt;">₹ ${summary.totalPaid.toLocaleString('en-IN')}</span></td>
              <td style="color: ${summary.totalOutstanding > 0 ? '#b91c1c' : '#0f172a'};">वर्तमान बकाया अवशेष (Outstanding)<br/><span style="font-size: 13pt;">₹ ${summary.totalOutstanding.toLocaleString('en-IN')}</span></td>
            </tr>
          </table>

          <!-- Payment History Table -->
          <div style="font-weight: bold; font-size: 10pt; margin-bottom: 6px; text-transform: uppercase;">
            ३. संपूर्ण भुगतान इतिहास (Payment Chronology — कब-कब भुगतान किया गया)
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">क्र.</th>
                <th>भुगतान दिनांक व समय</th>
                <th>रसीद संख्या</th>
                <th>बिल अवधि</th>
                <th style="text-align: right;">जमा राशि</th>
                <th style="text-align: center;">माध्यम</th>
                <th>लेनदेन संदर्भ (Txn Ref)</th>
                <th style="text-align: center;">स्थिति</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="8" style="text-align:center; padding: 15px;">कोई भुगतान रिकॉर्ड नहीं मिला।</td></tr>'}
            </tbody>
          </table>

          <div style="font-size: 8pt; color: #555; margin-top: 10px;">
            * यह विवरण जिला पंचायत अल्मोड़ा के अधिकृत राजस्व एवं किराया पोर्टल द्वारा कम्प्यूटर जनित अभिलेख है।
          </div>

          <!-- Signatures Section -->
          <div class="sign-section">
            <div class="sign-box">
              <div class="sign-line">
                <strong>(प्रभारी लिपिक / कर संग्रहक)</strong><br/>
                जिला पंचायत अल्मोड़ा
              </div>
            </div>
            <div class="sign-box">
              <div class="sign-line">
                <strong>(कर अधीक्षक / अपर मुख्य अधिकारी)</strong><br/>
                जिला पंचायत अल्मोड़ा (उत्तराखंड)
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <AdminLayout
      title={isHi ? 'राजस्व एवं किराया बहीखाता (Rent Ledger)' : 'Rent & Revenue Ledger'}
      subtitle={isHi ? 'दैनिक किराया संकलन, किरायेदार पट्टा वैधता एवं संपूर्ण भुगतान इतिहास रजिस्टर' : 'Daily collections, lease validity and tenant payment audit ledger'}
      breadcrumbs={[{ label: isHi ? 'राजस्व बहीखाता' : 'Rent Ledger' }]}
    >
      {/* ───────────────────────────────────────────────────────────────────────
          1. TOP OVERVIEW KPIS (SOBER, OFFICIAL GOVERNMENT STYLING)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {/* Total Rent Collected */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {isHi ? 'कुल संकलित किराया (All-Time)' : 'Total Rent Collected'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {loadingOverview ? '...' : formatCurrency(overview?.totalRentCollectedAllTime)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isHi ? 'समस्त प्रमाणित रसीदों का कुल योग' : 'Total receipts verified'}
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {isHi ? 'चालू माह संकलन (This Month)' : 'This Month'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {loadingOverview ? '...' : formatCurrency(overview?.monthlyCollection)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isHi ? `माह: ${overview?.currentMonth || currentMonthStr}` : `Month: ${overview?.currentMonth || currentMonthStr}`}
          </div>
        </div>

        {/* Current Fiscal Year */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {isHi ? `वित्तीय वर्ष (${overview?.fiscalYear || '2026-27'})` : `Fiscal Year (${overview?.fiscalYear || '26-27'})`}
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {loadingOverview ? '...' : formatCurrency(overview?.yearlyCollection)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isHi ? '1 अप्रैल से अब तक' : '1st April to Date'}
          </div>
        </div>

        {/* Total Outstanding Dues */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {isHi ? 'वर्तमान कुल बकाया (Outstanding)' : 'Total Outstanding'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {loadingOverview ? '...' : formatCurrency(overview?.totalRentDue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isHi ? 'किरायेदारों पर देय कुल अवशेष' : 'Unsettled dues across leases'}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          2. OFFICIAL GOVERNMENT TABS (NO LOUD/EXTRA COLORS)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        {/* Tab Headers: Clean Slate Government Theme */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('master')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'master'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isHi ? '१. दैनिक व समग्र राजस्व बहीखाता (Master Ledger)' : '1. General Master Ledger'}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'master' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-700'}`}>
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('tenant')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'tenant'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isHi ? '२. किरायेदार बहीखाता व भुगतान इतिहास (Tenant Statement)' : '2. Tenant Payment History & Statement'}</span>
            {selectedTenantId && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${activeTab === 'tenant' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-700'}`}>
                Active
              </span>
            )}
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────────────────
            TAB 1: MASTER DAILY & GENERAL REVENUE LEDGER
        ──────────────────────────────────────────────────────────────────── */}
        {activeTab === 'master' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Quick Date Buttons & Search Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              {/* Daily Shortcut Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-600 mr-1 uppercase">
                    {isHi ? 'त्वरित दिनांक:' : 'Quick Date:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setDateFilter(todayStr); setMonthFilter(''); setYearFilter('ALL'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      dateFilter === todayStr
                        ? 'bg-slate-900 text-white font-extrabold'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isHi ? 'आज (Today)' : 'Today'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDateFilter(yesterdayStr); setMonthFilter(''); setYearFilter('ALL'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      dateFilter === yesterdayStr
                        ? 'bg-slate-900 text-white font-extrabold'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isHi ? 'कल (Yesterday)' : 'Yesterday'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMonthFilter(currentMonthStr); setDateFilter(''); setYearFilter('ALL'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      monthFilter === currentMonthStr
                        ? 'bg-slate-900 text-white font-extrabold'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isHi ? 'चालू माह (This Month)' : 'This Month'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      !dateFilter && !monthFilter && yearFilter === 'ALL'
                        ? 'bg-slate-900 text-white font-extrabold'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isHi ? 'समस्त (All)' : 'All Time'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={exportMasterToExcel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{isHi ? 'एक्सेल डाउनलोड (.xlsx)' : 'Export Excel (.xlsx)'}</span>
                </button>
              </div>

              {/* Advanced Filter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isHi ? 'विशिष्ट तिथि चुनें (Date)' : 'Select Date'}
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      if (e.target.value) setMonthFilter('');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isHi ? 'माहवार (Month)' : 'Month'}
                  </label>
                  <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => {
                      setMonthFilter(e.target.value);
                      if (e.target.value) setDateFilter('');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isHi ? 'भुगतान माध्यम (Mode)' : 'Payment Mode'}
                  </label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="ALL">{isHi ? 'समस्त माध्यम (All Modes)' : 'All Modes'}</option>
                    <option value="UPI">UPI / Online Gateway</option>
                    <option value="CASH">{isHi ? 'नकद (Office Counter Cash)' : 'Cash Counter'}</option>
                    <option value="NET_BANKING">Net Banking / NEFT</option>
                    <option value="CHEQUE_DD">Cheque / Demand Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isHi ? 'किरायेदार / दुकान खोज' : 'Search Tenant / Shop'}
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={isHi ? 'नाम, मोबाइल, दुकान सं. ...' : 'Name, Mobile, Shop...'}
                      className="w-full pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtered Count & Amount Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div>
                {isHi ? 'प्रदर्शित रिकॉर्ड्स:' : 'Showing records:'}{' '}
                <span className="font-bold text-slate-900 font-mono">{transactions.length}</span>{' '}
                {isHi ? `(कुल ${totalCount} में से)` : `(of ${totalCount})`} •{' '}
                {isHi ? 'कुल संकलित राशि:' : 'Total Amount:'}{' '}
                <span className="font-extrabold text-slate-900 font-mono">
                  {formatCurrency(totalFilteredAmount)}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTransactions ? 'animate-spin' : ''}`} />
                <span>{isHi ? 'ताज़ा करें' : 'Refresh'}</span>
              </button>
            </div>

            {/* Master Transactions Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                      <th className="py-2.5 px-3">क्र.</th>
                      <th className="py-2.5 px-3">{isHi ? 'भुगतान दिनांक व समय' : 'Payment Date & Time'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'रसीद संख्या' : 'Receipt No.'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'किरायेदार (Tenant)' : 'Tenant Details'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'दुकान व स्थान' : 'Shop & Location'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'बिल माह' : 'Month'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'माध्यम' : 'Mode'}</th>
                      <th className="py-2.5 px-3 text-right">{isHi ? 'जमा राशि (₹)' : 'Amount Paid'}</th>
                      <th className="py-2.5 px-3 text-center">{isHi ? 'कार्रवाई' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingTransactions ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-slate-500" />
                          <span>{isHi ? 'डेटा लोड हो रहा है...' : 'Loading transactions...'}</span>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-400">
                          <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                          <p className="font-semibold text-slate-600">{isHi ? 'चयनित अवधि में कोई लेन-देन उपलब्ध नहीं है।' : 'No transactions found.'}</p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            <span className="block font-bold">{formatDate(t.date)}</span>
                            <span className="text-[10px] text-slate-500">{new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{t.receiptNumber}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{t.tenantName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{t.tenantCode} • {t.tenantMobile}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold font-mono text-slate-800">{t.shopNumber}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{t.location}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">{t.billingMonth}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {t.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                            {formatCurrency(t.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectTenant(t.tenantId)}
                              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold transition inline-flex items-center gap-1"
                              title={isHi ? 'इस किरायेदार का लेजर देखें' : 'View Tenant Ledger'}
                            >
                              <span>{isHi ? 'लेजर देखें' : 'View'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            TAB 2: TENANT STATEMENT & WHOLE PAYMENT HISTORY
        ──────────────────────────────────────────────────────────────────── */}
        {activeTab === 'tenant' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Simple Tenant Selection Dropdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHi ? 'किरायेदार चुनें (Select Tenant to view payment history):' : 'Select Tenant:'}
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleSelectTenant(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="">{isHi ? '-- किरायेदार का चयन करें --' : '-- Select Tenant --'}</option>
                  {tenantsList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.tenantCode}) — दुकान: {t.shopNumber} ({t.location})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTenantId && (
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={exportTenantToExcel}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition shadow-xs"
                    title={isHi ? 'किरायेदार का पूरा डेटा एक्सेल (.xlsx) में डाउनलोड करें' : 'Export Excel (.xlsx)'}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{isHi ? 'Excel डाउनलोड (.xlsx)' : 'Export Excel (.xlsx)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={printOfficialStatement}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition shadow-xs"
                    title={isHi ? 'आधिकारिक सरकारी लेजर प्रमाण-पत्र प्रिंट या PDF सेव करें' : 'Print Official PDF'}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isHi ? 'PDF / प्रिंट प्रमाण-पत्र' : 'Print PDF'}</span>
                  </button>
                </div>
              )}
            </div>

            {loadingStatement && (
              <div className="py-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-500 mb-2" />
                <p className="font-bold text-sm text-slate-700">{isHi ? 'किरायेदार का संपूर्ण विवरण लोड हो रहा है...' : 'Loading tenant history...'}</p>
              </div>
            )}

            {statementError && (
              <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">
                {statementError}
              </div>
            )}

            {!loadingStatement && !selectedTenantId && (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-600 text-xs sm:text-sm">
                  {isHi ? 'कृपया ऊपर से किसी किरायेदार का चयन करें।' : 'Please select a tenant from above.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isHi ? 'उसने कब रजिस्टर किया, कब तक पट्टा वैध है, और कब-कब कितना भुगतान किया — संपूर्ण विवरण यहाँ दिखेगा।' : 'View registration date, lease validity and complete payment chronology.'}
                </p>
              </div>
            )}

            {!loadingStatement && tenantStatement && (
              <div className="space-y-4">
                {/* ─────────────────────────────────────────────────────────────
                    TENANT PROFILE & LEASE VALIDITY CARD (SOBER GOVERNMENT STYLE)
                ────────────────────────────────────────────────────────────── */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                          {tenantStatement.tenant.tenantCode}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {tenantStatement.tenant.fullName}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          tenantStatement.tenant.status === 'ACTIVE'
                            ? 'bg-slate-50 text-slate-800 border-slate-300'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {tenantStatement.tenant.status === 'ACTIVE' ? (isHi ? 'सक्रिय खाता' : 'Active') : tenantStatement.tenant.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>📱 {tenantStatement.tenant.mobile}</span>
                        <span>🆔 आधार: {tenantStatement.tenant.aadhaarMasked}</span>
                        <span>PAN: {tenantStatement.tenant.panMasked}</span>
                        {tenantStatement.tenant.gstNumber && tenantStatement.tenant.gstNumber !== 'N/A' && (
                          <span className="font-mono font-semibold text-slate-700">GST: {tenantStatement.tenant.gstNumber}</span>
                        )}
                      </div>
                    </div>

                    {/* Registration & Validity Dates */}
                    <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                      {/* Registration Date */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {isHi ? 'पंजीकरण दिनांक (Reg. Date)' : 'Registered On'}
                        </span>
                        <span className="font-bold text-slate-900 block mt-0.5">
                          {formatDateTime(tenantStatement.tenant.registrationDate)}
                        </span>
                      </div>

                      <div className="w-px h-8 bg-slate-200 hidden sm:block" />

                      {/* Lease Validity Date */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {isHi ? 'पट्टा कब तक वैध है (Valid Till)' : 'Lease Valid Till'}
                        </span>
                        <span className="font-bold text-slate-900 block mt-0.5">
                          {formatDate(tenantStatement.allotment?.leaseEndDate)}
                        </span>
                        <span className={`text-[10px] font-bold block ${
                          tenantStatement.allotment?.isExpired ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {tenantStatement.allotment?.isExpired ? (isHi ? '⚠️ अवधि समाप्त' : 'Expired') : (isHi ? '✅ वैध पट्टा' : 'Valid Lease')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details Strip */}
                  {tenantStatement.allotment && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        {isHi ? 'आवंटित दुकान:' : 'Shop:'}{' '}
                        <span className="font-bold font-mono text-slate-900">{tenantStatement.allotment.propertyNumber}</span>
                        {' '}({tenantStatement.allotment.location})
                      </div>
                      <div>
                        {isHi ? 'मासिक स्वीकृत किराया:' : 'Monthly Rent:'}{' '}
                        <span className="font-bold font-mono text-slate-900">{formatCurrency(tenantStatement.allotment.monthlyRent)}/माह</span>
                      </div>
                      <div>
                        {isHi ? 'पट्टा प्रारंभ:' : 'Lease Start:'}{' '}
                        <span className="font-medium text-slate-800">{formatDate(tenantStatement.allotment.leaseStartDate)}</span>
                      </div>
                    </div>
                  )}

                  {/* Financial KPI Numbers: Clean, Simple, SOBER */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">{isHi ? 'कुल मांग (Billed)' : 'Total Billed'}</span>
                      <span className="text-sm sm:text-base font-black font-mono text-slate-900">{formatCurrency(tenantStatement.summary.totalBilled)}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">{isHi ? 'कुल जमा (Paid)' : 'Total Paid'}</span>
                      <span className="text-sm sm:text-base font-black font-mono text-slate-900">{formatCurrency(tenantStatement.summary.totalPaid)}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">{isHi ? 'बकाया शेष (Due)' : 'Outstanding'}</span>
                      <span className="text-sm sm:text-base font-black font-mono text-slate-900">{formatCurrency(tenantStatement.summary.totalOutstanding)}</span>
                    </div>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    SUB-TAB SELECTOR: PAYMENT HISTORY (PRIMARY) vs RUNNING LEDGER
                ────────────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTenantSubTab('payments')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        tenantSubTab === 'payments'
                          ? 'bg-slate-900 text-white font-extrabold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      💳 {isHi ? '१. संपूर्ण भुगतान इतिहास (Payment History)' : '1. Payment History'} ({tenantStatement.rawPayments.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTenantSubTab('ledger')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        tenantSubTab === 'ledger'
                          ? 'bg-slate-900 text-white font-extrabold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      📖 {isHi ? '२. विस्तृत बहीखाता (Debit/Credit Ledger)' : '2. Running Ledger'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTenantSubTab('bills')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        tenantSubTab === 'bills'
                          ? 'bg-slate-900 text-white font-extrabold shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      🧾 {isHi ? '३. माहवार मांग बिल (Monthly Bills)' : '3. Monthly Bills'} ({tenantStatement.rawBills.length})
                    </button>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    SUB-VIEW 1: PAYMENT HISTORY TABLE (KAB KAB PAYMENT KI)
                ────────────────────────────────────────────────────────────── */}
                {tenantSubTab === 'payments' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {isHi ? 'किरायेदार द्वारा किए गए समस्त भुगतानों का विवरण (Payment Records):' : 'All Payment Records:'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {isHi ? `कुल किश्तें: ${tenantStatement.rawPayments.length}` : `Total Payments: ${tenantStatement.rawPayments.length}`}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                            <th className="py-2.5 px-3">क्र.</th>
                            <th className="py-2.5 px-3 font-bold text-slate-900">{isHi ? 'भुगतान दिनांक व समय' : 'Payment Date & Time'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'रसीद संख्या' : 'Receipt No.'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'बिल अवधि' : 'Billing Period'}</th>
                            <th className="py-2.5 px-3 text-right text-slate-900">{isHi ? 'जमा राशि (रुपये)' : 'Amount Paid'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'माध्यम' : 'Payment Mode'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'लेनदेन संदर्भ (Txn Ref / Gateway ID)' : 'Txn Reference'}</th>
                            <th className="py-2.5 px-3 text-center">{isHi ? 'स्थिति' : 'Status'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantStatement.rawPayments.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-400">
                                {isHi ? 'इस किरायेदार का कोई भुगतान रिकॉर्ड उपलब्ध नहीं है।' : 'No payment records found for this tenant.'}
                              </td>
                            </tr>
                          ) : (
                            tenantStatement.rawPayments.map((p, idx) => (
                              <tr key={p.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <div className="font-extrabold text-slate-900">{formatDate(p.date)}</div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {new Date(p.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{p.receiptNumber}</td>
                                <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{p.billingMonth}</td>
                                <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 text-sm">
                                  {formatCurrency(p.amount)}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                    {p.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 truncate max-w-[160px]">
                                  {p.gatewayRef || p.paymentReference}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{isHi ? 'सफल जमा' : 'Success'}</span>
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    SUB-VIEW 2: RUNNING LEDGER TABLE (DEBITS & CREDITS)
                ────────────────────────────────────────────────────────────── */}
                {tenantSubTab === 'ledger' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                      {isHi ? 'समग्र बहीखाता — देय किराया (Debit) एवं जमा भुगतान (Credit) व शेष बकाया:' : 'Running Ledger:'}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase font-mono">
                            <th className="py-2.5 px-3">{isHi ? 'दिनांक' : 'Date'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'प्रकार' : 'Type'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'दस्तावेज सं.' : 'Doc No.'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'विवरण' : 'Particulars'}</th>
                            <th className="py-2.5 px-3 text-right">{isHi ? 'देय (Debit ₹)' : 'Debit ₹'}</th>
                            <th className="py-2.5 px-3 text-right">{isHi ? 'जमा (Credit ₹)' : 'Credit ₹'}</th>
                            <th className="py-2.5 px-3 text-right">{isHi ? 'शेष बकाया (₹)' : 'Balance ₹'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {tenantStatement.ledgerHistory.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{formatDate(row.date)}</td>
                              <td className="py-2.5 px-3 font-sans">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  row.type === 'BILL' ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-slate-800 text-white'
                                }`}>
                                  {row.type === 'BILL' ? (isHi ? 'मांग बिल' : 'BILL') : (isHi ? 'जमा भुगतान' : 'PAID')}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-800">{row.documentNumber}</td>
                              <td className="py-2.5 px-3 font-sans text-slate-700">{row.description}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                                {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-slate-900">
                                {formatCurrency(row.runningBalance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    SUB-VIEW 3: MONTHLY BILLS DEMAND
                ────────────────────────────────────────────────────────────── */}
                {tenantSubTab === 'bills' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                      {isHi ? 'माहवार जारी किए गए किराया मांग बिल:' : 'Monthly Rent Demand Bills:'}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                            <th className="py-2.5 px-3">क्र.</th>
                            <th className="py-2.5 px-3">{isHi ? 'बिल संख्या' : 'Bill No.'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'बिल माह' : 'Month'}</th>
                            <th className="py-2.5 px-3 text-right">{isHi ? 'किराया मांग (₹)' : 'Total Due'}</th>
                            <th className="py-2.5 px-3 text-right">{isHi ? 'जमा (₹)' : 'Paid'}</th>
                            <th className="py-2.5 px-3 text-right">{isHi ? 'शेष बकाया (₹)' : 'Balance Due'}</th>
                            <th className="py-2.5 px-3">{isHi ? 'अंतिम देय तिथि' : 'Due Date'}</th>
                            <th className="py-2.5 px-3 text-center">{isHi ? 'स्थिति' : 'Status'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {tenantStatement.rawBills.map((b, idx) => (
                            <tr key={b.id} className="hover:bg-slate-50/60 transition">
                              <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-800">{b.billNumber}</td>
                              <td className="py-2.5 px-3 font-bold">{b.billingMonth}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(b.totalAmountDue)}</td>
                              <td className="py-2.5 px-3 text-right text-slate-900 font-bold">{formatCurrency(b.amountPaid)}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(b.balanceDue)}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-sans">{formatDate(b.dueDate)}</td>
                              <td className="py-2.5 px-3 text-center font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  b.status === 'PAID'
                                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RentLedgerPage;
