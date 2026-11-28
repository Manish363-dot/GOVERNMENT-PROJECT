import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { RentalNavbar } from '../components/RentalNavbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '../context/LanguageContext';
import {
  PublicAvailableShopItem,
  rentalPropertyApi,
} from '../services/rentalProperty.service';
import { toAsciiDigits, transliterateToHindiManual } from '../utils/transliterate';

const TYPE_LABELS_HI: Record<string, string> = {
  COMMERCIAL_SHOP: 'व्यावसायिक दुकान',
  ROADSIDE_STALL: 'सड़क किनारे स्टॉल',
  WAREHOUSE_GODOWN: 'गोदाम / भंडार गृह',
  LAND_PARCEL: 'वाणिज्यिक भूखंड',
  OFFICE_SPACE: 'कार्यालय परिसर',
  OTHER: 'वाणिज्यिक संपत्ति',
};

const TYPE_LABELS_EN: Record<string, string> = {
  COMMERCIAL_SHOP: 'Commercial Shop',
  ROADSIDE_STALL: 'Roadside Stall',
  WAREHOUSE_GODOWN: 'Warehouse / Godown',
  LAND_PARCEL: 'Commercial Land',
  OFFICE_SPACE: 'Office Space',
  OTHER: 'Commercial Asset',
};

