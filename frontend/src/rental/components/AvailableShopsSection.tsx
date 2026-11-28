import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import {
  rentalPropertyApi,
  PublicAvailableShopItem,
} from '../services/rentalProperty.service';
import {
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Maximize2,
} from 'lucide-react';

const TYPE_LABELS_HI: Record<string, string> = {
  COMMERCIAL_SHOP: 'व्यावसायिक दुकान',
  ROADSIDE_STALL: 'सड़क किनारे स्टॉल',
  WAREHOUSE_GODOWN: 'गोदाम / भंडार गृह',
  LAND_PARCEL: 'वाणिज्यिक भूखंड',
  OFFICE_SPACE: 'कार्यालय परिसर',
  OTHER: 'अन्य वाणिज्यिक संपत्ति',
};

const TYPE_LABELS_EN: Record<string, string> = {
  COMMERCIAL_SHOP: 'Commercial Shop',
  ROADSIDE_STALL: 'Roadside Stall',
  WAREHOUSE_GODOWN: 'Warehouse / Godown',
  LAND_PARCEL: 'Commercial Land',
  OFFICE_SPACE: 'Office Space',
  OTHER: 'Commercial Asset',
};

const ShopCardGallery: React.FC<{
  photos: string[];
  shopNumber: string;
  shopName: string;
  isHi: boolean;
  onOpenDetail: () => void;
}> = ({ photos, shopNumber, shopName, isHi, onOpenDetail }) => {
  const [idx, setIdx] = useState(0);
  const count = photos.length;

  useEffect(() => {
    if (idx >= count) setIdx(0);
  }, [count, idx]);

  if (count === 0) {
    return (
      <div
        onClick={onOpenDetail}
        className="relative h-48 bg-slate-100 border-b border-slate-200 flex flex-col items-center justify-center px-4 text-center cursor-pointer group"
      >
        <div className="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-[#0B3B60] mb-2 shadow-2xs group-hover:scale-105 transition">
          <Building2 className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-800">{shopName}</p>
        <p className="text-[11px] font-mono text-slate-500 mt-0.5">{shopNumber}</p>
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#0B3B60] text-white text-[10.5px] font-bold shadow-xs">
          {isHi ? 'आवंटन हेतु उपलब्ध' : 'Available for Allotment'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-48 bg-slate-900 border-b border-slate-200 overflow-hidden group">
      <img
        src={photos[idx]}
        alt={`${shopName} - ${idx + 1}`}
        onClick={onOpenDetail}
        className="w-full h-full object-cover cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
      />

      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#0B3B60]/95 text-white text-[10.5px] font-bold shadow-xs">
        {isHi ? 'आवंटन हेतु उपलब्ध' : 'Available for Allotment'}
      </span>

      <button
        type="button"
        onClick={onOpenDetail}
        className="absolute top-3 right-3 w-7 h-7 rounded-md bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center transition cursor-pointer"
        title={isHi ? 'बड़ा देखें' : 'View Larger'}
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((prev) => (prev - 1 + count) % count);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition cursor-pointer"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-mono font-bold flex items-center gap-1.5">
            {photos.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(dotIdx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition cursor-pointer ${dotIdx === idx ? 'bg-white scale-125' : 'bg-white/45'
                  }`}
              />
            ))}
            <span className="ml-1">
              {idx + 1}/{count}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export const AvailableShopsSection: React.FC = () => {
  const { i18n } = useTranslation();
  const { language } = useLanguage();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));

  const [shops, setShops] = useState<PublicAvailableShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShop, setActiveShop] = useState<PublicAvailableShopItem | null>(null);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);

  const loadAvailableShops = async (force = false) => {
    try {
      const res = await rentalPropertyApi.listPublicAvailableProperties(force);
      if (res?.data && Array.isArray(res.data)) {
        setShops(res.data);
        setActiveShop((prev) => {
          if (!prev) return null;
          return res.data.find((s) => s.id === prev.id) || null;
        });
      }
    } catch (err) {
      console.warn('Could not load available shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableShops(false);
    const interval = setInterval(() => loadAvailableShops(true), 20_000);
    const onFocus = () => loadAvailableShops(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const openShopModal = (shop: PublicAvailableShopItem) => {
    setActiveShop(shop);
    setModalPhotoIdx(0);
  };

  if (!loading && shops.length === 0) {
    return null;
  }

  return (
    <section
      id="available-shops"
      className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Official Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">


          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-poppins">
            {isHi
              ? 'आवंटन हेतु उपलब्ध दुकानें एवं परिसर'
              : 'Available Commercial Shops for Allotment'}
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-500 mx-auto rounded-full mt-3 mb-4" />


        </div>

        {/* Uniform Compact Cards Grid (Neatly centered when 1–2 cards, 3-col grid when 3+ cards) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-slate-200 bg-white h-88 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className={
              shops.length < 3
                ? 'flex flex-wrap justify-center gap-6'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            }
          >
            {shops.map((shop) => {
              const typeLabel = isHi
                ? TYPE_LABELS_HI[shop.propertyType] || TYPE_LABELS_HI.OTHER
                : TYPE_LABELS_EN[shop.propertyType] || TYPE_LABELS_EN.OTHER;
              const gstAmt = Math.round(shop.baseMonthlyRent * 0.18);

              return (
                <div
                  key={shop.id}
                  className={`${shops.length < 3 ? 'w-full md:w-[calc(50%-12px)] lg:w-[380px]' : 'w-full'
                    } bg-white rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between`}
                >
                  <div>
                    <ShopCardGallery
                      photos={shop.photoUrls || []}
                      shopNumber={shop.propertyNumber}
                      shopName={shop.propertyName}
                      isHi={isHi}
                      onOpenDetail={() => openShopModal(shop)}
                    />

                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10.5px] font-mono font-bold text-slate-900 mb-1">
                            {shop.propertyNumber}
                          </span>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug truncate">
                            {shop.propertyName}
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10.5px] font-semibold text-slate-700 shrink-0">
                          {typeLabel}
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="truncate">{shop.address || shop.location}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {isHi ? 'मासिक किराया' : 'Monthly Rent'}
                          </p>
                          <p className="text-sm font-black font-mono text-slate-900 mt-0.5">
                            ₹{shop.baseMonthlyRent.toLocaleString('en-IN')}
                            <span className="text-[10px] font-normal text-slate-500">
                              {isHi ? ' / माह' : ' / mo'}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {isHi
                              ? `+ ₹${gstAmt.toLocaleString('en-IN')} जीएसटी (18%)`
                              : `+ ₹${gstAmt.toLocaleString('en-IN')} GST (18%)`}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {isHi ? 'क्षेत्रफल' : 'Area'}
                          </p>
                          <p className="text-sm font-black font-mono text-slate-900 mt-0.5">
                            {shop.dimensionsSqft
                              ? isHi
                                ? `${shop.dimensionsSqft} वर्ग फुट`
                                : `${shop.dimensionsSqft} Sq. Ft`
                              : isHi
                                ? 'मानक इकाई'
                                : 'Standard Unit'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {isHi ? 'तत्काल उपलब्ध' : 'Ready to Allot'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => openShopModal(shop)}
                      className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold transition cursor-pointer text-center"
                    >
                      {isHi ? 'विवरण देखें' : 'View Details'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openShopModal(shop)}
                      className="px-3 py-2 rounded-lg bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer text-center"
                    >
                      {isHi ? 'संपर्क करें' : 'Contact Office'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── OFFICIAL SHOP DETAILS & ALLOTMENT CONTACT MODAL ── */}
      {activeShop && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveShop(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0B3B60] text-white px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-200">
                  {isHi
                    ? 'कार्यालय जिला पंचायत अल्मोड़ा • दुकान आवंटन विवरण'
                    : 'Office of Zila Panchayat Almora • Shop Allotment Details'}
                </p>
                <h3 className="text-base sm:text-lg font-extrabold mt-0.5">
                  {activeShop.propertyName} ({activeShop.propertyNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveShop(null)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {activeShop.photoUrls && activeShop.photoUrls.length > 0 && (
                <div className="space-y-2.5">
                  <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                    <img
                      src={activeShop.photoUrls[modalPhotoIdx] || activeShop.photoUrls[0]}
                      alt={activeShop.propertyName}
                      className="w-full h-full object-contain bg-slate-950"
                    />
                    {activeShop.photoUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setModalPhotoIdx(
                              (prev) =>
                                (prev - 1 + activeShop.photoUrls.length) %
                                activeShop.photoUrls.length
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalPhotoIdx(
                              (prev) => (prev + 1) % activeShop.photoUrls.length
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {activeShop.photoUrls.length > 1 && (
                    <div className="flex items-center gap-2">
                      {activeShop.photoUrls.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setModalPhotoIdx(i)}
                          className={`h-14 w-20 rounded-lg overflow-hidden border-2 transition cursor-pointer ${i === modalPhotoIdx
                            ? 'border-[#0B3B60]'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                            }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
                  <div className="p-3">
                    <span className="text-slate-500 font-semibold block">
                      {isHi ? 'दुकान कोड' : 'Shop Code'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {activeShop.propertyNumber}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-slate-500 font-semibold block">
                      {isHi ? 'संपत्ति श्रेणी' : 'Property Type'}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {isHi
                        ? TYPE_LABELS_HI[activeShop.propertyType] || TYPE_LABELS_HI.OTHER
                        : TYPE_LABELS_EN[activeShop.propertyType] || TYPE_LABELS_EN.OTHER}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
                  <div className="p-3">
                    <span className="text-slate-500 font-semibold block">
                      {isHi ? 'मासिक किराया (आधार + 18% जीएसटी)' : 'Monthly Rent (Base + 18% GST)'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ₹{activeShop.baseMonthlyRent.toLocaleString('en-IN')} + ₹
                      {Math.round(activeShop.baseMonthlyRent * 0.18).toLocaleString('en-IN')} = ₹
                      {Math.round(activeShop.baseMonthlyRent * 1.18).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-slate-500 font-semibold block">
                      {isHi ? 'क्षेत्रफल' : 'Area'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {activeShop.dimensionsSqft
                        ? isHi
                          ? `${activeShop.dimensionsSqft} वर्ग फुट`
                          : `${activeShop.dimensionsSqft} Sq. Ft`
                        : isHi
                          ? 'कार्यालय अभिलेख अनुसार'
                          : 'As per office record'}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <span className="text-slate-500 font-semibold block">
                    {isHi ? 'पूरा पता / स्थान' : 'Address / Location'}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {activeShop.address || activeShop.location}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-300 p-4 space-y-3">


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <a
                    href="tel:+919456790163"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-300 hover:border-slate-500 text-slate-900 font-bold transition"
                  >
                    <Phone className="w-4 h-4 text-[#0B3B60] shrink-0" />
                    <span className="font-mono">+91 9456790163</span>
                  </a>
                  <a
                    href="mailto:ama@zilapanchayatalmora.in"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-300 hover:border-slate-500 text-slate-900 font-bold transition truncate"
                  >
                    <Mail className="w-4 h-4 text-[#0B3B60] shrink-0" />
                    <span className="truncate">ama@zilapanchayatalmora.in</span>
                  </a>
                </div>

                <p className="text-[11px] text-slate-600">
                  {isHi
                    ? 'कार्यालय पता: जिला पंचायत कार्यालय, धारानौला, अल्मोड़ा, उत्तराखण्ड — 263601'
                    : 'Office Address: Zila Panchayat Office, Dharanaula, Almora, Uttarakhand — 263601'}
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-end gap-2.5">

                  <Link
                    to="/contact"
                    className="px-4 py-2 rounded-lg bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold transition"
                  >
                    {isHi ? 'ऑनलाइन पूछताछ भेजें' : 'Send Online Inquiry'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AvailableShopsSection;
