import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Shield, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase,
  Search,
  Copy,
  Check,
  HardHat,
  Truck,
  Sparkles,
  ArrowUpRight,
  Filter,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';



interface StaffMember {
  id: string;
  name: string;
  nameHi: string;
  designation: string;
  designationHi: string;
  email: string;
  phone: string;
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

  // Top 2 Executive Leaders
  const leadershipStaff: StaffMember[] = useMemo(() => [
    {
      id: 'lead-1',
      name: 'Smt. Hema Gaira',
      nameHi: 'श्रीमती हेमा गैरा',
      designation: 'Chairperson, Zila Panchayat Almora',
      designationHi: 'अध्यक्ष, जिला पंचायत अल्मोड़ा',
      category: 'leadership',
      email: 'chairperson.zp-almora@uk.gov.in',
      phone: '+91 05962-230045',
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
      email: 'ama.zp-almora@uk.gov.in',
      phone: '+91 05962-230182',
      location: 'Executive Wing, Vikas Bhawan / ZP Secretariat, Almora',
      locationHi: 'अपर मुख्य अधिकारी कक्ष, विकास भवन / जिला पंचायत, अल्मोड़ा',
      photo: AMA_IMAGE_URL
    }
  ], []);

  // Office Staff (Heading 1)
  const officeStaff: StaffMember[] = useMemo(() => [
    {
      id: 'off-1',
      name: 'Shri Prakash Chandra Joshi',
      nameHi: 'श्री प्रकाश चंद्र जोशी',
      designation: 'District Panchayati Raj Officer (DPRO)',
      designationHi: 'जिला पंचायत राज अधिकारी (DPRO)',
      category: 'office',
      email: 'dpro.almora@uk.gov.in',
      phone: '+91 94120-56201'
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
      name: 'Shri Ramesh Chandra Tewari',
      nameHi: 'श्री रमेश चंद्र तिवारी',
      designation: 'MRF Plant Operations Supervisor - Ranikhet',
      designationHi: 'एमआरएफ प्लांट परिचालन सुपरवाइजर - रानीखेत',
      category: 'site',
      email: 'mrf.ranikhet@uk.gov.in',
      phone: '+91 98371-22415'
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
    },
    {
      id: 'site-6',
      name: 'Shri Anand Ballabh Pandey',
      nameHi: 'श्री आनंद बल्लभ पांडे',
      designation: 'Compactor Fleet & Transfer Station Lead',
      designationHi: 'कॉम्पैक्टर वाहन व ट्रांसफर स्टेशन संचालक',
      category: 'site',
      email: 'transport.almora@uk.gov.in',
      phone: '+91 98375-66059'
    },
    {
      id: 'site-7',
      name: 'Shri Jagdish Singh Danu',
      nameHi: 'श्री जगदीश सिंह दानू',
      designation: 'Block Sanitation Coordinator - Bhikiyasain',
      designationHi: 'विकासखंड स्वच्छता समन्वयक - भिकियासैंण',
      category: 'site',
      email: 'field.bhikiyasain@uk.gov.in',
      phone: '+91 98376-77160',
    
    },
    {
      id: 'site-8',
      name: 'Shri Nandan Singh Rawat',
      nameHi: 'श्री नंदन सिंह रावत',
      designation: 'Composting & Agro-Waste Unit Lead - Chaukhutiya',
      designationHi: 'कम्पोस्टिंग व कृषि अपशिष्ट इकाई प्रभारी - चौखुटिया',
      category: 'site',
      email: 'compost.chaukhutiya@uk.gov.in',
      phone: '+91 98377-88271'
    }
  ], []);

