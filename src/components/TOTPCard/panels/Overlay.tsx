import { X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function Overlay({ isOpen, onClose, children }: Props) {
    return (
        <div
            className={clsx(
                "absolute inset-x-0 top-0 bottom-[72px] bg-white/95 backdrop-blur-xl z-[60] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-[20px] opacity-0 pointer-events-none"
            )}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-800 transition-colors z-50"
            >
                <X size={20} />
            </button>
            <div className="h-full w-full flex flex-col items-center justify-center p-8">
                {isOpen && children}
            </div>
        </div>
    );
}