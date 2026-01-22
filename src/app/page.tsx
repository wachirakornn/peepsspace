import { PeepsLogo } from "@/components/PeepsLogo";
import CrosswordGame from "@/components/CrosswordGame";

export default function Home() {
    return (
        <div className="h-screen w-full bg-black sm:p-4 font-sans flex items-center justify-center overflow-hidden">
            {/* Retro Poster Card */}
            <div className="w-full h-full sm:h-auto sm:max-w-2xl bg-[#2828E2] p-2 sm:p-8 rounded-sm sm:shadow-2xl relative flex flex-col items-center justify-center border-4 border-black">
                {/* Grain/Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

                <main className="relative z-10 flex flex-col items-center gap-4 w-full h-full justify-between sm:justify-center">

                    {/* Top Section */}
                    <div className="flex flex-col items-center gap-2 mt-4 sm:mt-0">
                        <PeepsLogo className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
                        <div className="text-center">
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white leading-none">
                                Something's<br />Cooking
                            </h1>
                        </div>
                    </div>

                    {/* Game Section (Flex grow to take available space) */}
                    <div className="flex-1 flex items-center justify-center w-full my-2">
                        <CrosswordGame />
                    </div>

                    {/* Footer Section */}
                    <div className="mb-4 sm:mb-0 text-center">
                        <p className="font-bold uppercase text-xs tracking-widest text-white/50">
                            Find us if you can
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
