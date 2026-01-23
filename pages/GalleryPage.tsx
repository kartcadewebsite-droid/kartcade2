import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const GalleryPage: React.FC = () => {
    useEffect(() => {
        document.title = "Gallery | Kartcade Racing Simulator Lounge";
    }, []);

    // Interior photos
    const photos = [
        { src: "/images/kartcade/hero.png", title: "The Lounge" },
        { src: "/images/kartcade/karts.png", title: "Racing Karts" },
        { src: "/images/kartcade/rigs.png", title: "Full-Size Rigs" },
        { src: "/images/kartcade/motion.png", title: "Motion Simulator" },
        { src: "/images/kartcade/flight.png", title: "Flight Simulator" },
    ];

    // Videos - replace with actual Kartcade videos
    const videos = [
        { src: "/videos/racing1.mp4", poster: "/images/kartcade/karts.png", title: "Racing Action" },
        { src: "/videos/motion.mp4", poster: "/images/kartcade/motion.png", title: "Motion Simulator" },
        { src: "/videos/rigs.mp4", poster: "/images/kartcade/rigs.png", title: "Full-Size Rigs" },
        { src: "/videos/flight.mp4", poster: "/images/kartcade/flight.png", title: "Flight Sim" },
    ];

    return (
        <div className="bg-[#0A0A0A] text-white min-h-screen">
            {/* Hero */}
            <section className="pt-40 pb-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[#2D9E49] text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
                        Gallery
                    </span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                        Inside <span className="text-[#D42428]">Kartcade</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-xl">
                        Take a look around Oregon's premier racing simulator lounge.
                    </p>
                </div>
            </section>

            {/* Videos Section */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8">Videos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {videos.map((video, index) => (
                            <div key={index} className="relative overflow-hidden rounded-2xl aspect-video group">
                                <video
                                    src={video.src}
                                    poster={video.poster}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white font-medium">{video.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Photos Section */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8">Photos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {photos.map((photo, index) => (
                            <div
                                key={index}
                                className={`relative overflow-hidden rounded-2xl group ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                                    }`}
                            >
                                <img
                                    src={photo.src}
                                    alt={photo.title}
                                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${index === 0 ? 'h-full min-h-[400px]' : 'h-64'
                                        }`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white font-medium">{photo.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 md:px-12 bg-[#141414]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Experience It?
                    </h2>
                    <p className="text-white/60 text-lg mb-8">
                        Book your session and see it all in person.
                    </p>
                    <Link
                        to="/book"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors"
                    >
                        Book Now <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default GalleryPage;
