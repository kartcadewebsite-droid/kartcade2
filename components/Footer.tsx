import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Gift } from 'lucide-react';
import siteConfig from '../config/site';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] text-white relative z-50 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">

        <div className="flex flex-col gap-10 md:gap-12">

          {/* Top - Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Kartcade" className="h-8 md:h-10 w-auto" />
            </Link>
            <p className="text-white/40 text-sm max-w-xs mb-4">
              Oregon's premier racing simulator lounge. Experience racing, drifting, flying, and more.
            </p>
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-[#2D9E49] transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" /> West Linn, Oregon
            </a>
          </div>

          {/* Links Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Navigate */}
            <div>
              <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider mb-3 md:mb-4">Navigate</p>
              <div className="space-y-2 md:space-y-3">
                <Link to="/" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Home</Link>
                <Link to="/about" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">About</Link>
                <Link to="/events" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Events</Link>
                <Link to="/pricing" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Pricing</Link>
                <Link to="/equipment" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Equipment</Link>
                <Link to="/faq" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">FAQ</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider mb-3 md:mb-4">Contact</p>
              <div className="space-y-2 md:space-y-3">
                <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 text-white/70 hover:text-[#2D9E49] text-sm transition-colors">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="break-all">{siteConfig.phone}</span>
                </a>
                <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-white/70 hover:text-[#2D9E49] text-sm transition-colors">
                  <Mail className="w-3 h-3 flex-shrink-0" /> Email us
                </a>
                <Link to="/contact" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Contact</Link>
                <Link to="/book" className="block text-white/70 hover:text-[#D42428] text-sm transition-colors font-medium">Book Now</Link>
              </div>
            </div>

            {/* Extras - Hidden on very small, shown from sm+ */}
            <div className="col-span-2 sm:col-span-1">
              <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider mb-3 md:mb-4">Extras</p>
              <div className="space-y-2 md:space-y-3">
                <a
                  href={siteConfig.giftCardsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#2D9E49] hover:text-[#2D9E49]/80 text-sm transition-colors"
                >
                  <Gift className="w-3 h-3" /> Gift Cards
                </a>
                <Link to="/rules" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Rules</Link>
                <Link to="/waiver" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Waiver</Link>
                <Link to="/experiences" className="block text-white/70 hover:text-[#2D9E49] text-sm transition-colors">Games</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-widest">
            <p>© {currentYear} Kartcade</p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2D9E49]"></span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D42428]"></span>
              West Linn, Oregon
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;