import React from 'react';

// Simple toast implementation
// In a real app, you'd use a library like sonner or react-hot-toast
export function toast(message, type = 'success') {
  // Create toast element
  const toastElement = document.createElement('div');
  toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white transition-opacity duration-300 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  toastElement.textContent = message;
  
  // Add to DOM
  document.body.appendChild(toastElement);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toastElement.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement);
      }
    }, 300);
  }, 3000);
}

toast.success = (message) => toast(message, 'success');
toast.error = (message) => toast(message, 'error');
toast.info = (message) => toast(message, 'info');