import React, { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { useLanguage } from "../context/LanguageContext";
import { rentalPropertyApi, CreatePropertyInput } from "../services/rentalProperty.service";
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, ImagePlus, X } from "lucide-react";
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

const IC =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white transition";

export const RegisterPropertyPage = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<CreatePropertyInput>({
    propertyName: "",
    propertyType: "COMMERCIAL_SHOP",
    propertyNumber: "",
    address: "",
    dimensionsSqft: undefined,
    baseMonthlyRent: 0,
  });

  const [selectedPhotos, setSelectedPhotos] = useState<Array<{ file: File; previewUrl: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ propertyNumber: string; propertyName: string } | null>(null);
  const [transliterating, setTransliterating] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

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

  const handleSelectPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");

    const remainingSlots = 3 - selectedPhotos.length;
    if (remainingSlots <= 0) {
      setError(
        isHi
          ? "एक दुकान के लिए अधिकतम 3 फोटो ही जोड़ी जा सकती हैं।"
          : "Maximum 3 photos can be added per shop."
      );
      e.target.value = "";
      return;
    }

    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length !== files.length) {
      setError(
        isHi
          ? "कृपया केवल वैध इमेज फ़ाइलें चुनें।"
          : "Please select valid image files only (JPG, PNG, WEBP)."
      );
    }

    const toAdd = validImageFiles.slice(0, remainingSlots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (validImageFiles.length > remainingSlots) {
      setError(
        isHi
          ? "अधिकतम 3 फोटो की सीमा के कारण केवल पहली उपलब्ध फोटो जोड़ी गईं।"
          : "Only up to 3 photos total are permitted per shop."
      );
    }

    setSelectedPhotos((prev) => [...prev, ...toAdd].slice(0, 3));
    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

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
        photos: selectedPhotos.map((p) => p.file),
      });
      setSuccess({ propertyNumber: form.propertyNumber, propertyName: form.propertyName.trim() });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          (isHi ? "दुकान पंजीकरण विफल रहा।" : "Failed to register shop.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setSelectedPhotos([]);
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
          <p className="text-sm text-slate-600 mb-1">
            {isHi ? "दुकान कोड:" : "Shop Code:"}{" "}
            <span className="font-bold text-slate-900 font-mono">{success.propertyNumber}</span>
          </p>
          <p className="text-sm text-slate-600 mb-3">
            {isHi ? "दुकान का नाम:" : "Shop Name:"}{" "}
            <span className="font-semibold text-slate-900">{success.propertyName}</span>
          </p>
          <p className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 mb-7 inline-block">
            {isHi
              ? "यह उपलब्ध दुकान अब रेंटल पोर्टल के मुख्य पृष्ठ पर नागरिकों को दिखाई दे रही है।"
              : "This available shop is now visible to citizens on the Rental Landing Page."}
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
              className="px-6 py-2.5 rounded-xl bg-[#0B3B60] hover:bg-slate-900 text-white text-sm font-bold transition cursor-pointer"
            >
              {isHi ? "संपत्ति सूची देखें" : "View Property List"}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isHi ? "संपत्ति पंजीकृत करें" : "Register New Shop"}>
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

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-[#0B3B60] text-white flex items-center justify-between">
            <span className="text-sm font-extrabold uppercase tracking-wider">
              {isHi ? "संपत्ति / दुकान विवरण" : "Property / Shop Details"}
            </span>
            <span className="text-[11px] font-semibold text-slate-200">
              {isHi ? "कार्यालय जिला पंचायत अल्मोड़ा" : "Zila Panchayat Almora"}
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
                  <span className="text-[10px] text-slate-600 font-bold animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />{" "}
                    {isHi ? "हिंदी में बदल रहा है..." : "Translating..."}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAutoTransliterate("propertyName", form.propertyName || "")}
                    className="text-[10px] text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="हिंदी लिप्यंतरण"
                  >
                    <span>{isHi ? "हिंदी में बदलें" : "Transliterate"}</span>
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
                  placeholder={isHi ? "उदा. SHOP-101" : "e.g. SHOP-101"}
                  className={`${IC} font-mono uppercase`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? "संपत्ति का प्रकार" : "Property Type"}
                </label>
                <select
                  value={form.propertyType}
                  onChange={(e) =>
                    set("propertyType", e.target.value as CreatePropertyInput["propertyType"])
                  }
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
                  {isHi ? "दुकान का पता / बाजार स्थान" : "Shop Address / Market Location"}
                </label>
                {transliterating === "address" ? (
                  <span className="text-[10px] text-slate-600 font-bold animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />{" "}
                    {isHi ? "हिंदी में बदल रहा है..." : "Translating..."}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAutoTransliterate("address", form.address)}
                    className="text-[10px] text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="हिंदी लिप्यंतरण"
                  >
                    <span>{isHi ? "हिंदी में बदलें" : "Transliterate"}</span>
                  </button>
                )}
              </div>
              <textarea
                required
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                onBlur={() => handleAutoTransliterate("address", form.address)}
                placeholder={
                  isHi
                    ? "उदा. गांधी चौक के पास, मॉल रोड, अल्मोड़ा"
                    : "e.g. Near Gandhi Chowk, Mall Road, Almora"
                }
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
                  placeholder="120"
                  className={`${IC} font-mono`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? "मासिक आधार किराया (₹/माह)" : "Monthly Base Rent (₹/month)"}
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

            {/* 5. Shop Photos Upload (1, 2, or up to 3 photos) */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    {isHi
                      ? "दुकान की फोटो जोड़ें (अधिकतम 3 फोटो)"
                      : "Shop Photos (Optional — Up to 3 Photos)"}
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isHi
                      ? "ये फोटो रेंटल पोर्टल पर उपलब्ध दुकानों की सूची में नागरिकों को दिखेंगी। दुकान आवंटित होते ही सूची से स्वतः हट जाएगी।"
                      : "Shown on the public Rental Portal while the shop is vacant, and automatically hidden once allotted."}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded">
                  {selectedPhotos.length} / 3
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple
                onChange={handleSelectPhotos}
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {selectedPhotos.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group h-32 rounded-xl overflow-hidden border border-slate-300 bg-slate-100"
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Shop photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold">
                      {isHi ? `फोटो ${idx + 1}` : `Photo ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/85 hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer"
                      title={isHi ? "हटाएं" : "Remove"}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {selectedPhotos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0B3B60] bg-slate-50 hover:bg-slate-100/70 flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:text-[#0B3B60] transition cursor-pointer p-3"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs font-bold">
                      {isHi ? "+ फोटो चुनें" : "+ Add Photo"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isHi
                        ? `${3 - selectedPhotos.length} और जोड़ सकते हैं`
                        : `${3 - selectedPhotos.length} slot(s) left`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <NavLink
              to="/rental/admin/properties"
              className="text-sm text-slate-600 hover:text-slate-900 font-semibold transition"
            >
              {isHi ? "← रद्द करें" : "← Cancel"}
            </NavLink>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#0B3B60] hover:bg-slate-900 text-white font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer"
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
