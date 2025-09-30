'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';

const EventSlider = () => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const events = [
    {
      id: 1,
      title: 'NSS Cleaning Drive 1',
      description: 'Environmental conservation initiative to plant trees and promote green campus',
      image: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 2,
      title: 'NSS Cleaning Drive 2',
      description: 'Community cleaning initiative to maintain campus hygiene and cleanliness',
      image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 3,
      title: 'Orphanage Visit',
      description: 'Spreading joy and sharing moments with children at local orphanages',
      image: 'https://images.pexels.com/photos/6647019/pexels-photo-6647019.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 4,
      title: 'Blood Donation Camp',
      description: 'Life-saving blood donation drive for the community and emergency needs',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 5,
      title: 'Tree Plantation Drive',
      description: 'Environmental conservation initiative to plant trees and promote green campus',
      image: 'https://images.pexels.com/photos/6823567/pexels-photo-6823567.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 6,
      title: 'Educational Workshop',
      description: 'Knowledge sharing sessions and skill development programs for students',
      image: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 7,
      title: 'Community Outreach',
      description: 'Reaching out to local communities with support and assistance',
      image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 8,
      title: 'Health Awareness',
      description: 'Promoting health awareness and wellness in the community',
      image: 'https://images.pexels.com/photos/6647019/pexels-photo-6647019.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const openLightbox = (event: any) => {
    setLightboxImage(event);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImage(null);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="events" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Gallery</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Capturing moments of service, community engagement, and positive impact
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Scrolling Container */}
          <div className="relative overflow-hidden">
            {/* Navigation Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Scrollable Images Container */}
            <div
              ref={scrollContainerRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide py-8 px-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex-shrink-0 w-80 h-48 relative cursor-pointer group rounded-2xl overflow-hidden shadow-2xl"
                  onClick={() => openLightbox(event)}
                >
                  {/* Blurred Image */}
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover filter blur-sm group-hover:blur-none transition-all duration-500 group-hover:scale-110"
                  />
                  
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                      {event.title}
                    </h3>
                      <div className="w-12 h-0.5 bg-white/60 mx-auto mb-3"></div>
                      <p className="text-white/90 text-sm drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="mt-12">
            <div className="flex justify-center space-x-2 overflow-x-auto pb-4">
              {events.map((event, index) => (
                <div
                  key={`thumb-${event.id}`}
                  className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden cursor-pointer opacity-40 hover:opacity-100 transition-all duration-200 border-2 border-transparent hover:border-white/30"
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTo({
                        left: index * 344,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover filter blur-sm hover:blur-none transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {isLightboxOpen && lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative max-w-5xl max-h-full">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 z-10 backdrop-blur-sm border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={lightboxImage.image}
                alt={lightboxImage.title}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 rounded-b-2xl">
                <h3 className="text-3xl font-bold text-white mb-3">{lightboxImage.title}</h3>
                <p className="text-gray-200 text-lg">{lightboxImage.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default EventSlider;