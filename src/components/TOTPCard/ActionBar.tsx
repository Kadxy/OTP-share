import { Settings2, QrCode, Share2 } from 'lucide-react';
import clsx from 'clsx';

export type PanelType = 'none' | 'qr' | 'settings' | 'share';

interface Props {
    activePanel: PanelType;
    onToggle: (panel: PanelType) => void;
}

export function ActionBar({ activePanel, onToggle }: Props) {
    const btnClass = (isActive: boolean) => clsx(
        "flex flex-col items-center justify-center gap-1.5 transition-colors hover:bg-gray-100 group",
        isActive ? "bg-white shadow-[inset_0_-2px_0_0_#2563eb]" : ""
    );

    const iconClass = (isActive: boolean) => clsx(
        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-700"
    );

    const textClass = (isActive: boolean) => clsx(
        "text-[10px] font-bold uppercase tracking-wider",
        isActive ? "text-blue-600" : "text-gray-400"
    );

    const handleToggle = (panel: PanelType) => {
        // Toggle behavior: if clicking the active panel, close it
        onToggle(activePanel === panel ? 'none' : panel);
    };

    return (
        <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50/50 divide-x divide-gray-100 h-[72px]">
            <button onClick={() => handleToggle('settings')} className={btnClass(activePanel === 'settings')}>
                <Settings2 size={20} className={iconClass(activePanel === 'settings')} />
                <span className={textClass(activePanel === 'settings')}>Params</span>
            </button>

            <button onClick={() => handleToggle('qr')} className={btnClass(activePanel === 'qr')}>
                <QrCode size={20} className={iconClass(activePanel === 'qr')} />
                <span className={textClass(activePanel === 'qr')}>QR Code</span>
            </button>

            <button onClick={() => handleToggle('share')} className={btnClass(activePanel === 'share')}>
                <Share2 size={20} className={iconClass(activePanel === 'share')} />
                <span className={textClass(activePanel === 'share')}>Share</span>
            </button>
        </div>
    );
}