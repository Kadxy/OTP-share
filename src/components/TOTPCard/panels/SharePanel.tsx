import { useState } from 'react';
import { Globe, Lock, ArrowRight, Check, Copy, ChevronLeft, AlertTriangle, Flame, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { TOTPParams } from '../types';
import { calculateCodes } from '../utils';

interface Props {
    secret: string;
    params: TOTPParams;
}

export function SharePanel({ secret, params }: Props) {
    const [step, setStep] = useState<'menu' | 'warning' | 'config' | 'result'>('menu');
    const [secureConfig, setSecureConfig] = useState({ oneTime: true, expiresIn: '1h' });
    const [generatedLink, setGeneratedLink] = useState('');
    const [urlCopied, setUrlCopied] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCopyPublicUrl = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setUrlCopied(true);
            setTimeout(() => setUrlCopied(false), 2000);
        }
    };

    const handleCreateSecureLink = async () => {
        setIsCreating(true);

        try {
            const hoursMap: Record<string, number> = { '1h': 1, '12h': 12, '24h': 24 };
            const hours = hoursMap[secureConfig.expiresIn] || 1;

            const now = Math.floor(Date.now() / 1000);
            const firstCodeTimestamp = Math.floor(now / params.period) * params.period;

            const codes = calculateCodes(secret, params.period, params.digits, params.algorithm, hours, firstCodeTimestamp);

            const res = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codes,
                    period: params.period,
                    startTime: firstCodeTimestamp,
                    expiresIn: secureConfig.expiresIn,
                    burnAfterReading: secureConfig.oneTime
                })
            });

            if (!res.ok) throw new Error('Failed to create link');

            const data = await res.json();
            const link = `${window.location.origin}/view/${data.id}`;
            setGeneratedLink(link);
            setStep('result');

        } catch (e) {
            alert("Error creating link. Please try again.");
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    const UrlCopyBox = ({ url }: { url: string }) => {
        const [copied, setCopied] = useState(false);
        return (
            <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                <input
                    type="text"
                    readOnly
                    value={url}
                    className="flex-1 bg-transparent border-none text-xs text-gray-600 font-mono px-2 focus:ring-0 focus:outline-none cursor-default truncate"
                    onClick={(e) => e.currentTarget.select()}
                />
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(url);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                    className={clsx(
                        "p-2 rounded-lg transition-all shadow-sm border cursor-pointer",
                        copied
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-white text-gray-700 hover:text-black border-gray-100 hover:border-gray-300"
                    )}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>
        );
    };

    if (step === 'menu') {
        return (
            <div className="w-full flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Globe size={14} className="text-blue-500" />
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Public Link</label>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <input
                            type="text"
                            readOnly
                            value={typeof window !== 'undefined' ? window.location.href : ''}
                            className="flex-1 bg-transparent border-none text-xs text-gray-600 font-mono px-2 focus:ring-0 focus:outline-none cursor-default truncate"
                            onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                            onClick={handleCopyPublicUrl}
                            className={clsx(
                                "p-2 rounded-lg transition-all shadow-sm border cursor-pointer",
                                urlCopied ? "bg-green-50 text-green-600 border-green-200" : "bg-white text-gray-700 hover:text-black border-gray-100 hover:border-gray-300"
                            )}
                        >
                            {urlCopied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 px-1">Contains secret key in plain text. Share with caution.</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Lock size={14} className="text-purple-500" />
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Secure Link</label>
                    </div>
                    <button
                        onClick={() => setStep('warning')}
                        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 rounded-lg transition-all group shadow-sm cursor-pointer"
                    >
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs font-semibold text-gray-900 group-hover:text-purple-700">Create Secure Link</span>
                            <span className="text-[10px] text-gray-500 group-hover:text-purple-600/70">Expiration & Security Options</span>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'warning') {
        return (
            <div className="w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center space-y-4 max-w-[260px]">
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={20} className="text-amber-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-gray-900">Security Notice</h3>
                        <p className="text-[11px] text-gray-500 leading-relaxed px-2">
                            Secret key stays in your browser. <br />
                            We only <strong>cook up</strong> the temporary codes.
                        </p>
                    </div>
                    <div className="pt-2 space-y-2">
                        <button
                            onClick={() => setStep('config')}
                            className="w-full py-2 bg-gray-900 text-white rounded-lg text-[11px] font-semibold uppercase tracking-wide hover:bg-black transition-colors cursor-pointer"
                        >
                            Continue
                        </button>
                        <button
                            onClick={() => setStep('menu')}
                            className="block w-full text-[11px] text-gray-400 hover:text-gray-600 font-medium cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'config') {
        return (
            <div className="w-full space-y-4 animate-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                    <button onClick={() => setStep('warning')} className="p-1 -ml-2 text-gray-400 hover:text-gray-900 cursor-pointer">
                        <ChevronLeft size={18} />
                    </button>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Link Settings</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Valid For</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['1h', '12h', '24h'].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSecureConfig({ ...secureConfig, expiresIn: time })}
                                    className={clsx(
                                        "py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                                        secureConfig.expiresIn === time
                                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Restriction</label>
                        <button
                            onClick={() => setSecureConfig({ ...secureConfig, oneTime: !secureConfig.oneTime })}
                            className={clsx(
                                "w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                secureConfig.oneTime
                                    ? "bg-purple-50 border-purple-200 shadow-sm"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={clsx(
                                    "p-1.5 rounded-lg transition-colors",
                                    secureConfig.oneTime ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"
                                )}>
                                    <Flame size={16} />
                                </div>
                                <div className="text-left">
                                    <div className={clsx("text-xs font-semibold transition-colors", secureConfig.oneTime ? "text-purple-900" : "text-gray-700")}>
                                        Burn after reading
                                    </div>
                                    <div className="text-[10px] text-gray-400">Valid for one-time view only</div>
                                </div>
                            </div>
                            {secureConfig.oneTime && <Check size={14} className="text-purple-600" />}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleCreateSecureLink}
                    disabled={isCreating}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-[11px] font-semibold uppercase tracking-wide hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                    {isCreating ? <Loader2 size={14} className="animate-spin" /> : "Generate Link"}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in slide-in-from-right-8 duration-300 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check size={24} />
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">Link Ready</h3>
            </div>

            <UrlCopyBox url={generatedLink} />

            <button onClick={() => setStep('config')} className="text-xs text-gray-400 hover:text-gray-600 font-medium underline underline-offset-2 cursor-pointer">
                Create another
            </button>
        </div>
    );
}