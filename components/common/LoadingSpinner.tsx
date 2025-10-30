
import React from 'react';

const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="animate-spin rounded-full border-4 border-solid border-indigo-500 border-t-transparent"
      ></div>
    </div>
  );
};

export default LoadingSpinner;
