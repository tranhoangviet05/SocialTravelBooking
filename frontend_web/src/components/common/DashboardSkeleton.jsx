import React from 'react';
import Skeleton from './Skeleton';

const DashboardSkeleton = () => {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width="250px" height="2rem" />
                    <Skeleton width="350px" height="1rem" />
                </div>
                <Skeleton width="150px" height="2.5rem" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton variant="circle" width="3rem" height="3rem" />
                            <Skeleton width="40px" height="1.5rem" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton width="60%" height="0.75rem" />
                            <Skeleton width="80%" height="1.5rem" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton width="200px" height="1.5rem" />
                        <Skeleton width="300px" height="1rem" />
                    </div>
                    <Skeleton width="180px" height="2rem" />
                </div>
                <Skeleton width="100%" height="350px" />
            </div>

            {/* Bottom Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton width="100%" height="400px" className="rounded-[2.5rem]" />
                </div>
                <div className="space-y-6">
                    <Skeleton width="100%" height="250px" className="rounded-3xl" />
                    <Skeleton width="100%" height="150px" className="rounded-3xl" />
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
