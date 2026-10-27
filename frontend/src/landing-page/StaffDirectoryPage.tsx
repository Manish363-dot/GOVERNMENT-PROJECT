import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {  
  Phone, 
  Mail, 
  MapPin, 
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';



interface StaffMember {
  id: string;
  name: string;
  nameHi: string;
  designation: string;
  designationHi: string;
  email?: string;
  phone?: string;
  category: 'leadership' | 'office' | 'site';
  department?: string;
  departmentHi?: string;
  location?: string;
  locationHi?: string;
  photo?: string;
  badge?: string;
  badgeHi?: string;
  badgeColor?: string;
  description?: string;
  descriptionHi?: string;
  status?: string;
  statusHi?: string;
}

export function StaffDirectoryPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'leadership' | 'office' | 'site'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = (text: string, label: string, key: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(
        isHi 
          ? `${label} क्लिपबोर्ड पर कॉपी किया गया` 
          : `${label} copied to clipboard: ${text}`
      );
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };
  const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://zila-panchayat-images.s3.ap-south-1.amazonaws.com';
const CH_IMAGE_URL = `${S3_BUCKET}/portal-logos/CH.jpeg`;
const AMA_IMAGE_URL = `${S3_BUCKET}/portal-logos/AMA.jpeg`;

/* Staff photos from staff-photo folder*/
const staff_1 = `${S3_BUCKET}/Staff-Photo/staff1.webp`;
const site_2 = `${S3_BUCKET}/Staff-Photo/site2.webp`;


  // Top 2 Executive Leaders
  const leadershipStaff: StaffMember[] = useMemo(() => [
    {
      id: 'lead-1',
      name: 'Smt. Hema Gaira',
      nameHi: 'श्रीमती हेमा गैरा',
      designation: 'Chairperson, Zila Panchayat Almora',
      designationHi: 'अध्यक्ष, जिला पंचायत अल्मोड़ा',
      category: 'leadership',
      email: 'amazpalmora@gmail.com',
      phone: '+91 9456596868',
      location: 'Chairperson Secretariat, ZP Bhawan, Mall Road, Almora',
      locationHi: 'अध्यक्ष कक्ष, जिला पंचायत भवन, माल रोड, अल्मोड़ा',
      photo: CH_IMAGE_URL
    },
    {
      id: 'lead-2',
      name: 'Shri Rajesh Kumar',
      nameHi: 'श्री राजेश कुमार',
      designation: 'Additional Chief Officer (AMA)',
      designationHi: 'अपर मुख्य अधिकारी (AMA)',
      category: 'leadership',
      email: 'amazpalmora@gmail.com',
      phone: '+91 9528738674',
      location: 'Executive Wing, Vikas Bhawan / ZP Secretariat, Almora',
      locationHi: 'अपर मुख्य अधिकारी कक्ष, विकास भवन / जिला पंचायत, अल्मोड़ा',
      photo: AMA_IMAGE_URL
    }
  ], []);

  // Office Staff (Heading 1)
  const officeStaff: StaffMember[] = useMemo(() => [
    {
      id: 'off-1',
      name: 'Dharmendra Rawat',
      nameHi: 'धर्मेंद्र रावत',
      designation: 'Tax Inspector',
      designationHi: 'कर निरीक्षक',
      category: 'office',
      email: 'dheerajrawat72@gmail.com',
      phone: '+91 9536009913',
      photo: staff_1
    },
    {
      id: 'off-2',
      name: 'Er. Manoj Kumar Verma',
      nameHi: 'इंजी. मनोज कुमार वर्मा',
      designation: 'Executive Engineer (EE - Technical & Infra)',
      designationHi: 'अधिशासी अभियंता (तकनीकी व एमआरएफ अवसंरचना)',
      category: 'office',
      email: 'ee.tech.zp-almora@uk.gov.in',
      phone: '+91 94111-88402',
    },
    {
      id: 'off-3',
      name: 'Smt. Deepa Rawat',
      nameHi: 'श्रीमती दीपा रावत',
      designation: 'Senior Finance & Accounts Officer (SFAO)',
      designationHi: 'वरिष्ठ वित्त एवं लेखाधिकारी (SFAO)',
      category: 'office',
      email: 'accounts.zp-almora@uk.gov.in',
      phone: '+91 94105-33918',
    },
    {
      id: 'off-4',
      name: 'Shri Harish Singh Mehta',
      nameHi: 'श्री हरीश सिंह मेहता',
      designation: 'Sanitation & GPS Fleet Telematics Officer',
      designationHi: 'स्वच्छता एवं जीपीएस टेलीमैटिक्स नोडल अधिकारी',
      category: 'office',
      email: 'fleet.telematics@uk.gov.in',
      phone: '+91 94122-44015',
    },
    {
      id: 'off-5',
      name: 'Smt. Kavita Negi',
      nameHi: 'श्रीमती कविता नेगी',
      designation: 'Public Grievance Redressal Officer (PGRO)',
      designationHi: 'जन शिकायत निवारण अधिकारी (PGRO)',
      category: 'office',
      email: 'grievances.zp-almora@uk.gov.in',
      phone: '+91 94113-77290',
    },
    {
      id: 'off-6',
      name: 'Shri Bhupendra Singh Bisht',
      nameHi: 'श्री भूपेंद्र सिंह बिष्ट',
      designation: 'Office Superintendent & Administration',
      designationHi: 'कार्यालय अधीक्षक एवं प्रशासनिक अनुभाग',
      category: 'office',
      email: 'os.admin.zp-almora@uk.gov.in',
      phone: '+91 94129-11843',
    },
    {
      id: 'off-7',
      name: 'Er. Sanjay Bhatt',
      nameHi: 'इंजी. संजय भट्ट',
      designation: 'IT Systems & Database Administrator',
      designationHi: 'आईटी सिस्टम व डेटाबेस प्रबंधक',
      category: 'office',
      email: 'itcell.zp-almora@uk.gov.in',
      phone: '+91 94115-66384',
    },
    {
      id: 'off-8',
      name: 'Smt. Sunita Arya',
      nameHi: 'श्रीमती सुनीता आर्या',
      designation: 'Tender & Bylaws Compliance Coordinator',
      designationHi: 'निविदा एवं स्वच्छता उपविधि अनुपालन समन्वयक',
      category: 'office',
      email: 'tenders.zp-almora@uk.gov.in',
      phone: '+91 94101-99234',
    }
  ], []);

  // Site Workers (Heading 2)
  const siteWorkers: StaffMember[] = useMemo(() => [
    {
      id: 'site-1',
      name: 'Shri Virendra Singh Karki',
      nameHi: 'श्री वीरेंद्र सिंह कार्की',
      designation: 'Senior Sanitation Inspector - Hawalbagh Sector',
      designationHi: 'वरिष्ठ स्वच्छता निरीक्षक - हवालबाग सेक्टर',
      category: 'site',
      email: 'field.hawalbagh@uk.gov.in',
      phone: '+91 98370-11204',
      photo: '/assets/siteworker_portrait.jpg',
    },
    {
      id: 'site-2',
      name: 'Puran Chandra Paliwal',
      nameHi: 'पूरन चंद्र पालीवाल',
      designation: 'Tax Collector',
      designationHi: 'कर संग्राहक',
      category: 'site',
      email: 'puranchandra9419@gmail.com',
      phone: '+91 9410304755',
      photo:site_2
    },
    {
      id: 'site-3',
      name: 'Shri Mohan Lal Tamta',
      nameHi: 'श्री मोहन लाल टम्टा',
      designation: 'Fleet Route & Collection Lead - Dwarahat',
      designationHi: 'वाहन रूट व संग्रहण प्रभारी - द्वाराहाट',
      category: 'site',
      email: 'fleet.dwarahat@uk.gov.in',
      phone: '+91 98372-33626'
    },
    {
      id: 'site-4',
      name: 'Shri Kailash Chandra Joshi',
      nameHi: 'श्री कैलाश चंद्र जोशी',
      designation: 'Dry & Wet Waste Sorting Lead - Pandeykhola',
      designationHi: 'गीला-सूखा कचरा पृथक्करण प्रभारी - पांडेखोला',
      category: 'site',
      email: 'segregation.almora@uk.gov.in',
      phone: '+91 98373-44837'
    },
    {
      id: 'site-5',
      name: 'Shri Gopal Singh Negi',
      nameHi: 'श्री गोपाल सिंह नेगी',
      designation: 'Field Sanitation Supervisor - Tarikhet Block',
      designationHi: 'क्षेत्रीय स्वच्छता सुपरवाइजर - ताड़ीखेत ब्लॉक',
      category: 'site',
      email: 'field.tarikhet@uk.gov.in',
      phone: '+91 98374-55948'
    }
  ], []);

  // Filter staff based on search query
  const filterList = (list: StaffMember[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    const qDigits = q.replace(/[^0-9]/g, '');
    return list.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q) || item.nameHi.includes(q);
      const matchDesig = item.designation.toLowerCase().includes(q) || item.designationHi.includes(q);
      const matchDept = (item.department?.toLowerCase().includes(q) ?? false) || (item.departmentHi?.includes(q) ?? false);
      const matchPhone = item.phone
        ? (qDigits.length > 0 ? item.phone.replace(/[^0-9]/g, '').includes(qDigits) : item.phone.toLowerCase().includes(q))
        : false;
      const matchEmail = item.email ? item.email.toLowerCase().includes(q) : false;
      const matchLoc = (item.location?.toLowerCase().includes(q) ?? false) || (item.locationHi?.includes(q) ?? false);
      return matchName || matchDesig || matchDept || matchPhone || matchEmail || matchLoc;
    });
  };

  const filteredLeadership = useMemo(() => filterList(leadershipStaff), [leadershipStaff, searchQuery]);
  const filteredOffice = useMemo(() => filterList(officeStaff), [officeStaff, searchQuery]);
  const filteredSite = useMemo(() => filterList(siteWorkers), [siteWorkers, searchQuery]);

  // Initial avatar generator for cards without custom photos
  const getInitials = (name: string) => {
    const parts = name.replace(/^(Shri|Smt\.|Er\.)\s+/i, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0] || 'ZP').slice(0, 2).toUpperCase();
  };

  const getAvatarGradient = (category: string, id: string) => {
    if (category === 'leadership') return 'from-amber-600 via-amber-700 to-amber-900 text-white';
    if (category === 'site') {
      const hues = [
        'from-emerald-600 to-teal-800 text-white',
        'from-amber-600 to-orange-800 text-white',
        'from-cyan-600 to-blue-800 text-white',
        'from-teal-600 to-emerald-900 text-white'
      ];
      const idx = id.charCodeAt(id.length - 1) % hues.length;
      return hues[idx];
    }
    const hues = [
      'from-blue-600 to-indigo-800 text-white',
      'from-slate-700 to-navy-950 text-white',
      'from-purple-600 to-indigo-900 text-white',
      'from-sky-600 to-blue-900 text-white'
    ];
    const idx = id.charCodeAt(id.length - 1) % hues.length;
    return hues[idx];
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-navy-900 pb-24">
      
      {/* ── Top Government Banner (Slim) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0c2a52] text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800 shadow-xs">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 sm:h-7 bg-amber-400 rounded-full shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-poppins text-white tracking-tight leading-none">
              {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff & Officers Directory'}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-14">

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1: FIRST TWO CARDS (EXECUTIVE LEADERSHIP)
            With Photo, Destination (Designation), Email & Phone Number
            ════════════════════════════════════════════════════════════════ */}
        {(selectedCategory === 'all' || selectedCategory === 'leadership') && filteredLeadership.length > 0 && (
          <section aria-labelledby="executive-leadership-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
              </div>
            </div>

            {/* The First Two Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {filteredLeadership.map((member) => {
                const phoneCopied = copiedKey === `phone-${member.id}`;
                const emailCopied = copiedKey === `email-${member.id}`;

                return (
                  <div
                    key={member.id}
                    className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Top Header: Badge & Status */}
                      {/* Photo + Identity Details */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 mb-5">
                        {/* Portrait Frame */}
                        <div className="relative shrink-0">
                          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-100 group-hover:border-navy-900 transition-colors">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={isHi ? member.nameHi : member.name}
                                className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  // Fallback to initials avatar if image path fails
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`avatar-fallback ${member.photo ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${getAvatarGradient(member.category, member.id)} flex items-center justify-center font-bold text-2xl`}>
                              {getInitials(member.name)}
                            </div>
                          </div>
                        </div>

                        {/* Name & Designation ("Destination") */}
                        <div className="text-center sm:text-left flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight leading-snug group-hover:text-blue-900 transition-colors">
                            {isHi ? member.nameHi : member.name}
                          </h3>

                          {/* Prominent Designation / "Destination" Badge */}
                          <div className="mt-1.5 inline-block bg-slate-100 text-navy-900 px-3 py-1 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold">
                            {isHi ? member.designationHi : member.designation}
                          </div>

                          <p className="text-xs font-semibold text-slate-500 mt-1.5">
                            {isHi ? member.departmentHi : member.department}
                          </p>

                          <div className="mt-3 text-xs text-slate-600 flex items-start gap-1.5 justify-center sm:justify-start">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">{isHi ? member.locationHi : member.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Official Contact Section: Phone & Email with Clickable Actions */}
                    <div className="pt-4 border-t border-slate-200/80 space-y-3">
                      
                      {/* Phone Row */}
                      {member.phone ? (
                        <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <a
                              href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`}
                              className="text-xs sm:text-sm font-bold text-navy-900 hover:text-blue-700 hover:underline transition truncate block"
                            >
                              {member.phone}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(member.phone!, isHi ? 'फोन नंबर' : 'Phone Number', `phone-${member.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy number'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                          >
                            {phoneCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      ) : null}

                      {/* Email Row */}
                      {member.email ? (
                        <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <a
                              href={`mailto:${member.email}`}
                              className="text-xs sm:text-sm font-bold text-navy-900 hover:text-blue-700 hover:underline transition truncate block"
                            >
                              {member.email}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(member.email!, isHi ? 'ईमेल' : 'Email Address', `email-${member.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy email'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                          >
                            {emailCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      ) : null}

                      {/* Fallback if neither phone nor email */}
                      {!member.phone && !member.email && (
                        <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="truncate">{isHi ? 'सचिवालय से संपर्क करें' : 'Contact via Secretariat'}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">ZP Almora</span>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2: OFFICE STAFF HEADING & MULTIPLE CARDS
            With Name, Destination (Designation), Email & Phone Number
            ════════════════════════════════════════════════════════════════ */}
        {(selectedCategory === 'all' || selectedCategory === 'office') && (
          <section aria-labelledby="office-staff-heading">
            {/* Center Heading with Bottom Yellow Line */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <h2 
                id="office-staff-heading"
                className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight font-poppins"
              >
                {isHi ? 'कार्यालय कर्मचारी' : 'Office Staff'}
              </h2>
              <div className="h-1 w-60 sm:w-96 bg-amber-400 rounded-full mt-2.5" />
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {filteredOffice.map((staff) => {
                  const phoneCopied = copiedKey === `phone-${staff.id}`;
                  const emailCopied = copiedKey === `email-${staff.id}`;

                  return (
                    <div
                      key={staff.id}
                      className="group bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/80 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden"
                    >

                      <div className="flex-1 flex flex-col mb-3.5">
                        {/* Header: Left Image + Right Name & Designation */}
                        <div className="flex items-center gap-3.5">
                          {/* Left Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center">
                              {staff.photo ? (
                                <img
                                  src={staff.photo}
                                  alt={isHi ? staff.nameHi : staff.name}
                                  className="w-full h-full object-cover object-top"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`avatar-fallback ${staff.photo ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${getAvatarGradient(staff.category, staff.id)} flex items-center justify-center font-bold text-base sm:text-lg`}>
                                {getInitials(staff.name)}
                              </div>
                            </div>
                          </div>

                          {/* Right: Name + Designation (Normal Text, No Background) */}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-navy-900 group-hover:text-blue-900 transition-colors leading-snug">
                              {isHi ? staff.nameHi : staff.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 leading-snug">
                              {isHi ? staff.designationHi : staff.designation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info (Phone & Email) */}
                      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs mt-auto">
                        
                        {/* Phone Number */}
                        {staff.phone ? (
                          <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60 hover:bg-slate-100/70 hover:border-slate-300 transition">
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <a
                                href={`tel:${staff.phone.replace(/[^0-9+]/g, '')}`}
                                className="font-bold text-navy-900 hover:text-blue-700 truncate"
                              >
                                {staff.phone}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(staff.phone!, isHi ? 'फोन' : 'Phone', `phone-${staff.id}`)}
                              title={isHi ? 'कॉपी करें' : 'Copy'}
                              className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                            >
                              {phoneCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : null}

                        {/* Email */}
                        {staff.email ? (
                          <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60 hover:bg-slate-100/70 hover:border-slate-300 transition">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <a
                                href={`mailto:${staff.email}`}
                                className="font-medium text-navy-900 hover:text-blue-700 truncate text-[11px]"
                              >
                                {staff.email}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(staff.email!, isHi ? 'ईमेल' : 'Email', `email-${staff.id}`)}
                              title={isHi ? 'कॉपी करें' : 'Copy'}
                              className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                            >
                              {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : null}

                        {/* Fallback if neither exists */}
                        {!staff.phone && !staff.email && (
                          <div className="flex items-center justify-between gap-1.5 bg-slate-50/70 p-2.5 rounded-xl border border-dashed border-slate-200 text-slate-500">
                            <span className="text-[11px] font-medium text-slate-500">
                              {isHi ? 'कार्यालय से संपर्क करें' : 'Contact via ZP Office'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Almora
                            </span>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3: SITE WORKERS HEADING & MULTIPLE CARDS
            With Name, Destination (Designation), Email & Phone Number
            ════════════════════════════════════════════════════════════════ */}
        {(selectedCategory === 'all' || selectedCategory === 'site') && (
          <section aria-labelledby="site-workers-heading">
            {/* Center Heading with Bottom Yellow Line */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <h2 
                id="site-workers-heading"
                className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight font-poppins"
              >
                {isHi ? 'साइट कार्यकर्ता' : 'Site Workers'}
              </h2>
              <div className="h-1 w-60 sm:w-96 bg-amber-400 rounded-full mt-2.5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {filteredSite.map((worker) => {
                  const phoneCopied = copiedKey === `phone-${worker.id}`;
                  const emailCopied = copiedKey === `email-${worker.id}`;

                  return (
                    <div
                      key={worker.id}
                      className="group bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400/80 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden"
                    >
                      <div className="flex-1 flex flex-col mb-3.5">
                        {/* Header: Left Image + Right Name & Designation */}
                        <div className="flex items-center gap-3.5">
                          {/* Left Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center">
                              {worker.photo ? (
                                <img
                                  src={worker.photo}
                                  alt={isHi ? worker.nameHi : worker.name}
                                  className="w-full h-full object-cover object-top"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`avatar-fallback ${worker.photo ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${getAvatarGradient(worker.category, worker.id)} flex items-center justify-center font-bold text-base sm:text-lg`}>
                                {getInitials(worker.name)}
                              </div>
                            </div>
                          </div>

                          {/* Right: Name + Designation (Normal Text, No Background) */}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-navy-900 group-hover:text-emerald-900 transition-colors leading-snug">
                              {isHi ? worker.nameHi : worker.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 leading-snug">
                              {isHi ? worker.designationHi : worker.designation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info (Phone & Email) */}
                      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs mt-auto">
                        
                        {/* Phone Number */}
                        {worker.phone ? (
                          <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60 hover:bg-slate-100/70 hover:border-slate-300 transition">
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <a
                                href={`tel:${worker.phone.replace(/[^0-9+]/g, '')}`}
                                className="font-bold text-navy-900 hover:text-emerald-700 truncate"
                              >
                                {worker.phone}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(worker.phone!, isHi ? 'फोन' : 'Phone', `phone-${worker.id}`)}
                              title={isHi ? 'कॉपी करें' : 'Copy'}
                              className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                            >
                              {phoneCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : null}

                        {/* Email */}
                        {worker.email ? (
                          <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60 hover:bg-slate-100/70 hover:border-slate-300 transition">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <a
                                href={`mailto:${worker.email}`}
                                className="font-medium text-navy-900 hover:text-emerald-700 truncate text-[11px]"
                              >
                                {worker.email}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(worker.email!, isHi ? 'ईमेल' : 'Email', `email-${worker.id}`)}
                              title={isHi ? 'कॉपी करें' : 'Copy'}
                              className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                            >
                              {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : null}

                        {/* Fallback if neither exists */}
                        {!worker.phone && !worker.email && (
                          <div className="flex items-center justify-between gap-1.5 bg-slate-50/70 p-2.5 rounded-xl border border-dashed border-slate-200 text-slate-500">
                            <span className="text-[11px] font-medium text-slate-500">
                              {isHi ? 'क्षेत्रीय कार्यालय से संपर्क करें' : 'Contact via Sector Office'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              ZP Site
                            </span>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
          </section>
        )}
      </div>
    </div>
  );

}
