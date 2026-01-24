import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const RulesPage: React.FC = () => {
    return (
        <div className="relative bg-[#0A0A0A]">
            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
                </div>
                <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
                    <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-xs md:text-sm mb-4 md:mb-6 block text-center">
                        Safety First
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-bold uppercase leading-none text-center text-white mb-4 md:mb-6">
                        Rules &<br />
                        <span className="text-[#D42428]">Guidelines</span>
                    </h1>
                    <p className="font-sans text-base md:text-xl text-white/60 max-w-2xl mx-auto text-center leading-relaxed px-4">
                        Please review our safety guidelines and etiquette rules to ensure everyone has an amazing experience.
                    </p>
                </div>
            </section>

            {/* General Safety Section */}
            <section className="py-8 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-4xl">
                    <div className="bg-[#141414] rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-12 border border-white/10 mb-6 md:mb-8">
                        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-8">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-[#D42428]/20 border border-[#D42428]/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 md:w-7 md:h-7 text-[#D42428]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold uppercase text-white">General Safety</h2>
                        </div>

                        <div className="space-y-4 md:space-y-6 text-white/70 font-sans text-sm md:text-base leading-relaxed">
                            <p>
                                Racing Simulators are much safer than real race cars and karts, but there is still a possibility for injury. Getting in and out of the rigs can be difficult, and due to the force feedback of the wheels, a crash can send the wheel spinning if you're gripping it loosely. <strong className="text-white">If the wheel begins to spin uncontrollably, keep your hands up and wait for it to stop before trying to re-grip the wheel.</strong>
                            </p>

                            <p>
                                The seat motion-enabled rig moves the driver's body around during a race. <strong className="text-white">Do not attempt to get out of the seat while the car is in motion.</strong> Keep the seat far enough away from the pedals so that your knees have enough room under the wheel so that they are not pushed into the wheel support brace during heavy braking (when the seat moves forward).
                            </p>

                            <p>
                                Getting into the lower rigs and the flight sim is difficult, but please only grab onto the seat and metal frame when entering and exiting the seat. <strong className="text-white">Do not grab onto the controls or the steering wheels, as they may become damaged with enough weight applied.</strong>
                            </p>
                        </div>
                    </div>

                    {/* General Etiquette Section */}
                    <div className="bg-[#141414] rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-12 border border-white/10">
                        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-8">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-[#2D9E49]/20 border border-[#2D9E49]/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 md:w-7 md:h-7 text-[#2D9E49]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold uppercase text-white">General Etiquette</h2>
                        </div>

                        <ul className="space-y-4 md:space-y-5">
                            <li className="flex items-start gap-3 md:gap-4">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#2D9E49] mt-2 flex-shrink-0" />
                                <p className="text-white/70 font-sans text-sm md:text-base">
                                    <strong className="text-white">Sportsmanship is paramount.</strong> Do not enter heated arguments with other drivers, but yelling after a crash or being passed is fine.
                                </p>
                            </li>

                            <li className="flex items-start gap-3 md:gap-4">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#2D9E49] mt-2 flex-shrink-0" />
                                <p className="text-white/70 font-sans text-sm md:text-base">
                                    <strong className="text-white">Vulgarity and cursing is encouraged</strong>, so long as there are no kids present and it's not directed at another driver in the shop.
                                </p>
                            </li>

                            <li className="flex items-start gap-3 md:gap-4">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#2D9E49] mt-2 flex-shrink-0" />
                                <p className="text-white/70 font-sans text-sm md:text-base">
                                    <strong className="text-white">Do not wear dirty shoes</strong> or muddy/grass covered clothes into the racing machines.
                                </p>
                            </li>

                            <li className="flex items-start gap-3 md:gap-4">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#2D9E49] mt-2 flex-shrink-0" />
                                <p className="text-white/70 font-sans text-sm md:text-base">
                                    <strong className="text-white">Keep drinks away from the rigs</strong>, and on the tables and in common areas only.
                                </p>
                            </li>

                            <li className="flex items-start gap-3 md:gap-4 bg-[#D42428]/10 border border-[#D42428]/20 rounded-lg md:rounded-xl p-3 md:p-4 -mx-3 md:-mx-4">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#D42428] mt-2 flex-shrink-0" />
                                <p className="text-white/80 font-sans text-sm md:text-base">
                                    <strong className="text-white">Anger and aggression that is taken out on the machines</strong>, including breaking equipment during a rage quit, will not be tolerated. You will be charged to replace the damaged equipment and your membership may be revoked.
                                </p>
                            </li>
                        </ul>
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
                        Let's Race
                    </span>

                    <h2 className="font-display text-3xl md:text-5xl lg:text-8xl font-bold uppercase leading-none mb-6 md:mb-12">
                        Ready to<br />
                        <span className="text-[#D42428]">Race?</span>
                    </h2>

                    <p className="font-sans text-base md:text-xl text-white/60 max-w-2xl mb-8 md:mb-16 leading-relaxed px-4">
                        Book your session today and experience Oregon's premier racing simulator lounge.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
                        <Link
                            to="/book"
                            className="group relative bg-[#D42428] text-white px-8 md:px-12 py-4 md:py-6 rounded-full font-display uppercase tracking-widest font-bold text-sm md:text-base overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#D42428]/30 text-center"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Book Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            to="/waiver"
                            className="px-8 md:px-12 py-4 md:py-6 rounded-full border border-white/20 font-display uppercase tracking-widest font-bold text-sm md:text-base hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            View Waiver
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default RulesPage;
