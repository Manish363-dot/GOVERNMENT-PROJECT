import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    X, Send, ShieldCheck, RotateCcw, ExternalLink, Globe
} from 'lucide-react';

type QueryType = 'welcome' | 'complaint' | 'helpline' | 'tracking' | 'about' | 'admin' | 'fallback';
type LangType = 'hi' | 'en' | 'hinglish';

interface Message {
    id: string;
    sender: 'bot' | 'user';
    text?: string; // For user typed text
    queryType?: QueryType; // For bot response category
    time: string;
}

export function GovHelpBot() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [langMode, setLangMode] = useState<LangType>('hi');
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Synchronize initial language mode from i18n
    useEffect(() => {
        if (i18n.language === 'en') {
            setLangMode('en');
        } else {
            setLangMode('hi');
        }
    }, [i18n.language]);

    const getTimeStr = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Structured Knowledge Base Dictionary supporting instant dynamic translation for all messages
    const kbContent: Record<QueryType, Record<LangType, { text: string; actionLabel?: string; actionType?: 'scroll' | 'call' | 'link'; actionTarget?: string }>> = {
        welcome: {
            hi: {
                text: "नमस्ते! 🙏 जिला पंचायत अल्मोड़ा डिजिटल सहायता केंद्र में आपका स्वागत है। आज मैं आपकी क्या सहायता कर सकता हूँ?"
            },
            hinglish: {
                text: "Namaste! 🙏 Zila Panchayat Almora Help Desk me aapka swagat hai. Aapki kya madad kar sakta hoon?"
            },
            en: {
                text: "Namaste! 🙏 Welcome to District Panchayat Almora Digital Help Desk. How may I assist you today?"
            }
        },
        complaint: {
            hi: {
                text: "कचरा संग्रहण शिकायत दर्ज करने की प्रक्रिया:\n\n1. मुख्य पृष्ठ पर 'शिकायत दर्ज करें' सेक्शन में जाएँ।\n2. अपना पूरा नाम और 10-अंकों का मोबाइल नंबर भरें।\n3. अपना वार्ड/क्षेत्र और समस्या का प्रकार चुनें।\n4. 'शिकायत दर्ज करें' बटन दबाएँ। आपको एक आधिकारिक ZP संदर्भ संख्या प्राप्त होगी!",
                actionLabel: "📝 शिकायत प्रपत्र खोलें",
                actionType: "scroll",
                actionTarget: "complaint"
            },
            hinglish: {
                text: "Garbage collection complaint register karne ki prakriya:\n\n1. Homepage par 'Register Complaint' section me jayein.\n2. Apna Name aur 10-digit Mobile Number bharein.\n3. Apna Ward/Area aur Issue Type select karein.\n4. 'Submit Complaint' button par click karein. Aapko ek ZP reference number mil jayega!",
                actionLabel: "📝 Complaint Form Par Jayein",
                actionType: "scroll",
                actionTarget: "complaint"
            },
            en: {
                text: "Steps to register a waste collection complaint:\n\n1. Scroll to the 'Register Complaint' section on the homepage.\n2. Provide your Full Name and 10-digit Mobile Number.\n3. Select your Ward/Village Area and Issue Type.\n4. Click 'Submit Complaint'. You will receive an official ZP reference number!",
                actionLabel: "📝 Open Complaint Form",
                actionType: "scroll",
                actionTarget: "complaint"
            }
        },
        helpline: {
            hi: {
                text: "📞 जिला पंचायत अल्मोड़ा - आधिकारिक हेल्पलाइन:\n\n• टोल-फ्री हेल्पलाइन: 1800-185-1850 (सोम-शनि, सुबह 9:00 - शाम 6:00)\n• ईमेल: safai@zilapanchayat.uk.gov.in\n• कार्यालय पता: जिला पंचायत भवन, विकास भवन परिसर, अल्मोड़ा, उत्तराखंड - 263601",
                actionLabel: "📞 टोल-फ्री नंबर पर कॉल करें",
                actionType: "call",
                actionTarget: "tel:18001851850"
            },
            hinglish: {
                text: "📞 Official Helpline & Contact Details:\n\n• Toll-Free Number: 1800-185-1850 (Som-Shani, 9 AM - 6 PM)\n• Official Email: safai@zilapanchayat.uk.gov.in\n• Office Address: Zila Panchayat Bhavan, Almora, Uttarakhand - 263601",
                actionLabel: "📞 Toll-Free Call Karein (1800-185-1850)",
                actionType: "call",
                actionTarget: "tel:18001851850"
            },
            en: {
                text: "📞 Official District Helpline Details:\n\n• Toll-Free Helpline: 1800-185-1850 (Mon-Sat, 9:00 AM - 6:00 PM)\n• Official Email: safai@zilapanchayat.uk.gov.in\n• Office Address: Zila Panchayat Bhavan, Almora, Uttarakhand - 263601",
                actionLabel: "📞 Call Toll-Free Helpline",
                actionType: "call",
                actionTarget: "tel:18001851850"
            }
        },
        tracking: {
            hi: {
                text: "🚛 वाहन जीपीएस लाइव ट्रैकिंग:\n\nअल्मोड़ा जिले के सभी सफाई वाहन रियल-टाइम जीपीएस टेलीमैटिक्स से लैस हैं। अधिकृत प्रशासनिक अधिकारी लॉगिन करके लाइव ट्रैकिंग और मार्ग प्लेबैक देख सकते हैं।",
                actionLabel: "🔐 लाइव ट्रैकिंग हेतु एडमिन लॉगिन करें",
                actionType: "link",
                actionTarget: "/signin"
            },
            hinglish: {
                text: "🚛 Live Vehicle GPS Tracking:\n\nAlmora district ke sabhi safai gadiyon me real-time GPS telematics laga hai. Authorized admin officers login karke live tracking aur route replay dekh sakte hain.",
                actionLabel: "🔐 Admin Login Karke Tracking Dekhein",
                actionType: "link",
                actionTarget: "/signin"
            },
            en: {
                text: "🚛 Live GPS Telematics & Fleet Tracking:\n\nAll waste collection trucks in Almora are equipped with real-time GPS telemetry devices. Administrative officers can log in to view live fleet movement and daily route replay logs.",
                actionLabel: "🔐 Admin Login for Tracking",
                actionType: "link",
                actionTarget: "/signin"
            }
        },
        about: {
            hi: {
                text: "🌿 स्वच्छ भारत मिशन (ग्रामीण) - जिला पंचायत अल्मोड़ा:\n\nअल्मोड़ा जिले में ठोस एवं तरल अपशिष्ट प्रबंधन, पर्यावरण मित्रों की तैनाती, मटेरियल रिकवरी फैसिलिटी (MRF) और प्लास्टिक रीसाइक्लिंग प्रणाली संचालित की जाती है।",
                actionLabel: "ℹ️ हमारे बारे में पूरा विवरण पढ़ें",
                actionType: "scroll",
                actionTarget: "about"
            },
            hinglish: {
                text: "🌿 Swachh Bharat Mission (Grameen) - Almora Project:\n\nDistrict Almora me solid waste management, Paryavaran Mitras, Material Recovery Facilities (MRF), aur plastic recycling systems chalaye ja rahe hain.",
                actionLabel: "ℹ️ About Section Par Jayein",
                actionType: "scroll",
                actionTarget: "about"
            },
            en: {
                text: "🌿 Swachh Bharat Mission (Grameen) - District Almora:\n\nDistrict Panchayat Almora manages solid & plastic waste collection across rural, tourist, and pilgrimage areas. Key components include dedicated Paryavaran Mitras, collection vehicles, Material Recovery Facilities (MRF), and plastic compactors.",
                actionLabel: "ℹ️ Read About Initiative",
                actionType: "scroll",
                actionTarget: "about"
            }
        },
        admin: {
            hi: {
                text: "🔐 प्रशासनिक पोर्टल लॉगिन:\n\nअधिकृत सफाई निरीक्षक एवं प्रशासनिक अधिकारी वाहन बेड़े, जीपीएस उपकरण आवंटन और नागरिक शिकायतों के समाधान के लिए लॉगिन कर सकते हैं।",
                actionLabel: "🔑 एडमिन पोर्टल में साइन इन करें",
                actionType: "link",
                actionTarget: "/signin"
            },
            hinglish: {
                text: "🔐 Admin Control Panel Login:\n\nAuthorized sanitation officers aur admin staff vehicle fleet, GPS devices, aur citizen complaints manage karne ke liye login kar sakte hain.",
                actionLabel: "🔑 Admin Portal Sign In Karein",
                actionType: "link",
                actionTarget: "/signin"
            },
            en: {
                text: "🔐 Admin Control Console:\n\nAuthorized sanitation officers and district administrators can sign in to manage vehicle fleets, assign GPS hardware devices, and resolve public complaints.",
                actionLabel: "🔑 Sign In to Admin Portal",
                actionType: "link",
                actionTarget: "/signin"
            }
        },
        fallback: {
            hi: {
                text: "जिला पंचायत अल्मोड़ा सहायता केंद्र निम्नलिखित विषयों में आपकी सहायता कर सकता है:\n\n1. शिकायत कैसे दर्ज करें?\n2. टोल-फ्री हेल्पलाइन नंबर\n3. कचरा वाहन जीपीएस लाइव ट्रैकिंग\n4. स्वच्छ भारत और पर्यावरण मित्र\n5. एडमिन लॉगिन",
                actionLabel: "📝 शिकायत प्रपत्र खोलें",
                actionType: "scroll",
                actionTarget: "complaint"
            },
            hinglish: {
                text: "Main Zila Panchayat Almora Help Desk se aapki madad kar sakta hoon! Aap in baaton ke baare me pooch sakte hain:\n\n1. Complaint kaise karein?\n2. Toll-Free Helpline Number kya hai?\n3. Live Gadi GPS tracking kaise dekhein?\n4. Swachh Bharat aur Paryavaran Mitras\n5. Admin Portal Login",
                actionLabel: "📝 Complaint Form Par Jayein",
                actionType: "scroll",
                actionTarget: "complaint"
            },
            en: {
                text: "District Panchayat Almora Help Desk can assist you with:\n\n1. How to file a complaint?\n2. Toll-Free Helpline Numbers\n3. Live Vehicle GPS Tracking\n4. Swachh Bharat & Paryavaran Mitras\n5. Admin Portal Login",
                actionLabel: "📝 Go to Complaint Form",
                actionType: "scroll",
                actionTarget: "complaint"
            }
        }
    };

    const [messages, setMessages] = useState<Message[]>(() => [
        { id: '1', sender: 'bot', queryType: 'welcome', time: getTimeStr() }
    ]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping, langMode]);

    const scrollToSection = (sectionId: string) => {
        setIsOpen(false);
        const elem = document.getElementById(sectionId);
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.hash = sectionId;
        }
    };

    const handleAction = (type?: string, target?: string) => {
        if (type === 'scroll' && target) {
            scrollToSection(target);
        } else if (type === 'call' && target) {
            window.location.href = target;
        } else if (type === 'link' && target) {
            window.location.href = target;
        }
    };

    // Smart Language Detection Function
    const detectLanguageOfInput = (text: string): LangType => {
        if (/[\u0900-\u097F]/.test(text)) {
            return 'hi';
        }

        const lower = text.toLowerCase();
        const hinglishWords = [
            'kaise', 'kare', 'karein', 'kya', 'hai', 'batao', 'jankari', 'gadi', 'shikayat',
            'nambar', 'madad', 'chahiye', 'panchayat', 'kahan', 'karne', 'karna',
            'apna', 'dekhne', 'karo', 'kar', 'bhi', 'se', 'ko', 'me', 'mein', 'par'
        ];

        const isHinglish = hinglishWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
        if (isHinglish) {
            return 'hinglish';
        }

        return langMode;
    };

    // Match query keyword to category
    const matchCategory = (queryText: string): QueryType => {
        const q = queryText.toLowerCase();

        if (q.includes('complaint') || q.includes('shikayat') || q.includes('shikayet') || q.includes('कचरा') || q.includes('शिकायत') || q.includes('form') || q.includes('register')) {
            return 'complaint';
        }
        if (q.includes('helpline') || q.includes('number') || q.includes('phone') || q.includes('call') || q.includes('contact') || q.includes('संपर्क') || q.includes('नंबर') || q.includes('हेल्पलाइन') || q.includes('toll')) {
            return 'helpline';
        }
        if (q.includes('track') || q.includes('gadi') || q.includes('vehicle') || q.includes('gps') || q.includes('route') || q.includes('गाड़ी') || q.includes('वाहन') || q.includes('लाइव')) {
            return 'tracking';
        }
        if (q.includes('about') || q.includes('swachh') || q.includes('mrf') || q.includes('paryavaran') || q.includes('mitra') || q.includes('हमारे बारे में') || q.includes('पहल')) {
            return 'about';
        }
        if (q.includes('admin') || q.includes('login') || q.includes('signin') || q.includes('signup') || q.includes('एडमिन') || q.includes('लॉगिन')) {
            return 'admin';
        }

        return 'fallback';
    };

    const handleSend = (textToSend?: string) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        // Detect language of input and switch active mode so ALL past & present messages render in this language!
        const detectedLang = detectLanguageOfInput(query);
        setLangMode(detectedLang);

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: query,
            time: getTimeStr()
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const category = matchCategory(query);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                queryType: category,
                time: getTimeStr()
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 450);
    };

    const quickPrompts = {
        hi: [
            "शिकायत कैसे दर्ज करें?",
            "टोल-फ्री नंबर क्या है?",
            "वाहन लाइव ट्रैकिंग?",
            "एडमिन लॉगिन"
        ],
        en: [
            "How to file a complaint?",
            "Toll-free helpline number?",
            "Live vehicle tracking?",
            "Admin Portal login"
        ],
        hinglish: [
            "Complaint kaise kare?",
            "Helpline number kya hai?",
            "Gadi track kaise kare?",
            "Admin login kaise kare?"
        ]
    };

    const currentPrompts = quickPrompts[langMode];

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans">
            {/* Compact Icon-Only Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white border-2 border-navy-900 shadow-xl flex items-center justify-center p-1 hover:scale-110 active:scale-95 transition-all duration-200 relative group"
                    aria-label="Open Official Help Assistant"
                    title="सहायता केंद्र | Digital Help Desk"
                >
                    <img
                        src="/assets/help-bot-icon.png"
                        alt="Digital Help Assistant Icon"
                        className="w-full h-full object-contain rounded-full"
                    />

                    {/* Online Pulsing Indicator Dot */}
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                    </span>
                </button>
            )}

            {/* Official Government Chat Window */}
            {isOpen && (
                <div className="w-[92vw] sm:w-[380px] h-[520px] bg-white border-2 border-navy-900 rounded-lg shadow-2xl flex flex-col overflow-hidden text-navy-900 animate-fade-in">
                    {/* Header */}
                    <div className="bg-navy-900 text-white px-4 py-3 flex items-center justify-between border-b border-navy-800">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white p-0.5 flex items-center justify-center border border-slate-300 shrink-0">
                                <img src="/assets/help-bot-icon.png" alt="Help Assistant Icon" className="w-full h-full object-contain rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-poppins font-bold text-xs sm:text-sm text-white leading-tight flex items-center gap-1">
                                    {langMode === 'hi' ? 'डिजिटल सहायता केंद्र' : langMode === 'hinglish' ? 'Digital Help Desk' : 'Digital Help Desk'}
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                </h3>
                                <p className="text-[10px] text-slate-300 font-medium">
                                    {langMode === 'hi' ? 'जिला पंचायत अल्मोड़ा • उत्तराखंड' : 'District Panchayat Almora'}
                                </p>
                            </div>
                        </div>

                        {/* Header Right Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMessages([{ id: Date.now().toString(), sender: 'bot', queryType: 'welcome', time: getTimeStr() }])}
                                title="Reset Chat"
                                className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Close"
                                className="p-1 rounded text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-amber-400" />
                            </button>
                        </div>
                    </div>

                    {/* Official Tricolor Bar */}
                    <div className="uk-tricolor-line" />

                    {/* Language Selector Strip */}
                    <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                            <Globe className="w-3 h-3 text-navy-900" />
                            <span>{langMode === 'hi' ? 'भाषा चुनें:' : 'Language:'}</span>
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setLangMode('hi')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${langMode === 'hi' ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                            >
                                हिंदी
                            </button>
                            <button
                                onClick={() => setLangMode('hinglish')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${langMode === 'hinglish' ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                            >
                                Hinglish
                            </button>
                            <button
                                onClick={() => setLangMode('en')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${langMode === 'en' ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Messages Area - Dynamically translates all past & present bot responses to langMode */}
                    <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 touch-scroll text-xs">
                        {messages.map((msg) => {
                            if (msg.sender === 'user') {
                                return (
                                    <div key={msg.id} className="flex flex-col items-end">
                                        <div className="max-w-[85%] rounded-lg px-3.5 py-2.5 bg-navy-900 text-white font-medium shadow-xs">
                                            <p>{msg.text}</p>
                                        </div>
                                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                                            {msg.time}
                                        </span>
                                    </div>
                                );
                            }

                            // Dynamic Bot Content lookup based on active langMode
                            const category = msg.queryType || 'fallback';
                            const botData = kbContent[category][langMode];

                            return (
                                <div key={msg.id} className="flex flex-col items-start">
                                    <div className="max-w-[85%] rounded-lg px-3.5 py-2.5 bg-white text-slate-800 border border-slate-200 border-l-4 border-l-amber-500 shadow-xs leading-relaxed">
                                        <p className="whitespace-pre-line">{botData.text}</p>

                                        {/* Dynamic Action Button */}
                                        {botData.actionLabel && (
                                            <button
                                                onClick={() => handleAction(botData.actionType, botData.actionTarget)}
                                                className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white font-bold py-1.5 px-3 rounded text-[11px] transition-colors shadow-xs"
                                            >
                                                <span>{botData.actionLabel}</span>
                                                <ExternalLink className="w-3 h-3 text-amber-400" />
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                                        {msg.time}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 w-max text-slate-500 shadow-xs">
                                <span className="w-1.5 h-1.5 bg-navy-900 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-navy-900 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-navy-900 rounded-full animate-bounce [animation-delay:0.4s]" />
                                <span className="text-[10px] italic ml-1">
                                    {langMode === 'hi' ? 'उत्तर तैयार किया जा रहा है...' : 'Processing...'}
                                </span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Prompts Bar */}
                    <div className="bg-slate-100 border-t border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {currentPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(prompt)}
                                className="whitespace-nowrap bg-white hover:bg-navy-900 hover:text-white text-slate-700 border border-slate-300 px-2.5 py-1 rounded text-[10px] font-semibold transition-colors shrink-0 shadow-2xs"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                langMode === 'hi'
                                    ? 'प्रश्न या समस्या टाइप करें...'
                                    : langMode === 'hinglish'
                                        ? 'Complaint ya helpline ke baare me likhein...'
                                        : 'Ask a question or issue...'
                            }
                            className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-navy-900"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="w-9 h-9 rounded bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold flex items-center justify-center transition-colors shrink-0 shadow-xs"
                        >
                            <Send className="w-4 h-4 text-amber-400" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
