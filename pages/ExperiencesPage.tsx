import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Plane, Settings } from 'lucide-react';

// Game data organized by category
const racingGames = {
    ultraRealistic: [
        { name: 'iRacing', description: 'What the pros use to train. This sim on our motion rig is the best that it gets' },
        { name: 'Assetto Corsa', description: 'Any car or track, compete against your friends, plus custom-designed elements for you to explore' },
        { name: 'Automobilista 2', description: 'Global tracks with a wide array of car choices, ranging from go karts to hypercars' },
        { name: 'Le Mans Ultimate', description: 'The official Le Mans endurance racing sim with laser-scanned tracks' },
        { name: 'Assetto Corsa Rally', description: "Just released to wide acclaim! We have this installed on the motion rig and one adult rig and it's a blast" },
        { name: 'Dirt Rally 2.0', description: 'Punishing, realistic rally racing across gravel, tarmac, and snow' },
        { name: 'WRC', description: 'Rally racing in an easier-to-handle format with amazing graphics' },
        { name: 'Richard Burns Rally', description: "The hardest of the hardcore rally simulators - loved by the pro's and purists" },
    ],
    competitive: [
        { name: 'Grid Legends', description: 'Arcade-meets-sim racing with intense wheel-to-wheel action' },
        { name: 'CarX Drift Online', description: 'Master the art of drifting with realistic physics and multiplayer competition' },
    ],
    arcadeFun: [
        { name: 'Wreckfest (1 & 2)', description: 'Full-contact racing with destruction derby chaos' },
        { name: 'Deathsprint 66', description: 'High-speed futuristic racing with violent obstacles' },
        { name: 'BeamNG', description: 'Realistic crash physics and open-world exploration' },
        { name: 'American Truck Simulator', description: 'Relax with cross-country trucking across the American West' },
    ],
};

const flightGames = {
    simulation: [
        { name: 'Microsoft Flight Simulator', description: 'Fly the world, take off and land from real airports, fly missions, and explore in 200+ planes' },
        { name: 'Star Wars Squadrons', description: 'Space combat in iconic Star Wars starfighters (flight sim)' },
        { name: 'Ace Combat 7', description: 'Dogfight other planes Top Gun style' },
        { name: 'Digital Combat Simulator', description: 'Fly real historic missions with real objectives' },
    ],
    arcade: [
        { name: 'Fly Dangerous', description: 'Cruise around in space in zero gravity' },
        { name: 'Jetborne Racing', description: 'Hone your flight skills in tunnels against other flight racers' },
        { name: 'War Thunder', description: 'WW1 style planes, tanks, and ships' },
    ],
};

interface GameCardProps {
    name: string;
    description: string;
}

const GameCard: React.FC<GameCardProps> = ({ name, description }) => (
    <div className="group bg-[#141414] hover:bg-[#1a1a1a] rounded-lg md:rounded-xl p-4 md:p-5 border border-white/10 hover:border-[#2D9E49]/30 transition-all duration-300">
        <h4 className="font-display text-sm md:text-lg font-bold uppercase text-white mb-1 md:mb-2 group-hover:text-[#2D9E49] transition-colors">{name}</h4>
        <p className="text-white/60 font-sans text-xs md:text-sm leading-relaxed">{description}</p>
    </div>
);

const ExperiencesPage: React.FC = () => {
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
                                <GameCard key={game.name} {...game} />
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
                                <GameCard key={game.name} {...game} />
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
                                <GameCard key={game.name} {...game} />
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
                                <GameCard key={game.name} {...game} />
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
                                <GameCard key={game.name} {...game} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Wheel Integration */}
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
                </div>
            </section>

            {/* CTA Section - Matching Homepage */}
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
        </div>
    );
};

export default ExperiencesPage;
