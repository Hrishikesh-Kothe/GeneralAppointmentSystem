import * as React from "react";

// Simple utility function for classnames
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getButtonClasses(variant = 'default', size = 'default') {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500'
  };

  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 py-1.5 text-sm',
    lg: 'h-10 px-6 py-2.5 text-base',
    icon: 'h-9 w-9'
  };

  return `${baseClasses} ${variants[variant]} ${sizes[size]}`;
}

function Button({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}) {
  return (
    <button
      className={cn(getButtonClasses(variant, size), className)}
      {...props}
    />
  );
}

export { Button };