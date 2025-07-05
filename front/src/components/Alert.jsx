import React from 'react';

const Alert = ({ message, type, duration }) => {
  let bgColorClass = '';
  let textColorClass = '';
  let progressBarColorClass = '';

  switch (type) {
    case 'success':
      bgColorClass = 'bg-green-100 border-green-400';
      textColorClass = 'text-green-700';
      progressBarColorClass = 'bg-green-500';
      break;
    case 'error':
      bgColorClass = 'bg-red-100 border-red-400';
      textColorClass = 'text-red-700';
      progressBarColorClass = 'bg-red-500';
      break;
    case 'info':
      bgColorClass = 'bg-blue-100 border-blue-400';
      textColorClass = 'text-blue-700';
      progressBarColorClass = 'bg-blue-500';
      break;
    case 'warning':
      bgColorClass = 'bg-yellow-100 border-yellow-400';
      textColorClass = 'text-yellow-700';
      progressBarColorClass = 'bg-yellow-500';
      break;
    default:
      bgColorClass = 'bg-gray-100 border-gray-400';
      textColorClass = 'text-gray-700';
      progressBarColorClass = 'bg-gray-500';
  }

  return (
    <div className={`border ${bgColorClass} ${textColorClass} px-4 py-3 rounded relative overflow-hidden`} role="alert">
      <span className="block sm:inline">{message}</span>
      {duration && (
        <div
          className={`absolute bottom-0 left-0 h-1 ${progressBarColorClass}`}
          style={{
            width: '100%',
            animation: `progressBar ${duration / 1000}s linear forwards`,
          }}
        ></div>
      )}
    </div>
  );
};

export default Alert;
