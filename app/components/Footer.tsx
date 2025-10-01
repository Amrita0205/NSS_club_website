'use client'

import React from 'react';
import { Facebook, Instagram, Linkedin, Youtube, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-400' },
    { name: 'X', faIcon: faXTwitter, href: '#', color: 'hover:text-blue-300' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-500' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:text-red-400' }
  ];

  const quickLinks = [
    { name: 'IIIT Raichur', href: 'https://iiitr.ac.in/' },
    { name: 'PR Council', href: 'https://iiitr.ac.in/prcouncil' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-t border-gray-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left - Logo */}
          <div className="flex items-center justify-center md:justify-start">
            <div className="rounded-full bg-black p-1 mr-3 flex items-center justify-center" style={{width: 48, height: 48}}>
              <Image src="/images/logo_white.png" alt="NSS Logo White" width={40} height={40} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">IIIT Raichur</h3>
              <p className="text-gray-400 text-sm">National Service Scheme</p>
            </div>
          </div>

          {/* Center - Copyright */}
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 IIIT Raichur - All Rights Reserved.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              "Not me, but you"
            </p>
          </div>

          {/* Right - Links and Social */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-gray-400 text-sm font-medium">Quick Links:</span>
              <div className="flex space-x-4">
                {quickLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-1 hover:scale-105 transform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm font-medium">Follow Us:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`text-gray-400 ${social.color} transition-all duration-300 hover:scale-125 transform hover:rotate-12`}
                    aria-label={social.name}
                  >
                    {social.faIcon
                      ? <FontAwesomeIcon icon={social.faIcon} className="w-5 h-5" />
                      : social.icon && <social.icon className="w-5 h-5" />
                    }
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center"></div>
      </div>
    </footer>
  );
};

export default Footer;