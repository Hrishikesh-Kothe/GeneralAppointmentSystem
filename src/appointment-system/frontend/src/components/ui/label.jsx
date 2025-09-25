import React from 'react';

// Simple utility function for classnames
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Label({ className = '', ...props }) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
}