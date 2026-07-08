import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';


const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-red-600 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;