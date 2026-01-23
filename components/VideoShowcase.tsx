import React from 'react';

interface VideoCardProps {
    src: string;
    poster?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ src, poster }) => {
    return (
        <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl aspect-[4/5]">
            <video
                src={src}
                poster={poster}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            />
        </div>
    );
};

const VideoShowcase: React.FC = () => {
    const videos = [
        { src: "/videos/racing1.mp4", poster: "/images/kartcade/karts.png" },
        { src: "/videos/motion.mp4", poster: "/images/kartcade/motion.png" },
        { src: "/videos/rigs.mp4", poster: "/images/kartcade/rigs.png" },
        { src: "/videos/flight.mp4", poster: "/images/kartcade/flight.png" }
    ];

    return (
        <section className="relative z-10 py-24 px-6 md:px-12 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Section Title */}
                <div className="text-center mb-16">
                    <span className="text-[#2D9E49] text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
                        See The Action
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
                        Live From Kartcade
                    </h2>
                </div>

                {/* Video Cards Grid - 4:5 aspect ratio */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {videos.map((video, index) => (
                        <VideoCard
                            key={index}
                            src={video.src}
                            poster={video.poster}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VideoShowcase;
