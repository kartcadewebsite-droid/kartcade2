import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Plane, Settings, X, ChevronDown } from 'lucide-react';

// Game interface
interface Game {
    id: string;
    name: string;
    description: string;
    videoUrl?: string; // Path to local .webm/.mp4 or youtube ID if we decide to mix
    tags?: string[];
}

// Data organized by category
const racingGames: { [key: string]: Game[] } = {
    ultraRealistic: [
        { id: 'iracing', name: 'iRacing', description: 'What the pros use to train. This sim on our motion rig is the best that it gets', tags: ['Simulation', 'Motion Support'] },
        { id: 'assetto-corsa', name: 'Assetto Corsa', description: 'Any car or track, compete against your friends, plus custom-designed elements for you to explore', videoUrl: 'https://firebasestorage.googleapis.com/v0/b/kartcade-website.firebasestorage.app/o/assetto-corsa%20(1).mp4?alt=media&token=e0f8b768-d644-4689-af56-43cbe2caae03', tags: ['Mod Support', 'Drifting'] },
        { id: 'automobilista-2', name: 'Automobilista 2', description: 'Global tracks with a wide array of car choices, ranging from go karts to hypercars', videoUrl: 'https://firebasestorage.googleapis.com/v0/b/kartcade-website.firebasestorage.app/o/Automobilista%20(1).mp4?alt=media&token=b9beee21-ebe3-4d03-9348-15fe8cb06bb3', tags: ['VR Ready', 'Graphics'] },
        { id: 'f1-25', name: 'F1 25', description: 'The official video game of the 2025 FIA Formula One World Championship™, featuring a revamped My Team mode and pro-level physics.', videoUrl: 'https://firebasestorage.googleapis.com/v0/b/kartcade-website.firebasestorage.app/o/F1%202025.MOV%20(1).mp4?alt=media&token=f2ba986c-7684-4957-b3e3-c92371f923bc', tags: ['Official Sim', 'Career Mode'] },
        { id: 'lemans', name: 'Le Mans Ultimate', description: 'The official Le Mans endurance racing sim with laser-scanned tracks', tags: ['Endurance', 'Official Sim'] },
        { id: 'ac-rally', name: 'Assetto Corsa Rally', description: "Just released to wide acclaim! We have this installed on the motion rig and one adult rig and it's a blast", videoUrl: 'https://firebasestorage.googleapis.com/v0/b/kartcade-website.firebasestorage.app/o/assetto-rally%20(1).MOV?alt=media&token=3f44f6b1-c601-4143-ad93-09253931b241', tags: ['Rally', 'Motion Support'] },
        { id: 'dirt-2', name: 'Dirt Rally 2.0', description: 'Punishing, realistic rally racing across gravel, tarmac, and snow', tags: ['Rally', 'Hardcore'] },
        { id: 'wrc', name: 'WRC', description: 'Rally racing in an easier-to-handle format with amazing graphics', tags: ['Rally', 'Modern'] },
        { id: 'rbr', name: 'Richard Burns Rally', description: "The hardest of the hardcore rally simulators - loved by the pro's and purists", tags: ['Simulation', 'Legacy'] },
    ],
    competitive: [
        { id: 'grid-legends', name: 'Grid Legends', description: 'Arcade-meets-sim racing with intense wheel-to-wheel action', videoUrl: 'https://firebasestorage.googleapis.com/v0/b/kartcade-website.firebasestorage.app/o/grid-legends%20(1).mov?alt=media&token=1ff2d2d2-3fed-4cfa-bf7c-ce093ca433a8', tags: ['Arcade-Sim', 'Story Mode'] },
        { id: 'carx', name: 'CarX Drift Online', description: 'Master the art of drifting with realistic physics and multiplayer competition', tags: ['Drifting', 'Multiplayer'] },
    ],
    arcadeFun: [
        { id: 'wreckfest', name: 'Wreckfest (1 & 2)', description: 'Full-contact racing with destruction derby chaos', videoUrl: 'https://firebasestorage.googleapis.com/v0/b/kartcade-website.firebasestorage.app/o/Wreckfest%20(1).MOV?alt=media&token=61c10948-aaf3-4306-a096-ff8bdda6cdf2', tags: ['Destruction', 'Fun'] },
        { id: 'deathsprint', name: 'Deathsprint 66', description: 'High-speed futuristic racing with violent obstacles', tags: ['Futuristic', 'Combat'] },
        { id: 'beamng', name: 'BeamNG', description: 'Realistic crash physics and open-world exploration', tags: ['Sandbox', 'Physics'] },
        { id: 'truck-sim', name: 'American Truck Simulator', description: 'Relax with cross-country trucking across the American West', tags: ['Relaxing', 'Open World'] },
    ],
};

