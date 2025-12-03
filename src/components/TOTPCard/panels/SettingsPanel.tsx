import clsx from 'clsx';
import {
    ALLOWED_ALGOS,
    ALLOWED_DIGITS,
    ALLOWED_PERIODS,
    TOTPParams
} from '../types';

interface SettingsPanelProps {
    params: TOTPParams;
    setParams: (params: TOTPParams) => void;
}

export function SettingsPanel({ params, setParams }: SettingsPanelProps) {
    return (
        <div className="w-full flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300 space-y-6">

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Algorithm
                </label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100/80 p-1 rounded-xl">
                    {ALLOWED_ALGOS.map((algo) => (
                        <button
                            key={algo}
                            onClick={() => setParams({ ...params, algorithm: algo })}
                            className={clsx(
                                "py-2 rounded-lg text-[10px] font-bold transition-all",
                                params.algorithm === algo
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {algo}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Digits
                </label>
                <div className="grid grid-cols-2 gap-1 bg-gray-100/80 p-1 rounded-xl">
                    {ALLOWED_DIGITS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setParams({ ...params, digits: d })}
                            className={clsx(
                                "py-2 rounded-lg text-[10px] font-bold transition-all",
                                params.digits === d
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {d} Digits
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Period
                </label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100/80 p-1 rounded-xl">
                    {ALLOWED_PERIODS.map((p) => (
                        <button
                            key={p}
                            onClick={() => setParams({ ...params, period: p })}
                            className={clsx(
                                "py-2 rounded-lg text-[10px] font-bold transition-all",
                                params.period === p
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {p}s
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}