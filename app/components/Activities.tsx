'use client'

import React from 'react';
import { BookOpen, Shirt, Droplets, Heart } from 'lucide-react';

const Activities = () => {
  const activities = [
    {
      title: 'Vidyadaan',
      description: 'Educational support and knowledge sharing programs for underprivileged communities',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-900/30 to-cyan-900/30',
      borderColor: 'border-blue-700/50 hover:border-blue-500',
      glowColor: 'hover:shadow-glow'
    },
    {
      title: 'Cloth Donation',
      description: 'Collecting and distributing clothing to those in need during winter seasons',
      icon: Shirt,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-900/30 to-emerald-900/30',
      borderColor: 'border-green-700/50 hover:border-green-500',
      glowColor: 'hover:shadow-green-glow'
    },
    {
      title: 'Blood Donation Camps',
      description: 'Organizing blood donation drives to support local hospitals and emergency needs',
      icon: Droplets,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-900/30 to-pink-900/30',
      borderColor: 'border-red-700/50 hover:border-red-500',
      glowColor: 'hover:shadow-glow-pink'
    },
    {
      title: 'Orphanage Visits',
      description: 'Regular visits to orphanages with activities, gifts, and emotional support',
      icon: Heart,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-900/30 to-violet-900/30',
      borderColor: 'border-purple-700/50 hover:border-purple-500',
      glowColor: 'hover:shadow-glow-purple'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">Our Activities</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We engage in various social service activities that make a meaningful impact in our community
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {activities.map((activity, index) => (
            <div
              key={activity.title}
              className={`bg-gradient-to-br ${activity.bgColor} backdrop-blur-sm rounded-2xl p-6 border ${activity.borderColor} transition-all duration-500 hover:transform hover:scale-105 hover:rotate-1 shadow-2xl ${activity.glowColor} group animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${activity.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-lg`}>
                  <activity.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{activity.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Activities;