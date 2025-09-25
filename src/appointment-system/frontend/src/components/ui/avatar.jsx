import React from 'react';

export function Avatar({ children, className = '' }) {
  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = '', className = '' }) {
  if (!src) return null;
  
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  );
}

export function AvatarFallback({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 font-medium ${className}`}>
      {children}
    </div>
  );
}