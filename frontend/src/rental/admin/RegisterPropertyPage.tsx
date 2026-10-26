import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { useLanguage } from "../context/LanguageContext";
import { rentalPropertyApi, CreatePropertyInput } from "../services/rentalProperty.service";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

const PROPERTY_TYPES: Array<{
  value: CreatePropertyInput["propertyType"];
  labelHi: string;
  labelEn: string;
}> = [
  { value: "COMMERCIAL_SHOP", labelHi: "व्यावसायिक दुकान (Commercial Shop)", labelEn: "Commercial Shop" },
  { value: "ROADSIDE_STALL", labelHi: "सड़क किनारे स्टॉल (Roadside Stall)", labelEn: "Roadside Stall" },
  { value: "WAREHOUSE_GODOWN", labelHi: "गोदाम / वेयरहाउस (Warehouse / Godown)", labelEn: "Warehouse / Godown" },
  { value: "LAND_PARCEL", labelHi: "भूखंड / जमीन (Land Parcel)", labelEn: "Land Parcel" },
  { value: "OFFICE_SPACE", labelHi: "कार्यालय स्थान (Office Space)", labelEn: "Office Space" },
  { value: "OTHER", labelHi: "अन्य (Other)", labelEn: "Other" },
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
    location: "",
    address: "",
    dimensionsSqft: undefined,
    baseMonthlyRent: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ propertyNumber: string; propertyName: string } | null>(null);

  const set = <K extends keyof CreatePropertyInput>(key: K, val: CreatePropertyInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.propertyName.trim()) { setError(isHi ? "संपत्ति / दुकान का नाम अनिवार्य है।" : "Property / shop name is required."); return; }
    if (!form.propertyNumber.trim()) { setError(isHi ? "दुकान संख्या / कोड अनिवार्य है।" : "Property number / code is required."); return; }
    if (!form.location.trim()) { setError(isHi ? "स्थान (Location) अनिवार्य है।" : "Location is required."); return; }
    if (!form.address.trim()) { setError(isHi ? "पूरा पता अनिवार्य है।" : "Detailed address is required."); return; }
    if (!form.baseMonthlyRent || form.baseMonthlyRent < 1) { setError(isHi ? "आधार मासिक किराया ₹1 से अधिक होना अनिवार्य है।" : "Base monthly rent must be greater than ₹0."); return; }
    setSubmitting(true);
    try {
      await rentalPropertyApi.createProperty(form);
      setSuccess({ propertyNumber: form.propertyNumber, propertyName: form.propertyName });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || (isHi ? "संपत्ति पंजीकरण विफल रहा।" : "Failed to register property."));
    } finally { setSubmitting(false); }
  };

  const handleReset = () => {
    setSuccess(null); setError("");
    setForm({ propertyName: "", propertyType: "COMMERCIAL_SHOP", propertyNumber: "", location: "", address: "", dimensionsSqft: undefined, baseMonthlyRent: 0 });
  };

  if (success) {
    return (
      <AdminLayout
        title={isHi ? "संपत्ति सफलतापूर्वक पंजीकृत हुई" : "Property Registered Successfully"}
        subtitle={isHi ? "जिला पंचायत अल्मोड़ा — संपत्ति रजिस्टर" : "Zila Panchayat Almora — Property Register"}
        breadcrumbs={[{ label: isHi ? "संपत्ति प्रबंधन" : "Property Management", to: "/rental/admin/properties" }, { label: isHi ? "नई संपत्ति पंजीकृत करें" : "Register New Property" }]}
      >
        <div className="max-w-xl mx-auto mt-12 text-center px-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">{isHi ? "संपत्ति सफलतापूर्वक पंजीकृत हुई!" : "Property Registered Successfully!"}</h2>
          <p className="text-sm text-slate-500 mb-1">{isHi ? "दुकान संख्या:" : "Property No:"} <span className="font-bold text-slate-800 font-mono">{success.propertyNumber}</span></p>
          <p className="text-sm text-slate-500 mb-8">{isHi ? "नाम:" : "Name:"} <span className="font-semibold text-slate-800">{success.propertyName}</span></p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleReset} className="px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">{isHi ? "+ एक और संपत्ति पंजीकृत करें" : "+ Register Another Property"}</button>
            <button onClick={() => navigate("/rental/admin/properties")} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold transition">{isHi ? "संपत्ति सूची देखें" : "View Property List"}</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isHi ? "नई दुकान / संपत्ति पंजीकृत करें" : "Register New Shop / Property"}
      subtitle={isHi ? "जिला पंचायत अल्मोड़ा — संपत्ति रजिस्टर" : "Zila Panchayat Almora — Property Register"}
      breadcrumbs={[{ label: isHi ? "संपत्ति प्रबंधन" : "Property Management", to: "/rental/admin/properties" }, { label: isHi ? "नई संपत्ति पंजीकृत करें" : "Register New Property" }]}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <NavLink to="/rental/admin/properties" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{isHi ? "नई दुकान / परिसंपत्ति पंजीकृत करें" : "Register New Shop / Property"}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{isHi ? "जिला पंचायत अल्मोड़ा — संपत्ति रजिस्टर" : "Zila Panchayat Almora — Property Register"}</p>
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
            <span className="text-sm font-extrabold uppercase tracking-wider text-slate-700">{isHi ? "संपत्ति / दुकान विवरण" : "Property / Shop Details"}</span>
          </div>

          <div className="px-6 py-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{isHi ? "संपत्ति / दुकान का नाम *" : "Property / Shop Name *"}</label>
              <input type="text" required value={form.propertyName} onChange={(e) => set("propertyName", e.target.value)} placeholder={isHi ? "उदा. दुकान नं. 12, भूतल, माल रोड" : "e.g., Shop No. 12, Ground Floor, Mall Road"} className={IC} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{isHi ? "दुकान / संपत्ति संख्या (कोड) *" : "Property Number / Code *"}</label>
                <input type="text" required value={form.propertyNumber} onChange={(e) => set("propertyNumber", e.target.value.toUpperCase())} placeholder="e.g., SHOP-12" className={`${IC} font-mono uppercase`} />
                <p className="text-[10px] text-slate-400 mt-1">{isHi ? "* यह कोड आवंटन में उपयोग होगा" : "* This code is used in allotment records"}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{isHi ? "संपत्ति का प्रकार *" : "Property Type *"}</label>
                <select value={form.propertyType} onChange={(e) => set("propertyType", e.target.value as CreatePropertyInput["propertyType"])} className={IC}>
                  {PROPERTY_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{isHi ? pt.labelHi : pt.labelEn}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{isHi ? "स्थान / बाजार का नाम *" : "Location / Market Name *"}</label>
                <input type="text" required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder={isHi ? "उदा. माल रोड, अल्मोड़ा" : "e.g., Mall Road, Almora"} className={IC} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{isHi ? "क्षेत्रफल (वर्ग फुट — वैकल्पिक)" : "Area in Sq. Ft (Optional)"}</label>
                <input type="number" min={0} value={form.dimensionsSqft ?? ""} onChange={(e) => set("dimensionsSqft", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g., 120" className={`${IC} font-mono`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{isHi ? "पूरा पता (विस्तृत) *" : "Detailed Address *"}</label>
              <textarea required rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder={isHi ? "उदा. गांधी चौक के पास, माल रोड, अल्मोड़ा, उत्तराखंड — 263601" : "e.g., Near Gandhi Chowk, Mall Road, Almora, Uttarakhand — 263601"} className={IC} />
            </div>

            <div className="max-w-xs">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{isHi ? "आधार मासिक किराया (₹/माह) *" : "Base Monthly Rent (₹/month) *"}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm select-none">₹</span>
                <input type="number" required min={1} value={form.baseMonthlyRent || ""} onChange={(e) => set("baseMonthlyRent", Number(e.target.value))} placeholder="2500" className={`${IC} pl-8 font-mono font-semibold`} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{isHi ? "* यह आवंटन के समय डिफ़ॉल्ट किराया होगा" : "* This will be the default rent at time of allotment"}</p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <NavLink to="/rental/admin/properties" className="text-sm text-slate-500 hover:text-slate-800 font-medium transition">{isHi ? "← रद्द करें" : "← Cancel"}</NavLink>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
              {submitting ? (isHi ? "पंजीकृत किया जा रहा है..." : "Registering...") : (isHi ? "संपत्ति पंजीकृत करें" : "Register Property")}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-slate-400 mt-5 leading-relaxed">
          {isHi ? "यह रिकॉर्ड जिला पंचायत अल्मोड़ा के संपत्ति रजिस्टर में स्थायी रूप से दर्ज होगा। कृपया सभी जानकारी सत्यापित करके ही सबमिट करें।" : "This record will be permanently entered into the Zila Panchayat Almora property register. Please verify all details before submission."}
        </p>
      </div>
    </AdminLayout>
  );
};

export default RegisterPropertyPage;
