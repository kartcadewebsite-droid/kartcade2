import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Upload, Trash2, Loader2, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { auth, db, storage } from '../config/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import imageCompression from 'browser-image-compression';

interface GalleryPhoto {
    id: string;
    url: string;
    title: string;
    uploadedAt: any;
    fileName: string;
}

const GalleryPage: React.FC = () => {
    const { currentUser, isAdmin } = useAuth();
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        document.title = "Gallery | Kartcade Racing Simulator Lounge";

        const q = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const photoData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as GalleryPhoto[];
            setPhotos(photoData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isAdmin) return;

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);

        try {
            // 1. Optimize Image (WebP + Compression)
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/webp'
            };

            const compressedFile = await imageCompression(file, options);

            // Generate WebP filename
            const baseName = file.name.split('.').slice(0, -1).join('.') || 'photo';
            const fileName = `${Date.now()}-${baseName}.webp`;

            const storageRef = ref(storage, `gallery/${fileName}`);

            // 2. Upload Compressed to Storage
            const snapshot = await uploadBytes(storageRef, compressedFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 3. Save to Firestore
            await addDoc(collection(db, 'gallery'), {
                url: downloadURL,
                title: baseName,
                fileName: fileName,
                uploadedAt: serverTimestamp(),
                uploadedBy: currentUser?.email
            });

            setUploadSuccess(true);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (err: any) {
            console.error('[GALLERY] Upload failed:', err);
            setUploadError(err.message || 'Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeletePhoto = async (photo: GalleryPhoto) => {
        if (!isAdmin || !window.confirm('Are you sure you want to delete this photo from the gallery?')) return;

        try {
            // 1. Delete from Storage
            const storageRef = ref(storage, `gallery/${photo.fileName}`);
            await deleteObject(storageRef);

            // 2. Delete from Firestore
            await deleteDoc(doc(db, 'gallery', photo.id));
        } catch (err: any) {
            console.error('[GALLERY] Delete failed:', err);
            alert('Failed to delete photo. It may have already been removed.');
        }
    };

    // Static videos (marketing assets)
    const videos = [
        { src: "/videos/racing1.mp4", poster: "/images/kartcade/karts.png", title: "Racing Action" },
        { src: "/videos/motion.mp4", poster: "/images/kartcade/motion.png", title: "Motion Simulator" },
        { src: "/videos/rigs.mp4", poster: "/images/kartcade/rigs.png", title: "Full-Size Rigs" },
        { src: "/videos/flight.mp4", poster: "/images/kartcade/flight.png", title: "Flight Sim" },
    ];

    return (
        <div className="bg-[#0A0A0A] text-white min-h-screen">
            {/* Hero */}
            <section className="pt-40 pb-16 px-6 md:px-12 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2D9E49]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <span className="text-[#2D9E49] text-xs font-bold tracking-[0.3em] uppercase mb-4 block">
                                Kartcade Community
                            </span>
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-6 font-display">
                                THE <span className="text-[#D42428] italic">LENS</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/40 max-w-xl font-medium">
                                Action shots, community events, and world-class rigs. See what's happening at Oregon's premier lounge.
                            </p>
                        </div>

                        {/* Admin Upload Control */}
                        {isAdmin && (
                            <div className="bg-[#141414] border border-white/10 p-6 rounded-3xl shadow-2xl md:w-80">
                                <h3 className="text-white text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3 text-[#2D9E49]" /> Admin Marketing Tool
                                </h3>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest transition-all ${isUploading ? 'bg-white/5 text-white/20' :
                                        uploadSuccess ? 'bg-[#2D9E49] text-white' : 'bg-white text-black hover:bg-[#2D9E49] hover:text-white'
                                        }`}
                                >
                                    {isUploading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                    ) : uploadSuccess ? (
                                        <><CheckCircle className="w-4 h-4" /> Live on Site!</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Upload to Gallery</>
                                    )}
                                </button>

                                {uploadError && (
                                    <p className="mt-3 text-[#D42428] text-[10px] font-bold uppercase text-center flex items-center justify-center gap-1">
                                        <XCircle className="w-3 h-3" /> {uploadError}
                                    </p>
                                )}

                                <p className="mt-4 text-[9px] text-white/30 text-center leading-relaxed">
                                    Only photos uploaded here will be visible to the public. High-res imagery recommended.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Videos Section */}
            <section className="py-20 px-6 md:px-12 bg-black/40">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-bold tracking-tight uppercase font-display">Cinema</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {videos.map((video, index) => (
                            <div key={index} className="relative overflow-hidden rounded-[2.5rem] aspect-video group border border-white/10 shadow-2xl">
                                <video
                                    src={video.src}
                                    poster={video.poster}
                                    muted
                                    loop
                                    onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                                    onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                        <Play className="w-5 h-5 text-white fill-white" />
                                    </div>
                                    <p className="text-white font-bold text-lg tracking-tight">{video.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dynamic Photos Section (Masonry) */}
            <section className="py-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight uppercase font-display">Atmosphere</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-white/20">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest text-white/40">Loading Atmosphere...</p>
                        </div>
                    ) : photos.length > 0 ? (
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                            {photos.map((photo) => (
                                <div key={photo.id} className="relative group break-inside-avoid">
                                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-xl bg-white/5 transition-all hover:border-[#2D9E49]/30">
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            loading="lazy"
                                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                            <p className="text-white font-bold text-xs uppercase tracking-widest mb-1">{photo.title}</p>
                                            <p className="text-white/40 text-[9px] uppercase tracking-tighter">
                                                {photo.uploadedAt?.toDate()?.toLocaleDateString() || 'Recently Captured'}
                                            </p>
                                        </div>

                                        {/* Admin Delete Button */}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeletePhoto(photo)}
                                                className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[#D42428] hover:bg-[#D42428] hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                                                title="Remove from Gallery"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 bg-[#141414] rounded-[3rem] border border-dashed border-white/10">
                            <ImageIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/40 font-medium italic">The gallery is currently being curated.</p>
                            {isAdmin && <p className="text-[10px] text-[#2D9E49] font-bold uppercase mt-2">Use the upload tool above to add photos.</p>}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-[#D42428]/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 font-display tracking-tight">
                        WANT TO BE IN THE <span className="text-[#D42428]">FRAME?</span>
                    </h2>
                    <p className="text-white/60 text-lg md:text-xl mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
                        Book your session, hit the track, and maybe you'll spot yourself on our next atmosphere update.
                    </p>
                    <Link
                        to="/book"
                        className="inline-flex items-center gap-4 px-12 py-5 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-[0.2em] hover:bg-[#B91C1C] transition-all transform hover:scale-105 shadow-2xl shadow-[#D42428]/20 group text-sm"
                    >
                        Secure Your Session <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default GalleryPage;
