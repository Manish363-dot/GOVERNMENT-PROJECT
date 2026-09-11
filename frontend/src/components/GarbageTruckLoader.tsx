import { useEffect, useState } from 'react';

interface GarbageTruckLoaderProps {
    onComplete: () => void;
}

const STATUS: Record<string, string> = {
    enter: 'Connecting to Live Tracking System…',
    stop: 'Fetching Vehicle Locations…',
    wave: 'GPS Telematics Active…',
    exit: 'Loading GIS Map Console…',
    fade: 'Ready.',
};

export function GarbageTruckLoader({ onComplete }: GarbageTruckLoaderProps) {
    const [phase, setPhase] = useState<'enter' | 'stop' | 'wave' | 'exit' | 'fade'>('enter');

    const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        if (prefersReduced) { setTimeout(() => onComplete(), 600); return; }
        const t1 = setTimeout(() => setPhase('stop'), 1300);
        const t2 = setTimeout(() => setPhase('wave'), 1900);
        const t3 = setTimeout(() => setPhase('exit'), 2900);
        const t4 = setTimeout(() => setPhase('fade'), 3700);
        const t5 = setTimeout(() => onComplete(), 4100);
        return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
    }, []);

    const isMoving = phase === 'enter' || phase === 'exit';
    const isWaving = phase === 'wave';
    const isFading = phase === 'fade';

    const truckX: Record<typeof phase, string> = {
        enter: '-380px',
        stop: '0px',
        wave: '0px',
        exit: '460px',
        fade: '460px',
    };

    return (
        <div
            className="relative w-full overflow-hidden flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl py-10"
            style={{ minHeight: '300px' }}
            role="status"
            aria-label="Loading live vehicle tracking"
        >
            {/* Fade overlay */}
            <div
                className="absolute inset-0 bg-white z-20 pointer-events-none"
                style={{ opacity: isFading ? 1 : 0, transition: 'opacity 0.5s ease' }}
            />

            {/* Road line */}
            <div className="relative w-full" style={{ maxWidth: '580px', margin: '0 auto' }}>
                {/* Road */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: '#cbd5ce',
                    }}
                />
                {/* Dashed centre line hidden behind truck */}
                <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', gap: '12px', paddingLeft: '8px' }}>
                    {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} style={{ width: '28px', height: '2px', background: '#dde5de', borderRadius: '1px', flexShrink: 0 }} />
                    ))}
                </div>

                {/* ── TRUCK ── */}
                <div
                    aria-hidden
                    style={{
                        position: 'relative',
                        margin: '0 auto',
                        width: '220px',
                        transform: `translateX(${truckX[phase]})`,
                        transition:
                            phase === 'enter' ? 'transform 1.3s cubic-bezier(0.22, 0.61, 0.36, 1)' :
                                phase === 'exit' ? 'transform 0.85s cubic-bezier(0.55, 0, 0.8, 0.3)' :
                                    'transform 0.5s ease-out',
                        paddingBottom: '8px',
                    }}
                >
                    <svg
                        viewBox="0 0 220 90"
                        width="220"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="#1e2e22"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {/* ── CARGO BOX ── */}
                        <rect x="8" y="14" width="120" height="58" rx="4" strokeWidth="3" fill="#f4f8f5" stroke="#2b5738" />
                        {/* Box top detail line */}
                        <line x1="8" y1="25" x2="128" y2="25" strokeWidth="2" stroke="#2b5738" />
                        {/* Bin label */}
                        <text x="68" y="52" textAnchor="middle" fontSize="9" fill="#2b5738" stroke="none" fontWeight="700" fontFamily="sans-serif">SAFAI SEVA</text>
                        <text x="68" y="63" textAnchor="middle" fontSize="5.5" fill="#6a8e72" stroke="none" fontFamily="sans-serif">ZILA PANCHAYAT</text>
                        {/* Safety stripe on box */}
                        <rect x="8" y="62" width="120" height="8" rx="0" fill="#f5d060" stroke="none" opacity="0.7" />
                        <rect x="8" y="62" width="120" height="8" rx="0" fill="none" stroke="#2b5738" strokeWidth="1" />

                        {/* Waste bins on top */}
                        <rect x="18" y="5" width="14" height="12" rx="2" strokeWidth="2" fill="#e8f2ea" stroke="#2b5738" />
                        <rect x="16" y="4" width="18" height="4" rx="1.5" strokeWidth="1.5" fill="#cde0d0" stroke="#2b5738" />
                        <rect x="54" y="3" width="14" height="14" rx="2" strokeWidth="2" fill="#e8f2ea" stroke="#2b5738" />
                        <rect x="52" y="2" width="18" height="4" rx="1.5" strokeWidth="1.5" fill="#cde0d0" stroke="#2b5738" />
                        <rect x="92" y="5" width="14" height="12" rx="2" strokeWidth="2" fill="#e8f2ea" stroke="#2b5738" />
                        <rect x="90" y="4" width="18" height="4" rx="1.5" strokeWidth="1.5" fill="#cde0d0" stroke="#2b5738" />

                        {/* ── CAB ── */}
                        {/* Cab body */}
                        <rect x="126" y="22" width="82" height="50" rx="5" strokeWidth="3" fill="#f0f6f2" stroke="#2b5738" />
                        {/* Cab roof curve */}
                        <path d="M130 40 Q128 22 148 22 L198 22 Q208 22 208 32 L208 40 Z" fill="#e4f0e8" stroke="#2b5738" strokeWidth="2" />
                        {/* Windshield */}
                        <rect x="182" y="27" width="26" height="24" rx="3" strokeWidth="2" fill="#d8edf0" stroke="#2b5738" />
                        {/* Windshield glare */}
                        <line x1="185" y1="30" x2="191" y2="30" stroke="#eef6f8" strokeWidth="2" />
                        {/* Side door window */}
                        <rect x="130" y="28" width="48" height="22" rx="3" strokeWidth="2" fill="#d8edf0" stroke="#2b5738" />

                        {/* ── DRIVER (in window) ── */}
                        {/* Head */}
                        <circle cx="158" cy="35" r="8" strokeWidth="2" fill="#e8c090" stroke="#b07840" />
                        {/* Cap */}
                        <path d="M150 32 Q158 24 166 32" strokeWidth="2" fill="#2b5738" stroke="#2b5738" />
                        <rect x="149" y="32" width="18" height="4" rx="1.5" fill="#2b5738" stroke="none" />
                        {/* Eye */}
                        <circle cx="161" cy="35" r="1.5" fill="#2a180a" stroke="none" />
                        {/* Smile */}
                        <path d="M155 40 Q158 43 162 40" strokeWidth="1.5" stroke="#9a6030" fill="none" />

                        {/* Waving arm */}
                        <g
                            style={{
                                transformOrigin: '153px 52px',
                                transform: isWaving ? 'rotate(-44deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                                animation: isWaving ? 'wave 0.45s ease-in-out 0s 4 alternate' : 'none',
                            }}
                        >
                            <line x1="153" y1="50" x2="153" y2="64" strokeWidth="4" stroke="#e8c090" strokeLinecap="round" />
                            <ellipse cx="153" cy="68" rx="5" ry="4" fill="#e8c090" stroke="#b07840" strokeWidth="1.5" />
                        </g>

                        {/* Door line */}
                        <line x1="126" y1="54" x2="208" y2="54" strokeWidth="1.5" stroke="#2b5738" />
                        {/* Door handle */}
                        <rect x="130" y="61" width="12" height="4" rx="2" fill="#a0b8a4" stroke="#2b5738" strokeWidth="1.5" />
                        {/* Grille (front right) */}
                        <rect x="204" y="52" width="10" height="16" rx="2" fill="#d8e8da" stroke="#2b5738" strokeWidth="1.5" />
                        <line x1="205" y1="56" x2="213" y2="56" strokeWidth="1" stroke="#2b5738" />
                        <line x1="205" y1="60" x2="213" y2="60" strokeWidth="1" stroke="#2b5738" />
                        <line x1="205" y1="64" x2="213" y2="64" strokeWidth="1" stroke="#2b5738" />
                        {/* Headlight */}
                        <rect x="205" y="68" width="10" height="6" rx="2" fill="#f5e070" stroke="#2b5738" strokeWidth="1.5" />
                        {/* Mirror */}
                        <rect x="207" y="30" width="9" height="7" rx="2" fill="#d8e8da" stroke="#2b5738" strokeWidth="1.5" />

                        {/* ── CHASSIS ── */}
                        <rect x="14" y="70" width="200" height="8" rx="3" fill="#d4e0d8" stroke="#2b5738" strokeWidth="2" />

                        {/* ── EXHAUST ── */}
                        <rect x="12" y="8" width="6" height="12" rx="2" fill="#d4e0d8" stroke="#2b5738" strokeWidth="1.5" />
                        {isMoving && (
                            <g opacity="0.5" stroke="none">
                                <circle cx="15" cy="5" r="5" fill="#c8d0c8" />
                                <circle cx="12" cy="0" r="3.5" fill="#b8c8b8" />
                            </g>
                        )}

                        {/* ── WHEELS ── */}
                        {/* Rear wheel outer */}
                        <g style={{ transformOrigin: '52px 82px', animation: isMoving ? 'spin 0.5s linear infinite' : 'none' }}>
                            <circle cx="52" cy="82" r="15" strokeWidth="3" fill="#e8f0e8" stroke="#2b5738" />
                            <circle cx="52" cy="82" r="8" strokeWidth="2" fill="#d0e0d0" stroke="#2b5738" />
                            <circle cx="52" cy="82" r="3" fill="#2b5738" stroke="none" />
                            {/* Spokes */}
                            <line x1="52" y1="67" x2="52" y2="75" strokeWidth="2" stroke="#2b5738" />
                            <line x1="52" y1="89" x2="52" y2="97" strokeWidth="2" stroke="#2b5738" />
                            <line x1="37" y1="82" x2="44" y2="82" strokeWidth="2" stroke="#2b5738" />
                            <line x1="60" y1="82" x2="67" y2="82" strokeWidth="2" stroke="#2b5738" />
                        </g>
                        {/* Rear wheel inner (dual) */}
                        <circle cx="38" cy="82" r="12" strokeWidth="2.5" fill="#f0f6f0" stroke="#2b5738" />
                        <circle cx="38" cy="82" r="5" strokeWidth="1.5" fill="#d8e8d8" stroke="#2b5738" />

                        {/* Front wheel */}
                        <g style={{ transformOrigin: '178px 82px', animation: isMoving ? 'spin 0.5s linear infinite' : 'none' }}>
                            <circle cx="178" cy="82" r="15" strokeWidth="3" fill="#e8f0e8" stroke="#2b5738" />
                            <circle cx="178" cy="82" r="8" strokeWidth="2" fill="#d0e0d0" stroke="#2b5738" />
                            <circle cx="178" cy="82" r="3" fill="#2b5738" stroke="none" />
                            <line x1="178" y1="67" x2="178" y2="75" strokeWidth="2" stroke="#2b5738" />
                            <line x1="178" y1="89" x2="178" y2="97" strokeWidth="2" stroke="#2b5738" />
                            <line x1="163" y1="82" x2="170" y2="82" strokeWidth="2" stroke="#2b5738" />
                            <line x1="186" y1="82" x2="193" y2="82" strokeWidth="2" stroke="#2b5738" />
                        </g>
                    </svg>
                </div>
            </div>

            {/* Status text */}
            <div className="mt-5 text-center px-4">
                <p className="text-sm font-semibold text-slate-700 font-poppins">{STATUS[phase]}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Uttarakhand Zila Panchayat — Safai Seva Portal</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                    {(['enter', 'stop', 'wave', 'exit'] as const).map((p, i) => {
                        const done = ['enter', 'stop', 'wave', 'exit'].indexOf(phase) >= i;
                        return (
                            <div
                                key={p}
                                style={{
                                    width: done ? '22px' : '8px', height: '8px', borderRadius: '4px',
                                    background: done ? '#2b5738' : '#dce5de',
                                    transition: 'all 0.35s ease',
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wave {
          from { transform: rotate(0deg); }
          to { transform: rotate(-44deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
        </div>
    );
}
