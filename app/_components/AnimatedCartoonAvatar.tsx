"use client"
import React, { useEffect, useState } from 'react';

interface AnimatedCartoonAvatarProps {
  photoURL?: string;
  displayName?: string;
  className?: string;
}

export default function AnimatedCartoonAvatar({
  photoURL,
  displayName = 'User',
  className = 'w-[35px] h-[35px]'
}: AnimatedCartoonAvatarProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Get initials from displayName
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(displayName);

  // Get a color based on the initials
  const getColorFromInitials = (initials: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-cyan-400 to-cyan-600',
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const gradientClass = getColorFromInitials(initials);

  // If user has a photo, show it
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={displayName}
        className={`${className} rounded-full object-cover border-2 border-white shadow-lg`}
      />
    );
  }

  // Cartoon avatar with animation
  return (
    <div
      className={`${className} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center cursor-pointer shadow-lg transition-transform duration-300 hover:scale-110`}
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
    >
      {/* Cartoon face container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Main face circle */}
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <circle cx="50" cy="50" r="45" fill="white" opacity="0.95" />

          {/* Eyes */}
          <circle cx="35" cy="40" r="6" fill="#333" />
          <circle cx="65" cy="40" r="6" fill="#333" />

          {/* Eye shine/reflection */}
          <circle cx="36" cy="38" r="2" fill="white" />
          <circle cx="66" cy="38" r="2" fill="white" />

          {/* Eyebrows */}
          <path d="M 28 28 Q 35 25 42 28" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 58 28 Q 65 25 72 28" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Smile/Mouth */}
          <path
            d={isAnimating ? "M 40 60 Q 50 70 60 60" : "M 40 62 Q 50 68 60 62"}
            stroke="#333"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Nose */}
          <line x1="50" y1="48" x2="50" y2="57" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />

          {/* Cheeks */}
          <circle cx="22" cy="50" r="4" fill="rgba(255, 100, 100, 0.3)" />
          <circle cx="78" cy="50" r="4" fill="rgba(255, 100, 100, 0.3)" />
        </svg>

        {/* Initials text fallback */}
        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-white opacity-0 pointer-events-none">
          {initials}
        </div>
      </div>

      {/* Animation - bouncy effect on hover */}
      {isAnimating && (
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .animate-bounce-custom {
            animation: bounce 0.6s infinite;
          }
        `}</style>
      )}
    </div>
  );
}