const flightGames: { [key: string]: Game[] } = {
    simulation: [
        { id: 'msfs', name: 'Microsoft Flight Simulator', description: 'Fly the world, take off and land from real airports, fly missions, and explore in 200+ planes', tags: ['Simulation', 'Open World'] },
        { id: 'squadrons', name: 'Star Wars Squadrons', description: 'Space combat in iconic Star Wars starfighters (flight sim)', tags: ['Space', 'VR Ready'] },
        { id: 'ace-combat', name: 'Ace Combat 7', description: 'Become an ace pilot and soar through photorealistic skies with full 360 degree movement; down enemy aircraft and experience the thrill of engaging in realistic sorties! Aerial combat has never looked or felt better!', videoUrl: 'https://firebasestorage.googleapis.com/v0/b/kartcade-website.firebasestorage.app/o/acecombat%20(1).mp4?alt=media&token=2f32e8ba-0d9e-45c9-b104-fd3e7fe992f2', tags: ['Action', 'Story'] },
        { id: 'dcs', name: 'Digital Combat Simulator', description: 'Fly real historic missions with real objectives', tags: ['Military', 'Hardcore'] },
    ],
    arcade: [
        { id: 'fly-dangerous', name: 'Fly Dangerous', description: 'Cruise around in space in zero gravity', tags: ['Sci-Fi', 'Free Flight'] },
        { id: 'jetborne', name: 'Jetborne Racing', description: 'Hone your flight skills in tunnels against other flight racers', tags: ['Racing', 'VR Ready'] },
        { id: 'war-thunder', name: 'War Thunder', description: 'WW1 style planes, tanks, and ships', tags: ['MMO', 'Combat'] },
    ],
};

interface GameCardProps {
    game: Game;
    onClick: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => (
    <div
        onClick={() => onClick(game)}
        className="group bg-[#141414] hover:bg-[#1a1a1a] rounded-lg md:rounded-xl p-4 md:p-5 border border-white/10 hover:border-[#2D9E49]/30 transition-all duration-300 cursor-pointer h-full flex flex-col"
    >
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-display text-sm md:text-lg font-bold uppercase text-white group-hover:text-[#2D9E49] transition-colors">{game.name}</h4>
            <div className="bg-white/5 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-3 h-3 text-[#2D9E49] transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
        </div>
        <p className="text-white/60 font-sans text-xs md:text-sm leading-relaxed flex-grow">{game.description}</p>

        {/* Tags (optional visual flair) */}
        {game.tags && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                {game.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider text-white/30 bg-white/5 px-2 py-1 rounded-sm">
                        {tag}
                    </span>
                ))}
            </div>
        )}
    </div>
);

