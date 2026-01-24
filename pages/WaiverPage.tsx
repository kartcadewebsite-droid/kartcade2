import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, FileText } from 'lucide-react';

const WaiverPage: React.FC = () => {
    return (
        <div className="relative bg-[#0A0A0A]">
            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-10 md:pb-16 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-10">
                    <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
                    <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
                </div>
                <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
                    <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-xs md:text-sm mb-4 md:mb-6 block text-center">
                        Legal Agreement
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-bold uppercase leading-none text-center text-white mb-4 md:mb-6">
                        Waiver of<br />
                        <span className="text-[#D42428]">Liability</span>
                    </h1>
                    <p className="font-sans text-sm md:text-lg text-white/60 max-w-2xl mx-auto text-center leading-relaxed px-4">
                        Kartcade WL, LLC Waiver and Indemnification Agreement
                    </p>
                </div>
            </section>

            {/* Main Waiver Content */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-4xl">
                    <div className="bg-[#141414] rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-10 border border-white/10 space-y-5 md:space-y-8">

                        {/* Introduction */}
                        <div>
                            <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">
                                I, on behalf of myself and all individuals named herein (collectively hereinafter the "Guest or Guests"), confirm that I and all individuals named herein have reviewed this Waiver and Indemnification Agreement (included with the Release of Liability hereinafter referred to as the "Waiver") and that all Guest named herein understand, acknowledge and agree to be bound by the Terms and Conditions of the Waiver. If you are signing on behalf of another person, you are acknowledging and representing that you are the parent or legal guardian of such individual. <strong className="text-white">All persons under the age of 18, must have a parent or legal guardian sign this form on their behalf.</strong>
                            </p>
                        </div>

                        {/* Risk Acknowledgment */}
                        <div className="bg-[#D42428]/10 border border-[#D42428]/20 rounded-lg md:rounded-xl p-4 md:p-6">
                            <p className="text-white/80 font-sans text-sm md:text-base leading-relaxed">
                                Each Guest in acceptance of the agreement, acknowledges that the use of simulators, gaming machines and consoles may pose certain risk of serious injury that are inherent in these types of devices and equipment. The Guests named herein, agree to hold the Owners, Officers, Employees and Agents of Kartcade WL, LLC (collectively hereinafter "Kartcade") harmless against such injuries. The Guest acknowledges that they have been made aware of the threat of physical and mental injury could occur and have elected to utilize the simulators and games contained in the Simulator Studio.
                            </p>
                        </div>

                        {/* Guest Certification */}
                        <div>
                            <h2 className="font-display text-base md:text-xl font-bold uppercase text-white mb-3 md:mb-4">Guest Certification</h2>
                            <p className="text-white/70 font-sans text-sm md:text-base mb-3 md:mb-4 leading-relaxed">
                                By accepting the agreement, I acknowledge and confirm, on behalf of myself and all individuals named herein, on whose behalf I am actually authorized to execute this document, that I and all individuals named herein have read or have had explained to them the above statement, and understand and agree to abide by the Safety Rules of this facility.
                            </p>
                            <p className="text-white/70 font-sans text-sm md:text-base mb-2 md:mb-4">Guest certifies that, I and all individuals named herein:</p>
                            <ol className="list-decimal list-inside space-y-2 md:space-y-3 text-white/70 font-sans text-sm md:text-base pl-2 md:pl-4">
                                <li>Have no physical or mental limitations or conditions, including pregnancy, that would prohibit or impair participation in these activities</li>
                                <li>Am/are not intoxicated or taking any prescription or non-prescription drugs that would prohibit or impair participation</li>
                                <li>Understand and will abide by all rules established by Kartcade</li>
                                <li>Acknowledge and understand that, outside of the verbal instructions, Kartcade does NOT provide guidance or instruction for how to use or participate in the simulators</li>
                            </ol>
                        </div>

                        {/* Release of Liability */}
                        <div className="border-t border-white/10 pt-5 md:pt-8">
                            <h2 className="font-display text-lg md:text-2xl font-bold uppercase text-[#D42428] mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
                                <FileText className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                                Release of Liability
                            </h2>
                            <p className="text-[10px] md:text-xs font-mono text-white/40 uppercase tracking-widest mb-3 md:mb-4">Please Read Carefully Before Signing</p>
                            <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">
                                Despite all known and unknown risks, including but not limited to, serious bodily injury, permanent disability, paralysis, and death, that may be sustained while on the PREMISES, I, on behalf of myself, and all individuals named herein, including minor children, and their respective wards, heirs, assigns, personal representatives, and estates, if any (collectively, the "Guest or Guests") hereby expressly, unconditionally, and voluntarily agree to release, relinquish, waive, hold harmless, forever discharge, and covenant not to sue Kartcade and its agents, owners, parent company, subsidiaries, affiliated facilities, franchisors, officers, directors, principals, volunteers, employees, independent contractors, insurers, facility operators, land and/or premises owners ("Landlord").
                            </p>
                        </div>

                        {/* Notice to Minor's Guardian */}
                        <div className="bg-[#D42428]/20 border border-[#D42428]/40 rounded-lg md:rounded-xl p-4 md:p-6">
                            <h3 className="font-display text-sm md:text-lg font-bold uppercase text-[#D42428] mb-2 md:mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                <span>Notice to the Minor Child's Natural Guardian</span>
                            </h3>
                            <p className="text-white/80 font-sans text-xs md:text-sm leading-relaxed">
                                READ THIS FORM COMPLETELY AND CAREFULLY. YOU ARE AGREEING TO LET YOUR MINOR CHILD ENGAGE IN A POTENTIALLY DANGEROUS ACTIVITY. YOU ARE AGREEING THAT, EVEN IF KARTCADE USES REASONABLE CARE IN PROVIDING THIS ACTIVITY, THERE IS A CHANCE YOUR CHILD MAY BE SERIOUSLY INJURED OR KILLED BY PARTICIPATING IN THIS ACTIVITY BECAUSE THERE ARE CERTAIN DANGERS INHERENT IN THE ACTIVITY WHICH CANNOT BE AVOIDED OR ELIMINATED. BY SIGNING THIS FORM YOU ARE GIVING UP YOUR CHILD'S RIGHT AND YOUR RIGHT TO RECOVER FROM RELEASEES IN A LAWSUIT FOR ANY PERSONAL INJURY, INCLUDING DEATH, TO YOUR CHILD OR ANY PROPERTY DAMAGE THAT RESULTS FROM THE RISKS THAT ARE A NATURAL PART OF THE ACTIVITY. YOU HAVE THE RIGHT TO REFUSE TO SIGN THIS FORM, AND KARTCADE HAS THE RIGHT TO REFUSE TO LET YOUR CHILD PARTICIPATE IF YOU DO NOT SIGN THIS FORM.
                            </p>
                        </div>

                        {/* Property Liability */}
                        <div>
                            <h3 className="font-display text-sm md:text-lg font-bold uppercase text-white mb-2 md:mb-3">Liability for Property</h3>
                            <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">
                                The Guest agrees that Kartcade is not liable for any personal property that is damaged, lost, or stolen while on or about the premises, including, but not limited to, a vehicle or its contents, or any property in a locker, whether or not Kartcade was negligent.
                            </p>
                        </div>

                        {/* Photography Release */}
                        <div>
                            <h3 className="font-display text-sm md:text-lg font-bold uppercase text-white mb-2 md:mb-3">Photography/Video Release</h3>
                            <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">
                                By entering these premises, the Guest acknowledges that the Guest and all individuals named herein, including minor children, hereby grant to Kartcade the irrevocable right and permission to photograph and/or record video of the Guest and to use all such photographs and/or recordings for any lawful purpose, including, without limitation, for advertising and promotional purposes. The Guest acknowledges and agrees that the rights granted by this release are without compensation of any kind.
                            </p>
                        </div>

                        {/* Terms of Agreement */}
                        <div>
                            <h3 className="font-display text-sm md:text-lg font-bold uppercase text-white mb-2 md:mb-3">Terms of Agreement and Severability</h3>
                            <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed">
                                The Guest understands that this Waiver extends forever into the future and will have full force and legal effect each and every time any of the Guests visit the premises, whether at the current location or any other Kartcade location or facility.
                            </p>
                        </div>

                        {/* Arbitration */}
                        <div className="bg-[#0d0d0d] border border-white/10 rounded-lg md:rounded-xl p-4 md:p-6">
                            <h3 className="font-display text-sm md:text-lg font-bold uppercase text-white mb-2 md:mb-3">Arbitration and Venue</h3>
                            <p className="text-white/50 font-sans text-xs md:text-sm leading-relaxed">
                                Any and all disputes or claims arising out of or relating to this Agreement, a breach thereof, the premises, facilities, activities, property damage (real or personal), personal injury (including death), or the scope, interpretation, arbitrability, or validity of this Waiver, including this arbitration clause, shall be brought by the parties only in their individual capacity and not as a plaintiff or class member in any purported class or representative capacity, and settled and finally resolved exclusively by binding, confidential, and private arbitration before a single arbitrator administered by JAMS pursuant to the JAMS Comprehensive Arbitration Rules and Procedures. This Waiver shall be governed by the laws of the State of Oregon.
                            </p>
                        </div>

                        {/* Signing Acknowledgment */}
                        <div className="border-t border-white/10 pt-5 md:pt-8">
                            <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                                By signing this Waiver, whether in paper or electronic format, I certify that I had a reasonable and sufficient opportunity to read and understand this entire Waiver and consult with legal counsel, or have voluntarily waived the right to do so; that I am actually authorized to sign this Waiver on behalf of all individuals named herein.
                            </p>
                        </div>

                        {/* Legal Rights */}
                        <div className="bg-[#2D9E49]/10 border border-[#2D9E49]/20 rounded-lg md:rounded-xl p-4 md:p-6">
                            <h3 className="font-display text-sm md:text-lg font-bold uppercase text-[#2D9E49] mb-2 md:mb-3">Legal Rights</h3>
                            <p className="text-white/80 font-sans text-sm md:text-base leading-relaxed">
                                By signing this Waiver, I understand that I am waiving certain rights for myself and the minors named herein, including the right to pursue any legal action or claim.
                            </p>
                        </div>

                        {/* Authorization */}
                        <div>
                            <h3 className="font-display text-sm md:text-lg font-bold uppercase text-white mb-2 md:mb-3">Authorization to Sign</h3>
                            <p className="text-white/60 font-sans text-xs md:text-sm leading-relaxed">
                                By signing this Waiver, I represent, under penalty of perjury, that I have the legal authority to sign this Waiver on behalf of all individuals named herein, and I am authorized to waive any rights held by those individuals to pursue a claim or legal action against Kartcade for any injury, including paralysis or death, caused in whole or in part by the negligence or fault of Kartcade, including any of its owners, affiliates, agents, employees, insurers, vendors, and suppliers. I acknowledge and understand that Kartcade is relying upon this representation before allowing participants to enter and use this facility.
                            </p>
                        </div>
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
                        Questions?
                    </span>

                    <h2 className="font-display text-3xl md:text-5xl lg:text-7xl font-bold uppercase leading-none mb-4 md:mb-8">
                        Ready to<br />
                        <span className="text-[#D42428]">Race?</span>
                    </h2>

                    <p className="font-sans text-sm md:text-xl text-white/60 max-w-2xl mb-8 md:mb-16 leading-relaxed px-4">
                        Feel free to contact us if you have any questions about the waiver or our safety policies.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
                        <Link
                            to="/book"
                            className="group relative bg-[#D42428] text-white px-8 md:px-12 py-4 md:py-6 rounded-full font-display uppercase tracking-widest font-bold text-sm md:text-base overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#D42428]/30 text-center"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Book Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            to="/rules"
                            className="px-8 md:px-12 py-4 md:py-6 rounded-full border border-white/20 font-display uppercase tracking-widest font-bold text-sm md:text-base hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            View Rules
                        </Link>

                        <Link
                            to="/contact"
                            className="px-8 md:px-12 py-4 md:py-6 rounded-full border border-[#2D9E49]/30 text-[#2D9E49] font-display uppercase tracking-widest font-bold text-sm md:text-base hover:bg-[#2D9E49]/10 transition-colors flex items-center justify-center gap-2"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WaiverPage;
