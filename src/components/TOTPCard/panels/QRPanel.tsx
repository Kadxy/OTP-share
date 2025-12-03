import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck } from 'lucide-react'; // 去掉了 ExternalLink

export function QRPanel({ uri }: { uri: string }) {
    return (
        <div className="flex flex-col items-center w-full pt-10 pb-4 animate-in fade-in zoom-in-95 duration-300">

            {/* QR Code Card */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50">
                <QRCodeSVG
                    value={uri}
                    size={128}
                    level="M"
                    marginSize={1}
                    className="rounded-lg"
                />
            </div>

            <div className="w-full max-w-[200px] flex flex-col gap-3 mt-5">

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <span className="relative bg-white px-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        OR
                    </span>
                </div>

                <a
                    href={uri}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm rounded-xl transition-all group cursor-pointer w-full text-decoration-none"
                    title="Open in your Authenticator App"
                >
                    <ShieldCheck size={15} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                        Open Authenticator
                    </span>
                </a>
            </div>
        </div>
    );
}