const ExperiencesPage: React.FC = () => {
    // State for Slide-Over
    const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);
    const [videoCollapsed, setVideoCollapsed] = React.useState(false);

    const openGame = (game: Game) => setSelectedGame(game);
    const closeGame = () => {
        setSelectedGame(null);
        setVideoCollapsed(false);
    };

    // Reset video state when a new game is opened
    React.useEffect(() => {
        setVideoCollapsed(false);
    }, [selectedGame?.id]);

    // Collapse video when user starts scrolling the modal card
    const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (e.currentTarget.scrollTop > 20 && !videoCollapsed) {
            setVideoCollapsed(true);
        }
    };

    // Body scroll lock
    React.useEffect(() => {
        if (selectedGame) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedGame]);

    return (
        <div className="relative bg-[#0A0A0A]">
            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#2D9E49] to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-[40%] w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
                </div>
                <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
                    <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-xs md:text-sm mb-4 md:mb-6 block text-center">
                        40+ Games Available
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-bold uppercase leading-none text-center text-white mb-4 md:mb-6">
                        Games &<br />
                        <span className="text-[#D42428]">Experiences</span>
                    </h1>
                    <p className="font-sans text-base md:text-xl text-white/60 max-w-2xl mx-auto text-center leading-relaxed px-4">
                        Explore our curated library spanning arcade fun to hardcore simulation.
                        Click on any game to see a preview!
                    </p>
                </div>
            </section>

            {/* Gaming Philosophy */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-5xl">
                    <div className="bg-[#141414] rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-12 border border-white/10">
                        <h2 className="font-display text-lg md:text-2xl lg:text-3xl font-bold uppercase mb-4 md:mb-6 text-center text-white">Our Gaming Philosophy</h2>
                        <p className="text-white/70 font-sans text-sm md:text-lg text-center leading-relaxed max-w-3xl mx-auto">
                            Kartcade isn't just about sim racing—it's about celebrating every type of driving experience. We've curated a library that spans the full spectrum from arcade fun to hardcore simulation, including games you won't find at any other racing lounge. Each of the games below is fully configured and available to demo on a selected machine. Monthly members are able to load their own games from their steam profile and our staff will help you configure the components to your liking.
                        </p>
                    </div>
                </div>
            </section>

            {/* Driving / Racing Games */}
            <section className="py-8 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-6xl">
                    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-[#D42428]/20 border border-[#D42428]/30 flex items-center justify-center flex-shrink-0">
                            <Gamepad2 className="w-5 h-5 md:w-7 md:h-7 text-[#D42428]" />
                        </div>
                        <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold uppercase text-white">Driving / Racing Games</h2>
                    </div>

                    {/* Ultra-Realistic Simulations */}
                    <div className="mb-6 md:mb-10">
                        <h3 className="font-display text-sm md:text-xl font-bold uppercase text-[#D42428] mb-3 md:mb-5 flex items-center gap-2 md:gap-3">
                            <span className="w-6 md:w-8 h-[2px] bg-[#D42428]" />
                            Ultra-Realistic Simulations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {racingGames.ultraRealistic.map((game) => (
                                <GameCard key={game.id} game={game} onClick={openGame} />
                            ))}
                        </div>
                    </div>

                    {/* Competitive Racing */}
                    <div className="mb-6 md:mb-10">
                        <h3 className="font-display text-sm md:text-xl font-bold uppercase text-[#2D9E49] mb-3 md:mb-5 flex items-center gap-2 md:gap-3">
                            <span className="w-6 md:w-8 h-[2px] bg-[#2D9E49]" />
                            Competitive Racing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {racingGames.competitive.map((game) => (
                                <GameCard key={game.id} game={game} onClick={openGame} />
                            ))}
                        </div>
                    </div>

                    {/* Arcade & Fun */}
                    <div className="mb-6 md:mb-10">
                        <h3 className="font-display text-sm md:text-xl font-bold uppercase text-white/80 mb-3 md:mb-5 flex items-center gap-2 md:gap-3">
                            <span className="w-6 md:w-8 h-[2px] bg-white/40" />
                            Arcade & Fun
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {racingGames.arcadeFun.map((game) => (
                                <GameCard key={game.id} game={game} onClick={openGame} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Flight Simulation / Arcade */}
            <section className="py-8 md:py-16 bg-[#0d0d0d]">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-6xl">
                    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-[#2D9E49]/20 border border-[#2D9E49]/30 flex items-center justify-center flex-shrink-0">
                            <Plane className="w-5 h-5 md:w-7 md:h-7 text-[#2D9E49]" />
                        </div>
                        <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold uppercase text-white">Flight Simulation / Arcade</h2>
                    </div>

                    {/* Simulation */}
                    <div className="mb-6 md:mb-10">
                        <h3 className="font-display text-sm md:text-xl font-bold uppercase text-[#2D9E49] mb-3 md:mb-5 flex items-center gap-2 md:gap-3">
                            <span className="w-6 md:w-8 h-[2px] bg-[#2D9E49]" />
                            Simulation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {flightGames.simulation.map((game) => (
                                <GameCard key={game.id} game={game} onClick={openGame} />
                            ))}
                        </div>
                    </div>

                    {/* Arcade */}
                    <div>
                        <h3 className="font-display text-sm md:text-xl font-bold uppercase text-white/80 mb-3 md:mb-5 flex items-center gap-2 md:gap-3">
                            <span className="w-6 md:w-8 h-[2px] bg-white/40" />
                            Arcade
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {flightGames.arcade.map((game) => (
                                <GameCard key={game.id} game={game} onClick={openGame} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Wheel Integration Section (Unchanged) */}
            <section className="py-8 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-5xl">
                    <div className="bg-[#141414] rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-12 border border-white/10">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                                <Settings className="w-5 h-5 md:w-7 md:h-7 text-white" />
                            </div>
                            <h2 className="font-display text-lg md:text-2xl lg:text-3xl font-bold uppercase text-white">Custom Wheel Integration</h2>
                        </div>
                        <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">
                            Some of these games weren't designed to work with racing wheels, but we've customized our systems with controller emulators to make it happen. This means you can experience the tactile satisfaction of steering wheel control in games where most people are stuck with controllers.
                        </p>
                    </div>

                    {/* Steam Profile */}
                    <div className="mt-6 bg-[#141414] rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-12 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-500/10 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                    <Gamepad2 className="w-5 h-5 md:w-7 md:h-7 text-blue-500" />
                                </div>
                                <div>
                                    <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-1 block">Member Perk</span>
                                    <h2 className="font-display text-lg md:text-2xl lg:text-3xl font-bold uppercase text-white">Steam Cloud Saves</h2>
                                </div>
                            </div>
                            <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">
                                Are you a monthly member? You can <span className="text-white font-bold">log in to your own Steam account</span> on our rigs. This gives you instant access to your personal game library, cloud saves, and achievements—so you can pick up exactly where you left off at home, but on pro-grade equipment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-16 md:py-32 bg-[#0A0A0A] text-white overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#2D9E49] to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-[40%] w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
                    <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-xs md:text-sm mb-4 md:mb-6">
                        Can't Find What You Want?
                    </span>

                    <h2 className="font-display text-3xl md:text-4xl lg:text-6xl font-bold uppercase leading-none mb-4 md:mb-8">
                        We Take<br />
                        <span className="text-[#D42428]">Requests!</span>
                    </h2>

                    <p className="font-sans text-sm md:text-xl text-white/60 max-w-2xl mb-8 md:mb-16 leading-relaxed px-4">
                        We're always expanding our library. If there's a racing, driving, or flying game you'd love to play with our equipment, let us know!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
                        <Link
                            to="/contact"
                            className="group relative bg-[#2D9E49] text-white px-8 md:px-12 py-4 md:py-6 rounded-full font-display uppercase tracking-widest font-bold text-sm md:text-base overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#2D9E49]/30 text-center"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Request a Game <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            to="/book"
                            className="group relative bg-[#D42428] text-white px-8 md:px-12 py-4 md:py-6 rounded-full font-display uppercase tracking-widest font-bold text-sm md:text-base overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#D42428]/30 text-center"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Book a Session <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Video Preview Modal */}
            {createPortal(
                <div
                    className={`fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-8 transition-all duration-300 ${selectedGame ? 'visible opacity-100' : 'invisible opacity-0'}`}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={closeGame}
                    ></div>

                    {/* ═══ MODAL CARD — fixed size, NEVER grows or shrinks ═══ */}
                    <div
                        className={`relative z-10 w-full md:max-w-4xl h-[82svh] md:h-[600px] bg-[#141414] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl transform transition-all duration-300 flex flex-col md:flex-row pointer-events-auto overflow-hidden ${selectedGame ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeGame}
                            className="absolute top-4 right-4 z-[50] bg-black/60 hover:bg-[#D42428] p-2.5 rounded-full text-white transition-all backdrop-blur-md border border-white/10 group"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        </button>

                        {selectedGame && (
                            <>
                                {/* ── VIDEO SECTION (mobile: drives layout via flex-shrink) */}
                                {/* State 1: aspect-[4/5] → fills card, content peeks below */}
                                {/* State 2: h-[80px] → collapses, content fills rest         */}
                                <div
                                    onClick={() => setVideoCollapsed(v => !v)}
                                    className={`relative w-full flex-shrink-0 bg-black overflow-hidden cursor-pointer
                                        md:cursor-default md:flex-shrink-0 md:w-[45%] md:order-2 md:h-full
                                        border-b md:border-b-0 md:border-l border-white/10
                                        transition-all duration-500 ease-in-out
                                        ${videoCollapsed ? 'aspect-[5/4]' : 'aspect-[4/5]'}`}
                                >
                                    <video
                                        key={selectedGame.videoUrl || 'default'}
                                        src={selectedGame.videoUrl || "/videos/experiences-trailer.mp4"}
                                        autoPlay muted loop playsInline
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Collapse chevron — shows on mobile only */}
                                    <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 md:hidden transition-all duration-300 ${videoCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                                        <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 flex items-center gap-1.5 text-white/70 text-[11px] font-medium">
                                            <svg className="w-3 h-3 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
                                            Tap to see details
                                        </div>
                                    </div>

                                    {/* Expand chevron — shows when collapsed */}
                                    <div className={`absolute inset-0 flex items-center justify-center md:hidden transition-opacity duration-300 ${videoCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                        <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-white/70 text-[11px] font-medium">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 9l-6 6-6-6" /></svg>
                                            Tap to expand video
                                        </div>
                                    </div>

                                    {/* Desktop side gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-l from-[#141414] via-transparent to-transparent pointer-events-none hidden md:block"></div>
                                </div>

                                {/* ── CONTENT SECTION — flex-1 fills whatever space the video leaves */}
                                <div className="relative z-10 flex-1 w-full md:w-[55%] md:order-1 flex flex-col min-h-0 overflow-hidden">
                                    {/* Scrollable content */}
                                    <div className="flex-1 overflow-y-auto min-h-0 p-5 md:p-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                        <div className="flex flex-wrap gap-2 mb-3 md:mb-5">
                                            {selectedGame.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#2D9E49] bg-[#2D9E49]/10 border border-[#2D9E49]/30 px-2 py-1 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h2 className="font-display text-2xl md:text-5xl font-bold uppercase text-white mb-2 md:mb-5 leading-none">
                                            {selectedGame.name}
                                        </h2>

                                        <p className="text-white/70 font-sans text-sm md:text-lg leading-relaxed mb-6 md:mb-10 max-w-md">
                                            {selectedGame.description}
                                        </p>

                                        <div className="space-y-3 hidden md:block">
                                            <h3 className="font-display text-xs font-bold uppercase text-white/40 tracking-widest">Highlights</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-white/80 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-[#2D9E49] flex-shrink-0"></div>High-Fidelity Graphics</div>
                                                <div className="flex items-center gap-3 text-white/80 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-[#D42428] flex-shrink-0"></div>Force Feedback Compatible</div>
                                                <div className="flex items-center gap-3 text-white/80 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></div>Pro-Level Physics</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pinned Book Button */}
                                    <div className="flex-shrink-0 p-4 md:p-8 border-t border-white/10 bg-[#141414] md:bg-transparent">
                                        <Link
                                            to={`/book?notes=I want to play ${selectedGame.name}`}
                                            className="flex items-center justify-center gap-2 w-full py-4 bg-[#D42428] hover:bg-[#B91C1C] text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all group shadow-lg shadow-red-900/30"
                                            onClick={closeGame}
                                        >
                                            Book This Experience <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ExperiencesPage;
