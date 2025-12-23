import React from 'react';
import Hero from './Hero';
import BentoGrid from './BentoGrid';
import FeatureDetails from './FeatureDetails';
import CaseStudies from './CaseStudies';
import Link from 'next/link';
import { Navbar } from '../ui/navbar';

const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <BentoGrid />
      <FeatureDetails />
      <CaseStudies />
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">
             Ready to transform your <br/> due diligence process?
           </h2>
           <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
             Start analyzing documents with AI-powered insights. Get risk assessments in minutes, not weeks.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link href="/analyze" className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors">
               Start Analysis
             </Link>
             <Link href="/dashboard" className="bg-transparent border border-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:border-white transition-colors">
               View Dashboard
             </Link>
           </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
