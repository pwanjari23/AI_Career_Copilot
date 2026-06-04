import React from 'react';

const Skeleton = ({ variant = 'text', width = 'w-full', height = 'h-4', className = '' }) => {
  const baseStyle = 'animate-pulse bg-gray-200 dark:bg-gray-800';
  
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-2xl',
  };

  const finalHeight = variant === 'circular' ? width : height;

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${width} ${finalHeight} ${className}`}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-5 bg-white dark:bg-darkCard rounded-2xl border border-gray-200/50 dark:border-gray-800/50 space-y-3">
            <Skeleton variant="text" width="w-24" height="h-3" />
            <Skeleton variant="text" width="w-12" height="h-7" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-white dark:bg-darkCard rounded-2xl md:col-span-2 space-y-4">
          <Skeleton variant="text" width="w-36" height="h-4" />
          <Skeleton variant="rectangular" width="w-full" height="h-64" />
        </div>
        <div className="glass-card p-6 bg-white dark:bg-darkCard rounded-2xl space-y-4">
          <Skeleton variant="text" width="w-36" height="h-4" />
          <Skeleton variant="rectangular" width="w-full" height="h-64" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
