import TOTPCard from "@/components/TOTPCard";
import Image from "next/image";
import Link from "next/link";
import { GithubIcon } from "@/components/icons/GithubIcon";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#fafafa]">
            <div className="text-center mb-6 space-y-5 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                    <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1">
                        <Image
                            src="/icon.svg"
                            alt="Logo"
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-xl"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">OTP Share</h1>
                    <p className="text-sm text-gray-400 font-medium tracking-wide">
                        Client-Side Generation <span className="text-gray-300 mx-1">·</span> Zero Secret Exposure
                    </p>
                </div>
            </div>

            <TOTPCard />

            <div className="mt-16 flex flex-col items-center gap-4">
                <Link
                    href="https://github.com/Kadxy/OTP-share"
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
                >
                    <GithubIcon size={12} className="text-gray-400 group-hover:text-black transition-colors" />
                    <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">Kadxy/OTP-share</span>
                </Link>
            </div>
        </main>
    );
}