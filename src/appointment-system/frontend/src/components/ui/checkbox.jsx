import React from 'react';

export function Checkbox({ id, checked, onCheckedChange, className = '', ...props }) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={`h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${className}`}
      {...props}
    />
  );
}