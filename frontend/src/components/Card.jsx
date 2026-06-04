import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`glass-card p-4 sm:p-5 bg-white dark:bg-darkCard rounded-xl border border-gray-150 dark:border-gray-855/50 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
