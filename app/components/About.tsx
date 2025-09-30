'use client'

import React from 'react';
import { BookOpen, Target } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* NSS Preamble */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-fade-in">About NSS</h2>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700 shadow-2xl hover:shadow-glow transition-all duration-500 group">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
              National Service Scheme is a social service program sponsored by the Indian Government that sprang from the belief of the Mahatma that the difference between what we do and what we are capable of doing would solve most of our problems.
            </p>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              IIIT Raichur has had its unit of NSS since 2019, the founding year of the institute.
            </p>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-8 rounded-full"></div>
        </div>

        {/* What We Do Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-fade-in">What We Do?</h2>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700 shadow-2xl hover:shadow-glow transition-all duration-500 group">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              NSS at IIIT Raichur is aimed at providing each student with a significant context in which he/she can reach a deeper understanding of social reality in India today. NSS encourages the meaning of life through service in today's changing world. The volunteers of this organization have the motto "Not Me, But You", which showcases the belief in selflessness and is reflected in their work to ensure everyone in need gets help. Activities include Vidyadaan, cloth donation, blood donation camps, and orphanage visits.
            </p>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Vision and Belief Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Our Vision Card */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-700/50 hover:border-blue-500 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-glow shadow-2xl group">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Our Vision</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              NSS at IIIT Raichur aims to provide each student with a significant context to reach a deeper understanding of social reality in India today. NSS encourages the meaning of life through service in today's changing world.
            </p>
          </div>

          {/* Our Belief Card */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-700/50 hover:border-purple-500 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-glow-purple shadow-2xl group">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Our Belief</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              The motto of NSS, "Not me, but you", is a showcase of the belief in selflessness. It reflects in the volunteers' work to ensure everyone in need gets help, making true the words that "we rise by uplifting others."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

<style jsx global>{`
.hover\:shadow-glow:hover {
  box-shadow: 0 0 32px 0 #3b82f6, 0 2px 4px 0 rgba(0,0,0,0.10);
}
`}</style>