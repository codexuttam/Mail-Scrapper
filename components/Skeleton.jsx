import React from 'react';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
};

export const LeadSkeleton = () => (
  <div className="glass-card mb-4 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-transparent">
    <div className="flex items-start gap-4 flex-1">
      <Skeleton className="w-5 h-5 rounded-lg mt-1.5" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-1/3 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <Skeleton className="h-3 w-full rounded-md" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 self-end md:self-center">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <Skeleton className="w-10 h-10 rounded-lg" />
      <Skeleton className="w-10 h-10 rounded-lg" />
    </div>
  </div>
);

export const ResultSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 mb-4 p-5 flex flex-col lg:flex-row justify-between gap-5 animate-pulse">
    <div className="flex-1 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
      </div>
      <div className="flex gap-6">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-md" />
      </div>
    </div>
    <div className="flex lg:flex-col gap-3 shrink-0 pt-4 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-slate-100">
      <Skeleton className="h-11 w-36 rounded-xl" />
      <Skeleton className="h-11 w-36 rounded-xl" />
    </div>
  </div>
);