  // Filter staff based on search query
  const filterList = (list: StaffMember[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q) || item.nameHi.includes(q);
      const matchDesig = item.designation.toLowerCase().includes(q) || item.designationHi.includes(q);
      const matchDept = (item.department?.toLowerCase().includes(q) ?? false) || (item.departmentHi?.includes(q) ?? false);
      const matchPhone = item.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const matchEmail = item.email.toLowerCase().includes(q);
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
      
      {/* ── Top Government Banner (Same as Our Initiative Page Header) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-10 sm:py-14 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold font-poppins text-white tracking-tight leading-tight mb-3">
                {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff & Officers Directory'}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा — स्वच्छ भारत मिशन (ग्रामीण), ठोस अपशिष्ट प्रबंधन एवं नागरिक सेवाओं के सुगम संचालन हेतु प्रमुख नेतृत्व, कार्यालय कार्मिकों एवं क्षेत्रीय फील्ड कार्यकर्ताओं की संपूर्ण संपर्क सूची।'
                  : 'Official personnel directory of District Panchayat Almora — connecting citizens with administrative leadership, office secretariat personnel, and on-ground sanitation site workers.'}
              </p>
            </div>
          </div>

          <div className="h-1 w-24 bg-amber-400 rounded-full mt-6" />
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-14">

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
                      <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                              {isHi ? 'आधिकारिक दूरभाष / फोन' : 'Official Phone'}
                            </span>
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
                            onClick={() => handleCopy(member.phone, isHi ? 'फोन नंबर' : 'Phone Number', `phone-${member.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy number'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                          >
                            {phoneCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Email Row */}
                      <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                              {isHi ? 'आधिकारिक ईमेल' : 'Official Email'}
                            </span>
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
                            onClick={() => handleCopy(member.email, isHi ? 'ईमेल' : 'Email Address', `email-${member.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy email'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition"
                          >
                            {emailCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

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
                      className="group bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                    >

                      <div>
                        {/* Header: Avatar + Badge */}
                        <div className="flex items-start justify-between gap-3 mb-4 pt-1">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
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
                              <div className={`avatar-fallback ${staff.photo ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${getAvatarGradient(staff.category, staff.id)} flex items-center justify-center font-bold text-base`}>
                                {getInitials(staff.name)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Name */}
                        <h3 className="font-bold text-base text-navy-900 group-hover:text-blue-900 transition-colors leading-snug">
                          {isHi ? staff.nameHi : staff.name}
                        </h3>

                        {/* Designation ("Destination") */}
                        <div className="mt-1.5 mb-2.5">
                          <span className="inline-block bg-blue-50/90 text-blue-950 font-bold text-xs px-2.5 py-1 rounded-md border border-blue-200/80 leading-tight">
                            {isHi ? staff.designationHi : staff.designation}
                          </span>
                        </div>

                      </div>

                      {/* Contact Info (Phone & Email) */}
                      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                        
                        {/* Phone Number */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
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
                            onClick={() => handleCopy(staff.phone, isHi ? 'फोन' : 'Phone', `phone-${staff.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy'}
                            className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                          >
                            {phoneCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
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
                            onClick={() => handleCopy(staff.email, isHi ? 'ईमेल' : 'Email', `email-${staff.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy'}
                            className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                          >
                            {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

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
                      className="group bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                    >
                      <div>
                        {/* Header: Avatar + Status */}
                        <div className="flex items-start justify-between gap-3 mb-4 pt-1">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
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
                              <div className={`avatar-fallback ${worker.photo ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${getAvatarGradient(worker.category, worker.id)} flex items-center justify-center font-bold text-base`}>
                                {getInitials(worker.name)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Name */}
                        <h3 className="font-bold text-base text-navy-900 group-hover:text-emerald-900 transition-colors leading-snug">
                          {isHi ? worker.nameHi : worker.name}
                        </h3>

                        {/* Designation ("Destination") */}
                        <div className="mt-1.5 mb-2.5">
                          <span className="inline-block bg-emerald-50/90 text-emerald-950 font-bold text-xs px-2.5 py-1 rounded-md border border-emerald-200/80 leading-tight">
                            {isHi ? worker.designationHi : worker.designation}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info (Phone & Email) */}
                      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                        
                        {/* Phone Number */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
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
                            onClick={() => handleCopy(worker.phone, isHi ? 'फोन' : 'Phone', `phone-${worker.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy'}
                            className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                          >
                            {phoneCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
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
                            onClick={() => handleCopy(worker.email, isHi ? 'ईमेल' : 'Email', `email-${worker.id}`)}
                            title={isHi ? 'कॉपी करें' : 'Copy'}
                            className="p-1 rounded text-slate-400 hover:text-navy-900 transition"
                          >
                            {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

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