const ShopPhotoSlider: React.FC<{
  photos: string[];
  shopName: string;
  shopNumber: string;
  isHi: boolean;
  onZoom: (startIdx: number) => void;
}> = ({ photos, shopName, shopNumber, isHi, onZoom }) => {
  const [idx, setIdx] = useState(0);
  const count = photos.length;

  useEffect(() => {
    if (idx >= count) setIdx(0);
  }, [count, idx]);

  if (count === 0) {
    return (
      <div className="w-full aspect-[16/10] rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center px-4 text-center">
        <Building2 className="w-8 h-8 text-slate-400 mb-2" />
        <span className="text-xs font-semibold text-slate-700">{toAsciiDigits(shopNumber)}</span>
        <span className="text-[11px] text-slate-500 mt-0.5">
          {isHi ? 'फोटो उपलब्ध नहीं है' : 'No site photos uploaded'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
      <img
        src={photos[idx]}
        alt={`${shopName} - ${idx + 1}`}
        onClick={() => onZoom(idx)}
        className="w-full h-full object-cover cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
      />

      <button
        type="button"
        onClick={() => onZoom(idx)}
        className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-slate-900/75 hover:bg-slate-900 text-white text-[11px] font-semibold inline-flex items-center gap-1 transition cursor-pointer"
        aria-label={isHi ? 'फोटो बड़ा देखें' : 'Enlarge photo'}
      >
        <Maximize2 className="w-3 h-3" />
        <span className="tabular-nums">{idx + 1}/{count}</span>
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((prev) => (prev - 1 + count) % count);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center transition cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((prev) => (prev + 1) % count);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center transition cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/55">
            {photos.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(dotIdx);
                }}
                aria-label={`Photo ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  dotIdx === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const AvailableShopsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { language } = useLanguage();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));

  const [shops, setShops] = useState<PublicAvailableShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [translatingSearch, setTranslatingSearch] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [lightbox, setLightbox] = useState<{
    shop: PublicAvailableShopItem;
    photoIdx: number;
  } | null>(null);

  const loadAvailableShops = async (force = false) => {
    try {
      const res = await rentalPropertyApi.listPublicAvailableProperties(force);
      if (res?.data && Array.isArray(res.data)) {
        setShops(res.data);
      }
    } catch (err) {
      console.warn('Could not load available shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadAvailableShops(false);
    const interval = setInterval(() => loadAvailableShops(true), 25_000);
    return () => clearInterval(interval);
  }, []);

  const handleTransliterateSearch = async () => {
    if (!searchTerm.trim()) return;
    setTranslatingSearch(true);
    try {
      const converted = await transliterateToHindiManual(searchTerm);
      setSearchTerm(converted);
    } finally {
      setTranslatingSearch(false);
    }
  };

  const filteredShops = useMemo(() => {
    const q = toAsciiDigits(searchTerm.trim()).toLowerCase();
    return shops.filter((shop) => {
      if (typeFilter !== 'ALL' && shop.propertyType !== typeFilter) return false;
      if (!q) return true;
      return (
        toAsciiDigits(shop.propertyName).toLowerCase().includes(q) ||
        toAsciiDigits(shop.propertyNumber).toLowerCase().includes(q) ||
        toAsciiDigits(shop.address || '').toLowerCase().includes(q) ||
        toAsciiDigits(shop.location || '').toLowerCase().includes(q)
      );
    });
  }, [shops, searchTerm, typeFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-white w-full overflow-x-hidden font-sans">
      <RentalNavbar />

      <main className="flex-1 w-full bg-white">
        {/* ── Top Government Banner (Slim — Matches Bylaws Banner) ── */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800/80 shadow-xs">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-1.5 h-5 sm:h-6 bg-amber-400 rounded-full shrink-0" />
              <h1 className="text-base sm:text-xl md:text-2xl font-extrabold font-poppins text-white tracking-tight leading-snug">
                {isHi
                  ? 'आवंटन हेतु उपलब्ध दुकानें एवं परिसर'
                  : 'Available Commercial Shops Directory'}
              </h1>
            </div>

            {!loading && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white tabular-nums">
                {isHi ? `कुल उपलब्ध: ${filteredShops.length}` : `${filteredShops.length} Available`}
              </span>
            )}
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
          {/* 1. Single Shared Allotment Contact Desk (Top Starting Strip) */}
          <section className="rounded-lg bg-slate-50 border border-slate-200 border-l-4 border-l-[#0B3B60] p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#0B3B60]">
                  {isHi
                    ? 'आवंटन संपर्क कार्यालय • कार्यालय जिला पंचायत अल्मोड़ा'
                    : 'Allotment Contact Desk • Office of Zila Panchayat Almora'}
                </p>
                <p className="text-xs sm:text-sm text-slate-600">
                  {isHi
                    ? 'जिला पंचायत कार्यालय, धारानौला, अल्मोड़ा, उत्तराखण्ड — 263601'
                    : 'Zila Panchayat Office, Dharanaula, Almora, Uttarakhand — 263601'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                <a
                  href="tel:+919456790163"
                  className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#0B3B60] text-sm font-semibold text-slate-900 tabular-nums transition"
                >
                  <Phone className="w-4 h-4 text-[#0B3B60] shrink-0" />
                  <span>+91 9456790163</span>
                </a>

                <a
                  href="mailto:ama@zilapanchayatalmora.in"
                  className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#0B3B60] text-xs sm:text-sm font-semibold text-slate-800 transition min-w-0"
                >
                  <Mail className="w-4 h-4 text-[#0B3B60] shrink-0" />
                  <span className="truncate">ama@zilapanchayatalmora.in</span>
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#0B3B60] hover:bg-slate-900 text-white text-xs sm:text-sm font-bold transition"
                >
                  {isHi ? 'ऑनलाइन पूछताछ' : 'Online Inquiry'}
                </Link>
              </div>
            </div>
          </section>

          {/* 2. Clean Search & Category Filter Row */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  isHi
                    ? 'दुकान संख्या, नाम या स्थान से खोजें...'
                    : 'Search by shop code, name or location...'
                }
                className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B3B60] focus:outline-none"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleTransliterateSearch}
                  disabled={translatingSearch || !searchTerm.trim()}
                  title={isHi ? 'English शब्द को हिंदी में बदलें' : 'Convert English search text to Hindi'}
                  className="text-xs text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 disabled:opacity-45 px-2 py-1 rounded font-semibold transition cursor-pointer"
                >
                  {translatingSearch ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : (
                    '🌐'
                  )}
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title={isHi ? 'साफ़ करें' : 'Clear'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-56 bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-lg px-3.5 py-2.5 focus:border-[#0B3B60] focus:outline-none"
            >
              <option value="ALL">{isHi ? 'सभी श्रेणियां' : 'All Categories'}</option>
              <option value="COMMERCIAL_SHOP">{isHi ? TYPE_LABELS_HI.COMMERCIAL_SHOP : TYPE_LABELS_EN.COMMERCIAL_SHOP}</option>
              <option value="ROADSIDE_STALL">{isHi ? TYPE_LABELS_HI.ROADSIDE_STALL : TYPE_LABELS_EN.ROADSIDE_STALL}</option>
              <option value="WAREHOUSE_GODOWN">{isHi ? TYPE_LABELS_HI.WAREHOUSE_GODOWN : TYPE_LABELS_EN.WAREHOUSE_GODOWN}</option>
              <option value="LAND_PARCEL">{isHi ? TYPE_LABELS_HI.LAND_PARCEL : TYPE_LABELS_EN.LAND_PARCEL}</option>
              <option value="OFFICE_SPACE">{isHi ? TYPE_LABELS_HI.OFFICE_SPACE : TYPE_LABELS_EN.OFFICE_SPACE}</option>
              <option value="OTHER">{isHi ? TYPE_LABELS_HI.OTHER : TYPE_LABELS_EN.OTHER}</option>
            </select>
          </section>

          {/* 3. Clean Editorial Shop Directory List (No Cards, Mobile-First) */}
          <section>
            {loading ? (
              <div className="divide-y divide-slate-200 border-t border-slate-200">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="py-6 sm:py-8 flex flex-col md:flex-row gap-6 animate-pulse">
                    <div className="w-full md:w-[320px] lg:w-[360px] aspect-[16/10] bg-slate-100 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <div className="h-5 w-36 bg-slate-100 rounded" />
                      <div className="h-6 w-2/3 bg-slate-100 rounded" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded" />
                      <div className="h-14 w-full bg-slate-100 rounded pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="py-14 text-center space-y-2.5 border-y border-slate-200">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  {isHi
                    ? 'वर्तमान में कोई उपलब्ध दुकान नहीं मिली'
                    : 'No available shops found matching your filter'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  {isHi
                    ? 'कृपया खोज फ़िल्टर बदलें या ऊपर दिए गए संपर्क कार्यालय से जानकारी प्राप्त करें।'
                    : 'Please clear your filter or reach out using the Allotment Contact Desk above.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {filteredShops.map((shop) => {
                  const typeLabel = isHi
                    ? TYPE_LABELS_HI[shop.propertyType] || TYPE_LABELS_HI.OTHER
                    : TYPE_LABELS_EN[shop.propertyType] || TYPE_LABELS_EN.OTHER;
                  const gstAmt = Math.round(shop.baseMonthlyRent * 0.18);
                  const totalMonthly = shop.baseMonthlyRent + gstAmt;

                  return (
                    <article
                      key={shop.id}
                      className="py-6 sm:py-8 flex flex-col md:flex-row gap-5 md:gap-8 items-start"
                    >
                      {/* Shop Photo */}
                      <div className="w-full md:w-[320px] lg:w-[360px] shrink-0">
                        <ShopPhotoSlider
                          photos={shop.photoUrls || []}
                          shopName={shop.propertyName}
                          shopNumber={shop.propertyNumber}
                          isHi={isHi}
                          onZoom={(startIdx) => setLightbox({ shop, photoIdx: startIdx })}
                        />
                      </div>

                      {/* Shop Details */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                          <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-800 tabular-nums">
                            {toAsciiDigits(shop.propertyNumber)}
                          </span>
                          <span className="text-slate-500 font-medium">{typeLabel}</span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug break-words">
                          {toAsciiDigits(shop.propertyName)}
                        </h2>

                        <div className="flex items-start gap-2 text-sm text-slate-600 mt-1.5">
                          <MapPin className="w-4 h-4 text-[#0B3B60] shrink-0 mt-0.5" />
                          <span className="leading-relaxed break-words">
                            {toAsciiDigits(shop.address || shop.location)}
                          </span>
                        </div>

                        {/* Clean Responsive Key-Value Spec Bar (Stacked rows on Phone, 3 Columns on Desktop) */}
                        <dl className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6">
                          <div className="flex items-baseline justify-between gap-3 sm:block">
                            <dt className="text-xs font-medium text-slate-500">
                              {isHi ? 'मासिक किराया' : 'Monthly Rent'}
                            </dt>
                            <dd className="text-base sm:text-lg font-bold text-slate-900 sm:mt-0.5 tabular-nums">
                              ₹{shop.baseMonthlyRent.toLocaleString('en-IN')}
                              <span className="text-xs font-normal text-slate-500">
                                {isHi ? ' / माह' : ' / mo'}
                              </span>
                            </dd>
                          </div>

                          <div className="flex items-baseline justify-between gap-3 sm:block">
                            <dt className="text-xs font-medium text-slate-500">
                              {isHi ? 'कुल (18% GST सहित)' : 'Total (Incl. 18% GST)'}
                            </dt>
                            <dd className="text-base sm:text-lg font-bold text-[#0B3B60] sm:mt-0.5 tabular-nums">
                              ₹{totalMonthly.toLocaleString('en-IN')}
                              <span className="text-xs font-normal text-slate-500">
                                {' '}
                                (+₹{gstAmt.toLocaleString('en-IN')})
                              </span>
                            </dd>
                          </div>

                          <div className="flex items-baseline justify-between gap-3 sm:block">
                            <dt className="text-xs font-medium text-slate-500">
                              {isHi ? 'क्षेत्रफल (Area)' : 'Floor Area'}
                            </dt>
                            <dd className="text-sm sm:text-base font-bold text-slate-900 sm:mt-1 tabular-nums">
                              {shop.dimensionsSqft
                                ? isHi
                                  ? `${shop.dimensionsSqft} वर्ग फुट`
                                  : `${shop.dimensionsSqft} Sq. Ft`
                                : isHi
                                  ? 'मानक इकाई'
                                  : 'Standard Unit'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Clean Photo Lightbox Only */}
      {lightbox && lightbox.shop.photoUrls && lightbox.shop.photoUrls.length > 0 && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-slate-950 rounded-xl border border-slate-700 shadow-2xl max-w-3xl w-full overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800 text-white">
              <p className="text-sm font-semibold truncate">
                {toAsciiDigits(lightbox.shop.propertyName)} ({toAsciiDigits(lightbox.shop.propertyNumber)})
              </p>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Close photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-[60vh] sm:h-[70vh] bg-black flex items-center justify-center">
              <img
                src={lightbox.shop.photoUrls[lightbox.photoIdx] || lightbox.shop.photoUrls[0]}
                alt={lightbox.shop.propertyName}
                className="w-full h-full object-contain"
              />
              {lightbox.shop.photoUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              photoIdx:
                                (prev.photoIdx - 1 + prev.shop.photoUrls.length) %
                                prev.shop.photoUrls.length,
                            }
                          : null
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox((prev) =>
                        prev
                          ? {
                              ...prev,
                              photoIdx: (prev.photoIdx + 1) % prev.shop.photoUrls.length,
                            }
                          : null
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableShopsPage;
