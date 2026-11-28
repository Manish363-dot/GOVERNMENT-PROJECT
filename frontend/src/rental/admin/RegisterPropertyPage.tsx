import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { useLanguage } from "../context/LanguageContext";
import { rentalPropertyApi, CreatePropertyInput } from "../services/rentalProperty.service";
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { api } from "@/services/api";

const PROPERTY_TYPES: Array<{
  value: CreatePropertyInput["propertyType"];
  labelHi: string;
  labelEn: string;
}> = [
  { value: "COMMERCIAL_SHOP", labelHi: "व्यावसायिक दुकान", labelEn: "Commercial Shop" },
  { value: "ROADSIDE_STALL", labelHi: "सड़क किनारे स्टॉल", labelEn: "Roadside Stall" },
  { value: "WAREHOUSE_GODOWN", labelHi: "गोदाम / वेयरहाउस", labelEn: "Warehouse / Godown" },
  { value: "LAND_PARCEL", labelHi: "भूखंड", labelEn: "Land" },
  { value: "OFFICE_SPACE", labelHi: "कार्यालय", labelEn: "Office Space" },
  { value: "OTHER", labelHi: "अन्य", labelEn: "Other" },
];

const IC = "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white transition";

export const RegisterPropertyPage = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const navigate = useNavigate();

  const [form, setForm] = useState<CreatePropertyInput>({
    propertyName: "",
    propertyType: "COMMERCIAL_SHOP",
    propertyNumber: "",
    address: "",
    dimensionsSqft: undefined,
    baseMonthlyRent: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ propertyNumber: string; propertyName: string } | null>(null);
  const [transliterating, setTransliterating] = useState<string | null>(null);

  const handleAutoTransliterate = async (
    field: "propertyName" | "address",
    value: string
  ) => {
    if (!value || !value.trim() || !/[a-zA-Z]/.test(value)) return;
    setTransliterating(field);
    try {
      const res = await api.post<{ success: boolean; hindi: string }>("/rental/transliterate", {
        text: value.trim(),
      });
      if (res && res.hindi && res.hindi.trim()) {
        set(field, res.hindi);
      }
    } catch (err) {
      console.warn("Transliteration failed", err);
    } finally {
      setTransliterating(null);
    }
  };

  const set = <K extends keyof CreatePropertyInput>(key: K, val: CreatePropertyInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.propertyName?.trim()) {
      setError(isHi ? "दुकान / संपत्ति का नाम अनिवार्य है।" : "Shop / property name is required.");
      return;
    }
    if (!form.propertyNumber.trim()) {
      setError(isHi ? "दुकान कोड अनिवार्य है।" : "Shop code is required.");
      return;
    }
    if (!form.address.trim()) {
      setError(isHi ? "दुकान का पता अनिवार्य है।" : "Shop address is required.");
      return;
    }
    if (!form.baseMonthlyRent || form.baseMonthlyRent < 1) {
      setError(isHi ? "मासिक किराया ₹1 से अधिक होना अनिवार्य है।" : "Monthly rent must be greater than ₹0.");
      return;
    }
    setSubmitting(true);
    try {
      await rentalPropertyApi.createProperty({
        propertyName: form.propertyName.trim(),
        propertyNumber: form.propertyNumber.trim(),
        propertyType: form.propertyType,
        address: form.address.trim(),
        dimensionsSqft: form.dimensionsSqft,
        baseMonthlyRent: form.baseMonthlyRent,
      });
      setSuccess({ propertyNumber: form.propertyNumber, propertyName: form.propertyName.trim() });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || (isHi ? "दुकान पंजीकरण विफल रहा।" : "Failed to register shop."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setError("");
    setForm({
      propertyName: "",
      propertyType: "COMMERCIAL_SHOP",
      propertyNumber: "",
      address: "",
      dimensionsSqft: undefined,
      baseMonthlyRent: 0,
    });
  };

  if (success) {
    return (
      <AdminLayout
        title={isHi ? "दुकान सफलतापूर्वक पंजीकृत हुई" : "Shop Registered Successfully"}
      >
        <div className="max-w-xl mx-auto mt-12 text-center px-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            {isHi ? "दुकान सफलतापूर्वक पंजीकृत हुई!" : "Shop Registered Successfully!"}
          </h2>
          <p className="text-sm text-slate-500 mb-1">
            {isHi ? "दुकान कोड:" : "Shop Code:"}{" "}
            <span className="font-bold text-slate-800 font-mono">{success.propertyNumber}</span>
          </p>
          <p className="text-sm text-slate-500 mb-8">
            {isHi ? "दुकान का नाम:" : "Shop Name:"}{" "}
            <span className="font-semibold text-slate-800">{success.propertyName}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {isHi ? "+ एक और दुकान पंजीकृत करें" : "+ Register Another Shop"}
            </button>
            <button
              onClick={() => navigate("/rental/admin/properties")}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold transition cursor-pointer"
            >
              {isHi ? "संपत्ति सूची देखें" : "View Property List"}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isHi ? "संपत्ति पंजीकृत करें" : "Register New Shop"}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <NavLink
            to="/rental/admin/properties"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
              {isHi ? "नई दुकान / परिसंपत्ति पंजीकृत करें" : "Register New Shop / Property"}
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2.5">
            <span className="w-1.5 h-5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
              {isHi ? "संपत्ति / दुकान विवरण" : "Property / Shop Details"}
            </span>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* 1. Shop Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isHi ? "दुकान / संपत्ति का नाम" : "Shop / Property Name"}
                </label>
                {transliterating === "propertyName" ? (
                  <span className="text-[10px] text-amber-600 font-bold animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />{" "}
                    {isHi ? "हिंदी में बदल रहा है..." : "Translating..."}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAutoTransliterate("propertyName", form.propertyName || "")}
                    className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="English नाम को हिंदी में बदलने के लिए क्लिक करें"
                  >
                    <span>🌐</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={form.propertyName ?? ""}
                onChange={(e) => set("propertyName", e.target.value)}
                onBlur={() => handleAutoTransliterate("propertyName", form.propertyName || "")}
                className={IC}
              />
            </div>

            {/* 2. Shop Code & Property Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? "दुकान कोड" : "Shop Code"} 
                </label>
                <input
                  type="text"
                  required
                  value={form.propertyNumber}
                  onChange={(e) => set("propertyNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. SHOP-101"
                  className={`${IC} font-mono uppercase`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? "संपत्ति का प्रकार" : "Property Type"}
                </label>
                <select
                  value={form.propertyType}
                  onChange={(e) => set("propertyType", e.target.value as CreatePropertyInput["propertyType"])}
                  className={IC}
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {isHi ? pt.labelHi : pt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Shop Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isHi ? "दुकान का पता" : "Shop Address"}
                </label>
                {transliterating === "address" ? (
                  <span className="text-[10px] text-amber-600 font-bold animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />{" "}
                    {isHi ? "हिंदी में बदल रहा है..." : "Translating..."}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAutoTransliterate("address", form.address)}
                    className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="English पते को हिंदी में बदलने के लिए क्लिक करें"
                  >
                    <span>🌐</span>
                  </button>
                )}
              </div>
              <textarea
                required
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                onBlur={() => handleAutoTransliterate("address", form.address)}
                placeholder={isHi ? "उदा. गांधी चौक के पास, मॉल रोड, अल्मोड़ा" : "e.g. Near Gandhi Chowk, Mall Road, Almora"}
                className={IC}
              />
            </div>

            {/* 4. Area in Sq. Ft (Optional) & Monthly Rent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? "क्षेत्रफल वर्ग फुट (वैकल्पिक)" : "Area in Sq. Ft (Optional)"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.dimensionsSqft ?? ""}
                  onChange={(e) =>
                    set("dimensionsSqft", e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="e.g., 120"
                  className={`${IC} font-mono`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? "मासिक किराया (₹/माह)" : "Monthly Rent (₹/month)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.baseMonthlyRent || ""}
                    onChange={(e) => set("baseMonthlyRent", Number(e.target.value))}
                    placeholder="2500"
                    className={`${IC} pl-8 font-mono font-semibold`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <NavLink
              to="/rental/admin/properties"
              className="text-sm text-slate-500 hover:text-slate-800 font-medium transition"
            >
              {isHi ? "← रद्द करें" : "← Cancel"}
            </NavLink>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              {submitting
                ? isHi
                  ? "पंजीकृत किया जा रहा है..."
                  : "Registering..."
                : isHi
                ? "दुकान पंजीकृत करें"
                : "Register Shop"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default RegisterPropertyPage;
