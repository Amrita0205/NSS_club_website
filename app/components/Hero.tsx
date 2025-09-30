'use client'

import React from 'react';
import { Heart, Users, Award, Target } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section id="home" className="pt-20 min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-3000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow delay-4000"></div>
      </div>

      {/* NSS Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative -mt-40">
          <Image
            src="/images/nss-inverted.png"
            alt="NSS Logo Center"
            width={340}
            height={340}
            className="mx-auto opacity-20"
            priority
          />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="mb-8 mt-96">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 transition-all duration-1000">
                NSS IIIT Raichur
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-purple-300 mb-8 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up">
              NOT ME BUT YOU
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;