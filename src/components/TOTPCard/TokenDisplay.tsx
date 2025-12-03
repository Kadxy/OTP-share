import { useState, useRef, useEffect } from 'react';
import { Check, KeyRound } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    token: string;
    progress: number;
    timeLeft: number;
    isValid: boolean;
}

export function TokenDisplay({ token, progress, timeLeft, isValid }: Props) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleCopy = () => {
        if (!isValid) return;
        navigator.clipboard.writeText(token);

        if (timerRef.current) clearTimeout(timerRef.current);
        setCopied(true);
        timerRef.current = setTimeout(() => {
            setCopied(false);
            timerRef.current = null;
        }, 1200);
    };

    const isUrgent = timeLeft < 5;
    const activeColorClass = isUrgent ? "text-amber-600" : "text-gray-900";
    const activeBgClass = isUrgent ? "bg-amber-500" : "bg-gray-900";

    return (
        <div className="relative w-full p-8 pt-4 min-h-[180px] flex flex-col justify-center">
            <div
                onClick={handleCopy}
                className={clsx(
                    "relative w-full h-40 rounded-2xl transition-all duration-200 cursor-pointer select-none p-[2px] group",
                    "active:scale-[0.98] active:brightness-95",
                    isValid
                        ? "bg-gray-100 hover:bg-gray-300 shadow-sm"
                        : "bg-transparent"
                )}
            >
                <div className={clsx(
                    "relative w-full h-full rounded-[14px] overflow-hidden isolate [mask-image:linear-gradient(white,white)]",
                    isValid ? "bg-white" : "bg-gray-50"
                )}>

                    {isValid ? (
                        <>
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100/50 z-0">
                                <div
                                    className={clsx("h-full transition-all duration-1000 ease-linear rounded-tl-[14px]", activeBgClass)}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                                <div className={clsx("text-5xl font-mono font-bold tracking-[0.15em] tabular-nums transition-colors duration-300", activeColorClass)}>
                                    {token.slice(0, Math.ceil(token.length / 2))}
                                    <span className="text-transparent text-lg"> </span>
                                    {token.slice(Math.ceil(token.length / 2))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 space-y-3 z-0">
                            <KeyRound size={32} strokeWidth={1.5} className="opacity-30" />
                            <div className="text-sm font-medium text-gray-400">Enter Setup Key</div>
                        </div>
                    )}

                    <div className={clsx(
                        "absolute inset-0 z-10 flex flex-col items-center justify-center bg-white transition-all duration-200",
                        copied ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    )}>
                        <div className="flex flex-col items-center gap-3 animate-in zoom-in-50 duration-300">
                            <Check size={48} className="text-gray-900 drop-shadow-sm" strokeWidth={3} />
                            <span className="text-sm font-black tracking-[0.25em] text-gray-900 uppercase drop-shadow-sm">Copied</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}