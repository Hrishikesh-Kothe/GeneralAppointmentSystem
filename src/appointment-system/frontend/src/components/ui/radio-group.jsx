import React, { createContext, useContext } from 'react';

// Simple utility function for classnames
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const RadioGroupContext = createContext();

export function RadioGroup({ value, onValueChange, children, className = '', ...props }) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn('grid gap-2', className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ value, id, className = '', ...props }) {
  const { value: groupValue, onValueChange } = useContext(RadioGroupContext);
  const isChecked = groupValue === value;

  return (
    <input
      type="radio"
      id={id}
      checked={isChecked}
      onChange={() => onValueChange && onValueChange(value)}
      className={cn(
        'h-4 w-4 rounded-full border border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2',
        className
      )}
      {...props}
    />
  );
}