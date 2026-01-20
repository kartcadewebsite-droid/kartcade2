import React, { useEffect } from 'react';

// Kartcade Homepage Components
import Hero from '../components/Hero';
import Intro from '../components/Intro';
import Services from '../components/Services';
import Process from '../components/Process';
import WhyChooseUs from '../components/WhyChooseUs';
import CTASection from '../components/CTASection';

const Home: React.FC = () => {
  useEffect(() => {
    document.title = "Kartcade | Racing & Flight Simulator Lounge | West Linn, Oregon";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Oregon\'s premier racing simulator lounge. 10 simulators, 40+ games. Race, fly, win. Birthday parties, corporate events, and walk-ins welcome. Book your session today!');
    }

    return () => {
      document.title = "Kartcade | Racing & Flight Simulator Lounge";
    };
  }, []);

  return (
    <div className="relative bg-[#0A0A0A]">
      {/* Hero Section */}
      <Hero />

      {/* Intro - Not Just Sim Racing */}
      <Intro />

      {/* Equipment Showcase */}
      <Services />

      {/* How It Works */}
      <Process />

      {/* Why Kartcade */}
      <WhyChooseUs />

      {/* Ready to Race CTA */}
      <CTASection />
    </div>
  );
};

export default Home;