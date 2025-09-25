import React, { createContext, useContext, useState } from 'react';

// Simple utility function for classnames
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SelectContext = createContext();

export function Select({ value, onValueChange, children, ...props }) {
  const [open, setOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = '', id, ...props }) {
  const { setOpen, open } = useContext(SelectContext);
  
  return (
    <button
      id={id}
      type="button"
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder = 'Select...' }) {
  const { value } = useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

export function SelectContent({ children, className = '' }) {
  const { open, setOpen } = useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setOpen(false)}
      />
      <div className={cn(
        'absolute top-full left-0 z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg',
        className
      )}>
        {children}
      </div>
    </>
  );
}

export function SelectItem({ value, children, className = '' }) {
  const { onValueChange, setOpen } = useContext(SelectContext);
  
  return (
    <button
      type="button"
      className={cn(
        'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
        className
      )}
      onClick={() => {
        onValueChange && onValueChange(value);
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}