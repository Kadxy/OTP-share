"use client";

import { useEffect, useState } from 'react';
import { TokenDisplay } from '@/components/TOTPCard/TokenDisplay';
import { AlertCircle, XCircle, Flame, Clock, ShieldCheck, Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ViewPageProps {
    params: Promise<{ id: string }>;
}

interface CodeData {
    codes: string[];
    period: number;
    firstCodeTimestamp: number;
    burnAfterReading: boolean;
    expiresAt: string;
}

interface ErrorData {
    error: string;
    errorType?: 'not_found' | 'expired' | 'burned';
}

export default function ViewPage({ params }: ViewPageProps) {
    const [id, setId] = useState<string>('');
    const [codeData, setCodeData] = useState<CodeData | null>(null);
    const [error, setError] = useState<ErrorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    // Unwrap params
    useEffect(() => {
        params.then(p => setId(p.id));
    }, [params]);

    // Fetch codes from API
    useEffect(() => {
        if (!id) return;

        const fetchCodes = async () => {
            try {
                const res = await fetch(`/api/share/${id}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    setError(errorData);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setCodeData(data);
                setLoading(false);
            } catch (e) {
                setError({ error: 'Network error' });
                setLoading(false);
                console.error(e);
            }
        };

        fetchCodes();
    }, [id]);

    // Timer logic - sync with absolute system time
    useEffect(() => {
        if (!codeData) return;

        const update = () => {
            const now = Math.floor(Date.now() / 1000);
            const elapsed = now - codeData.firstCodeTimestamp;
            const periodIndex = Math.floor(elapsed / codeData.period);
            const timeIntoCurrentPeriod = elapsed % codeData.period;
            const remaining = codeData.period - timeIntoCurrentPeriod;

            setTimeLeft(remaining);
            setCurrentIndex(Math.min(periodIndex, codeData.codes.length - 1));
        };

        update(); // Initial update
        const interval = setInterval(update, 100); // Update every 100ms for better sync

        return () => clearInterval(interval);
    }, [codeData]);

    // Calculate progress
    const progress = codeData ? (timeLeft / codeData.period) * 100 : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        const isNotFound = error.errorType === 'not_found';
        const isBurned = error.errorType === 'burned';
        const isExpired = error.errorType === 'expired';

        const iconColor = isNotFound ? 'text-gray-400' : isBurned ? 'text-purple-600' : 'text-orange-500';
        const bgColor = isNotFound ? 'bg-gray-100' : isBurned ? 'bg-purple-50' : 'bg-orange-50';
        const borderColor = isNotFound ? 'border-gray-200' : isBurned ? 'border-purple-100' : 'border-orange-100';
        const Icon = isNotFound ? AlertCircle : isBurned ? Flame : XCircle;

        const title = isNotFound ? 'Link Invalid' : isBurned ? 'Link Burned' : 'Link Expired';

        let subtitle = error.error;
        if (isExpired) subtitle = 'This link has expired.';
        if (isBurned) subtitle = 'This link has already been viewed.';
        if (isNotFound) subtitle = 'This link does not exist or has been deleted.';

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className={`w-full max-w-sm bg-white border ${borderColor} rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300`}>
                    <div className={`w-14 h-14 ${bgColor} ${iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}

                    <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                        <ArrowLeft size={14} />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!codeData || currentIndex >= codeData.codes.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">All Codes Used</h2>
                    <p className="text-sm text-gray-500">The time window for this share has ended.</p>
                </div>
            </div>
        );
    }

    const currentCode = codeData.codes[currentIndex];
    const expiryDate = new Date(codeData.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();
    const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
    const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header Tags - Optimized for Recipient */}
                <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                    {/* Tag 1: Identity */}
                    <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md shadow-sm border border-gray-200/60">
                        <ShieldCheck size={12} className="text-green-600" />
                        <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Secure Code</span>
                    </div>

                    {/* Tag 2: Expiry Status */}
                    {codeData.burnAfterReading ? (
                        <div className="inline-flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/60 shadow-sm">
                            <Flame size={12} className="text-purple-600" />
                            <span className="text-[11px] font-bold text-purple-700">
                                Burn After Reading ({codeData.codes.length - currentIndex} remaining)
                            </span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200/60 shadow-sm">
                            <Clock size={12} className="text-orange-600" />
                            <span className="text-[11px] font-bold text-orange-700">
                                {hoursUntilExpiry > 0 ? `expires in ${hoursUntilExpiry} hours` : `expires in ${minutesUntilExpiry} minutes`}
                            </span>
                        </div>
                    )}
                </div>

                {/* TOTP Card */}
                <TokenDisplay
                    token={currentCode}
                    progress={progress}
                    timeLeft={timeLeft}
                    isValid={true}
                />

                <div className="mt-8 text-center">
                    <Link href="/" className="text-[10px] text-gray-300 hover:text-gray-400 font-mono transition-colors">
                        POWERED BY OTPSHARE
                    </Link>
                </div>
            </div>
        </div>
    );
}