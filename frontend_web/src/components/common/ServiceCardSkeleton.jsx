import React from 'react';
import Skeleton from './Skeleton';

const ServiceCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <Skeleton width="64px" height="64px" className="rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton width="40%" height="1.25rem" />
                    <div className="flex gap-2">
                        <Skeleton width="60px" height="1.25rem" className="rounded-lg" />
                        <Skeleton width="80px" height="1.25rem" className="rounded-lg" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton width="100px" height="0.75rem" />
                        <Skeleton width="80px" height="0.75rem" />
                    </div>
                </div>
            </div>
            <div className="text-right space-y-2">
                <Skeleton width="100px" height="1.5rem" className="ml-auto" />
                <Skeleton width="60px" height="0.75rem" className="ml-auto" />
            </div>
        </div>
    );
};

export default ServiceCardSkeleton;
