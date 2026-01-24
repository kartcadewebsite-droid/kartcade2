import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Plane, Settings, X } from 'lucide-react';

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
        { id: 'assetto-corsa', name: 'Assetto Corsa', description: 'Any car or track, compete against your friends, plus custom-designed elements for you to explore', tags: ['Mod Support', 'Drifting'] },
        { id: 'automobilista-2', name: 'Automobilista 2', description: 'Global tracks with a wide array of car choices, ranging from go karts to hypercars', tags: ['VR Ready', 'Graphics'] },
        { id: 'lemans', name: 'Le Mans Ultimate', description: 'The official Le Mans endurance racing sim with laser-scanned tracks', tags: ['Endurance', 'Official Sim'] },
        { id: 'ac-rally', name: 'Assetto Corsa Rally', description: "Just released to wide acclaim! We have this installed on the motion rig and one adult rig and it's a blast", tags: ['Rally', 'Motion Support'] },
        { id: 'dirt-2', name: 'Dirt Rally 2.0', description: 'Punishing, realistic rally racing across gravel, tarmac, and snow', tags: ['Rally', 'Hardcore'] },
        { id: 'wrc', name: 'WRC', description: 'Rally racing in an easier-to-handle format with amazing graphics', tags: ['Rally', 'Modern'] },
        { id: 'rbr', name: 'Richard Burns Rally', description: "The hardest of the hardcore rally simulators - loved by the pro's and purists", tags: ['Simulation', 'Legacy'] },
    ],
    competitive: [
        { id: 'grid-legends', name: 'Grid Legends', description: 'Arcade-meets-sim racing with intense wheel-to-wheel action', tags: ['Arcade-Sim', 'Story Mode'] },
        { id: 'carx', name: 'CarX Drift Online', description: 'Master the art of drifting with realistic physics and multiplayer competition', tags: ['Drifting', 'Multiplayer'] },
    ],
    arcadeFun: [
        { id: 'wreckfest', name: 'Wreckfest (1 & 2)', description: 'Full-contact racing with destruction derby chaos', tags: ['Destruction', 'Fun'] },
        { id: 'deathsprint', name: 'Deathsprint 66', description: 'High-speed futuristic racing with violent obstacles', tags: ['Futuristic', 'Combat'] },
        { id: 'beamng', name: 'BeamNG', description: 'Realistic crash physics and open-world exploration', tags: ['Sandbox', 'Physics'] },
        { id: 'truck-sim', name: 'American Truck Simulator', description: 'Relax with cross-country trucking across the American West', tags: ['Relaxing', 'Open World'] },
    ],
};

const flightGames: { [key: string]: Game[] } = {
    simulation: [
        { id: 'msfs', name: 'Microsoft Flight Simulator', description: 'Fly the world, take off and land from real airports, fly missions, and explore in 200+ planes', tags: ['Simulation', 'Open World'] },
        { id: 'squadrons', name: 'Star Wars Squadrons', description: 'Space combat in iconic Star Wars starfighters (flight sim)', tags: ['Space', 'VR Ready'] },
        { id: 'ace-combat', name: 'Ace Combat 7', description: 'Dogfight other planes Top Gun style', tags: ['Action', 'Story'] },
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

    const openGame = (game: Game) => setSelectedGame(game);
    const closeGame = () => setSelectedGame(null);

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
                            Kartcade isn't just about sim racing—it's about celebrating every type of driving experience. We've curated a library that spans the full spectrum from arcade fun to hardcore simulation, including games you won't find at any other racing lounge.
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
            <div
                className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-all duration-300 ${selectedGame ? 'visible opacity-100' : 'invisible opacity-0'}`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    onClick={closeGame}
                ></div>

                {/* Modal Card */}
                <div
                    className={`relative w-full max-w-5xl h-[85vh] md:h-[600px] bg-[#141414] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col md:flex-row mt-16 md:mt-0 ${selectedGame ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeGame}
                        className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-[#D42428] p-2 rounded-full text-white transition-all backdrop-blur-md border border-white/10 group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>

                    {selectedGame && (
                        <>
                            {/* Video / Media Section */}
                            {/* Mobile: Absolute Background. Desktop: Right Side Block */}
                            <div className="absolute inset-0 md:relative md:w-[55%] md:order-2 bg-black h-full md:h-full">
                                {selectedGame.videoUrl ? (
                                    <video
                                        src={selectedGame.videoUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover opacity-60 md:opacity-90 transition-opacity"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 bg-zinc-900/50">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse backdrop-blur-sm">
                                            <Gamepad2 className="w-10 h-10 text-white/20" />
                                        </div>
                                        <p className="text-white/40 uppercase tracking-widest text-xs font-medium">Preview coming soon</p>
                                    </div>
                                )}

                                {/* Mobile Gradient Overlay for Text Readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent md:hidden"></div>
                                {/* Desktop Gradient Side Fade */}
                                <div className="absolute inset-0 bg-gradient-to-l from-[#141414] via-transparent to-transparent pointer-events-none hidden md:block"></div>
                            </div>

                            {/* Content Section */}
                            {/* Mobile: Bottom Overlay. Desktop: Left Side Block */}
                            <div className="relative z-10 mt-auto md:mt-0 w-full md:w-[45%] md:order-1 p-6 md:p-10 flex flex-col justify-end md:justify-between h-auto md:h-full overflow-y-auto custom-scrollbar">

                                <div className="mb-4 md:mb-0">
                                    <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                                        {selectedGame.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#2D9E49] bg-black/50 md:bg-[#2D9E49]/10 border border-[#2D9E49]/30 px-2 py-1 rounded-full backdrop-blur-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <h2 className="font-display text-4xl md:text-5xl font-bold uppercase text-white mb-2 md:mb-4 leading-none shadow-black drop-shadow-lg md:drop-shadow-none">
                                        {selectedGame.name}
                                    </h2>

                                    <p className="text-white/80 md:text-white/70 font-sans text-sm md:text-base leading-relaxed mb-6 md:mb-8 text-shadow-sm md:text-shadow-none max-w-md">
                                        {selectedGame.description}
                                    </p>

                                    <div className="space-y-3 mb-6 hidden md:block">
                                        <h3 className="font-display text-xs font-bold uppercase text-white/40 tracking-widest">Highlights</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-white/80 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2D9E49]"></div>
                                                High-Fidelity Graphics
                                            </div>
                                            <div className="flex items-center gap-3 text-white/80 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#D42428]"></div>
                                                Force Feedback Compatible
                                            </div>
                                            <div className="flex items-center gap-3 text-white/80 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                Pro-Level Physics
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 md:pt-8 md:border-t md:border-white/10">
                                    <Link
                                        to={`/book?notes=I want to play ${selectedGame.name}`}
                                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#D42428] hover:bg-[#B91C1C] text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all group shadow-lg shadow-red-900/30 backdrop-blur-sm"
                                    >
                                        Book This Experience <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <p className="text-center text-white/40 md:text-white/30 text-[10px] mt-3 uppercase tracking-wider">
                                        Reserve your rig to play {selectedGame.name}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExperiencesPage;
