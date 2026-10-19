import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward, Clock, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaybackControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onRestart: () => void;
    speedMultiplier: number;
    onChangeSpeed: (speed: number) => void;
    currentTimeStr: string;
    currentIndex: number;
    totalPoints: number;
    onStepBack: () => void;
    onStepForward: () => void;
    /** 'default' = white card; 'overlay' = transparent glass for fullscreen overlay */
    variant?: 'default' | 'overlay';
}

const SPEED_OPTIONS = [0.5, 1, 2, 4, 8];

export function PlaybackControls({
    isPlaying,
    onTogglePlay,
    onRestart,
    speedMultiplier,
    onChangeSpeed,
    currentTimeStr,
    currentIndex,
    totalPoints,
    onStepBack,
    onStepForward,
    variant = 'default',
}: PlaybackControlsProps) {
    const { i18n } = useTranslation();
    const isHi = i18n.language === 'hi';
    const progressPercent = totalPoints > 0 ? Math.round(((currentIndex + 1) / totalPoints) * 100) : 0;
    const isOverlay = variant === 'overlay';

    return (
        <div className={cn(
            'rounded-xl p-3 space-y-3 font-mono',
            isOverlay
                ? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl'
                : 'bg-white border border-slate-300 shadow-sm'
        )}>
            {/* Top Row: Playback Action Buttons & Live Clock */}
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                {/* Buttons Group */}
                <div className="flex items-center gap-1.5">
                    {/* Restart */}
                    <button
                        onClick={onRestart}
                        title={isHi ? 'पुनः प्रारंभ करें' : 'Restart Replay'}
                        className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors border shadow-xs',
                            isOverlay
                                ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        )}
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Step Back */}
                    <button
                        onClick={onStepBack}
                        disabled={currentIndex <= 0}
                        title={isHi ? 'पीछे जाएं' : 'Step Back'}
                        className={cn(
                            'w-8 h-8 rounded-lg disabled:opacity-30 flex items-center justify-center transition-colors border shadow-xs',
                            isOverlay
                                ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        )}
                    >
                        <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    {/* Primary Play/Pause Button */}
                    <button
                        onClick={onTogglePlay}
                        className={cn(
                            'px-4 h-8 rounded-lg font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5 shadow-sm transition-all',
                            isPlaying
                                ? 'bg-amber-600 hover:bg-amber-500'
                                : 'bg-navy-900 hover:bg-navy-800'
                        )}
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="w-3.5 h-3.5 fill-white" />
                                <span>{isHi ? 'रोकें' : 'Pause'}</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                                <span>{isHi ? 'चलाएं' : 'Play'}</span>
                            </>
                        )}
                    </button>

                    {/* Step Forward */}
                    <button
                        onClick={onStepForward}
                        disabled={currentIndex >= totalPoints - 1}
                        title={isHi ? 'आगे बढ़ाएं' : 'Step Forward'}
                        className={cn(
                            'w-8 h-8 rounded-lg disabled:opacity-30 flex items-center justify-center transition-colors border shadow-xs',
                            isOverlay
                                ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        )}
                    >
                        <SkipForward className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Live GPS Timestamp Clock Badge */}
                <div className="flex items-center gap-2 bg-navy-950 text-white px-2.5 py-1 rounded-lg border border-navy-800 shadow-xs shrink-0">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                    <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none">{isHi ? 'जीपीएस समय' : 'GPS Time'}</span>
                        <span className="text-xs font-bold text-amber-400 font-mono leading-tight">{currentTimeStr || '--:--'}</span>
                    </div>
                    <div className="w-px h-5 bg-navy-800 mx-0.5" />
                    <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none">{isHi ? 'पूर्ण' : 'Done'}</span>
                        <span className="text-xs font-bold text-slate-200 font-mono leading-tight">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Speed Multipliers Bar */}
            <div className={cn(
                'pt-2 border-t flex items-center justify-between',
                isOverlay ? 'border-white/15' : 'border-slate-100'
            )}>
                <div className={cn(
                    'flex items-center gap-1.5',
                    isOverlay ? 'text-slate-300' : 'text-slate-600'
                )}>
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{isHi ? 'प्लेबैक गति' : 'Playback Speed'}</span>
                </div>

                <div className="flex items-center gap-1">
                    {SPEED_OPTIONS.map((speed) => (
                        <button
                            key={speed}
                            onClick={() => onChangeSpeed(speed)}
                            className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-bold transition-all',
                                speedMultiplier === speed
                                    ? 'bg-navy-900 text-amber-400 border border-amber-400/40 shadow-xs'
                                    : isOverlay
                                        ? 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-navy-900'
                            )}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

