import React from 'react';
import Skeleton from './Skeleton';

const ReviewCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton width="44px" height="44px" className="rounded-full" />
                    <div className="space-y-2">
                        <Skeleton width="120px" height="1rem" />
                        <div className="flex gap-2">
                            <Skeleton width="80px" height="0.75rem" />
                            <Skeleton width="60px" height="0.75rem" />
                        </div>
                    </div>
                </div>
                <Skeleton width="150px" height="1.75rem" className="rounded-xl" />
            </div>
            <div className="ml-[56px] space-y-2">
                <Skeleton width="100%" height="0.875rem" />
                <Skeleton width="90%" height="0.875rem" />
                <Skeleton width="40%" height="0.875rem" />
                <div className="mt-4">
                    <Skeleton width="120px" height="1.25rem" />
                </div>
            </div>
        </div>
    );
};

export default ReviewCardSkeleton;
