import React, { useState } from 'react';
import { Store, Building, Search, MapPin, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface PropertyItem {
  id: string;
  number: string;
  titleHi: string;
  titleEn: string;
  marketHi: string;
  marketEn: string;
  typeHi: string;
  typeEn: string;
  area: string;
  rent: number;
  status: 'Occupied' | 'Vacant';
}

const PROPERTIES_DATA: PropertyItem[] = [
  {
    id: 'P-101',
    number: 'SHOP-101',
    titleHi: 'व्यापारिक दुकान संख्या 101',
    titleEn: 'Commercial Shop No. 101',
    marketHi: 'धारानौला मुख्य बाजार, अल्मोड़ा',
    marketEn: 'Dharanaula Main Bazaar, Almora',
    typeHi: 'व्यापारिक दुकान (Shop)',
    typeEn: 'Commercial Shop',
    area: '180 वर्ग फीट (sq ft)',
    rent: 3500,
    status: 'Occupied',
  },
  {
    id: 'P-102',
    number: 'SHOP-102',
    titleHi: 'व्यापारिक दुकान संख्या 102',
    titleEn: 'Commercial Shop No. 102',
    marketHi: 'तहसील परिसर, हवालबाग',
    marketEn: 'Tehsil Campus, Hawalbagh',
    typeHi: 'व्यापारिक दुकान (Shop)',
    typeEn: 'Commercial Shop',
    area: '210 वर्ग फीट (sq ft)',
    rent: 4200,
    status: 'Occupied',
  },
  {
    id: 'P-103',
    number: 'SHOP-103',
    titleHi: 'व्यापारिक दुकान संख्या 103',
    titleEn: 'Commercial Shop No. 103',
    marketHi: 'बस स्टेशन परिसर, रानीखेत',
    marketEn: 'Bus Station Campus, Ranikhet',
    typeHi: 'व्यापारिक दुकान (Shop)',
    typeEn: 'Commercial Shop',
    area: '250 वर्ग फीट (sq ft)',
    rent: 5000,
    status: 'Occupied',
  },
  {
    id: 'P-104',
    number: 'SHOP-104',
    titleHi: 'व्यापारिक दुकान संख्या 104 (ई-नीलामी)',
    titleEn: 'Commercial Shop No. 104 (E-Auction)',
    marketHi: 'सोमेश्वर मुख्य तिराहा बाजार',
    marketEn: 'Someshwar Main Tiraha Market',
    typeHi: 'व्यापारिक दुकान (Shop)',
    typeEn: 'Commercial Shop',
    area: '160 वर्ग फीट (sq ft)',
    rent: 3200,
    status: 'Vacant',
  },
  {
    id: 'P-105',
    number: 'HALL-01',
    titleHi: 'जिला पंचायत सामुदायिक भवन',
    titleEn: 'Zila Panchayat Community Hall',
    marketHi: 'कलेक्ट्रेट रोड, अल्मोड़ा',
    marketEn: 'Collectorate Road, Almora',
    typeHi: 'सामुदायिक भवन (Hall)',
    typeEn: 'Community Hall',
    area: '2400 वर्ग फीट (sq ft)',
    rent: 15000,
    status: 'Occupied',
  },
  {
    id: 'P-106',
    number: 'SHOP-105',
    titleHi: 'व्यापारिक दुकान संख्या 105 (ई-नीलामी)',
    titleEn: 'Commercial Shop No. 105 (E-Auction)',
    marketHi: 'द्वाराहाट मुख्य बाजार',
    marketEn: 'Dwarahat Main Bazaar',
    typeHi: 'व्यापारिक दुकान (Shop)',
    typeEn: 'Commercial Shop',
    area: '190 वर्ग फीट (sq ft)',
    rent: 3800,
    status: 'Vacant',
  },
];

export const PropertiesSection: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const { requireAuth } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'shops' | 'halls' | 'vacant'>('all');
  const [search, setSearch] = useState('');

  const handlePayRentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const el = document.getElementById('quick-pay');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 'quick-pay');
  };

  const filtered = PROPERTIES_DATA.filter((item) => {
    if (activeFilter === 'shops' && item.number.startsWith('HALL')) return false;
    if (activeFilter === 'halls' && !item.number.startsWith('HALL')) return false;
    if (activeFilter === 'vacant' && item.status !== 'Vacant') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = item.number.toLowerCase().includes(q);
      const matchLoc = (isHi ? item.marketHi : item.marketEn).toLowerCase().includes(q);
      return matchNo || matchLoc;
    }
    return true;
  });

  return (
    <section id="properties" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold mb-2">
              <Store className="w-4 h-4 text-emerald-700" />
              <span>{isHi ? 'सार्वजनिक संपत्ति पंजी' : 'Public Property Register'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-poppins">
              {isHi ? 'जिला पंचायत संपत्तियां एवं ई-नीलामी विवरण' : 'Zila Panchayat Properties & Auction Listings'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 font-inter leading-relaxed">
              {isHi
                ? 'अल्मोड़ा जनपद के विभिन्न बाजारों में स्थित दुकानों की स्थिति, क्षेत्रफल एवं मानक मासिक किराया।'
                : 'Publicly permitted property information: location, area, base rent, and vacancy status.'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHi ? 'दुकान संख्या या स्थान खोजें...' : 'Search shop or location...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#0b1b36] text-white border-[#0b1b36]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isHi ? 'सभी संपत्तियां' : 'All Properties'}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('shops')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              activeFilter === 'shops'
                ? 'bg-[#0b1b36] text-white border-[#0b1b36]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isHi ? 'व्यापारिक दुकानें (Shops)' : 'Commercial Shops'}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('halls')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              activeFilter === 'halls'
                ? 'bg-[#0b1b36] text-white border-[#0b1b36]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isHi ? 'सामुदायिक भवन (Halls)' : 'Community Halls'}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('vacant')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              activeFilter === 'vacant'
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            {isHi ? 'रिक्त / ई-नीलामी हेतु उपलब्ध' : 'Vacant for E-Auction'}
          </button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-[#0b1b36] px-2 py-0.5 rounded border border-slate-200">
                    {item.number}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      item.status === 'Occupied'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {item.status === 'Occupied' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isHi ? 'आवंटित' : 'Occupied'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>{isHi ? 'रिक्त (ई-नीलामी)' : 'Vacant (Auction)'}</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isHi ? item.titleHi : item.titleEn}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{isHi ? item.marketHi : item.marketEn}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      {isHi ? 'क्षेत्रफल' : 'Area'}
                    </span>
                    <span className="font-semibold text-slate-800">{item.area}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      {isHi ? 'मासिक किराया' : 'Monthly Rent'}
                    </span>
                    <span className="font-bold text-[#0b1b36]">
                      ₹{item.rent.toLocaleString('en-IN')}/माह
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {isHi ? item.typeHi : item.typeEn}
                </span>
                {item.status === 'Vacant' ? (
                  <a
                    href="#notices"
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    <span>{isHi ? 'नीलामी शर्तें देखें' : 'View Auction Rules'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <a
                    href="#quick-pay"
                    onClick={handlePayRentClick}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isHi ? 'किराया भुगतान' : 'Pay Rent'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
