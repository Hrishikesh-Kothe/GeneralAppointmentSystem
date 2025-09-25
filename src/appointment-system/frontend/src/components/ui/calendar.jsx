import React, { useState } from 'react';

// Simple utility function for classnames
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ChevronLeft Icon for navigation
function ChevronLeft(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

// ChevronRight Icon for navigation
function ChevronRight(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}


export function Calendar({ 
  mode = 'single', 
  selected, 
  onSelect, 
  className = '',
  ...props 
}) {
  // State to manage the currently displayed month and year
  const [displayDate, setDisplayDate] = useState(new Date());
  const today = new Date();

  const currentMonth = displayDate.getMonth();
  const currentYear = displayDate.getFullYear();

  // Handlers for month navigation
  const handlePrevMonth = () => {
    setDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Generate days for the currently displayed month
  const getDaysInMonth = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // Sunday-indexed (0)
    
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth, currentYear);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isSelected = (date) => {
    if (!selected || !date) return false;
    return date.toDateString() === selected.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className={cn('p-3 bg-white border rounded-lg', className)} {...props}>
      {/* Header with Navigation Buttons */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={handlePrevMonth} 
          className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button 
          onClick={handleNextMonth} 
          className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                type="button"
                onClick={() => onSelect && onSelect(date)}
                disabled={date < today && !isToday(date)} // Disable past dates
                className={cn(
                  'w-full h-full flex items-center justify-center text-sm rounded transition-colors',
                  'focus:outline-none focus:ring-1 focus:ring-blue-500',
                  isSelected(date) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-gray-100',
                  isToday(date) && !isSelected(date) && 'bg-blue-100 text-blue-600',
                  date < today && !isToday(date) && 'text-gray-400 cursor-not-allowed'
                )}
              >
                {date.getDate()}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
