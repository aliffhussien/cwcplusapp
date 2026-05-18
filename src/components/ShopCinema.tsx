import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Edit2 } from 'lucide-react';

interface ShopCinemaProps {
    videoData: any;
    isAdmin: boolean;
    onEdit: () => void;
}

export default function ShopCinema({ videoData, isAdmin, onEdit }: ShopCinemaProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) videoRef.current?.play().catch(() => { });
                else videoRef.current?.pause();
            },
            { threshold: 0.3 }
        );
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    if (!videoData?.url && !isAdmin) return null;

    return (
        <div className="mt-20 mb-32 px-2">
            <div className="flex flex-col items-center text-center mb-10">
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
                    Cook Like <span className="text-accent">Family</span>
                </h2>
                <p className="text-text-3 text-[10px] font-black uppercase tracking-widest max-w-sm">
                    High-performance tools, tested in the heat of our own kitchen every single day.
                </p>
            </div>

            <div className="relative w-full aspect-[4/5] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-glass-bg group border border-glass-border shadow-2xl">
                {videoData?.url ? (
                    <video
                        ref={videoRef}
                        src={videoData.url}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover opacity-70"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                        <VolumeX size={48} className="mb-4" />
                        <p className="section-label">Video Stream Offline</p>
                    </div>
                )}

                <div className="absolute inset-0 bg-base/20 group-hover:bg-transparent transition-colors duration-700" />

                {videoData?.url && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em] mb-4 drop-shadow-md">
                            {videoData.subtitle || 'CWC Origins'}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black italic text-text-1 uppercase tracking-tighter mb-8 max-w-2xl drop-shadow-2xl">
                            {videoData.title || 'In The Kitchen'}
                        </h2>

                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="w-16 h-16 rounded-full border border-glass-border flex items-center justify-center hover:bg-text-1 hover:text-base transition-all bg-base/40 backdrop-blur-xl active:scale-95"
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </div>
                )}

                {isAdmin && (
                    <div className="absolute top-6 right-6 z-20">
                        <button onClick={onEdit} className="bg-glass-bg backdrop-blur-md border border-glass-border text-text-1 px-4 py-2.5 rounded-xl flex items-center gap-2 transform active:scale-95">
                            <Edit2 size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Edit Cinema</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
