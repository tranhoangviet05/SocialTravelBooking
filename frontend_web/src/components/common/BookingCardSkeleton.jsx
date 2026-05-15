import React from 'react';
import Skeleton from './Skeleton';

const BookingCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
            <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton width="80px" height="1.5rem" className="rounded-lg" />
                    <Skeleton width="100px" height="1.5rem" className="rounded-xl" />
                </div>
                <Skeleton width="60%" height="1.25rem" />
                <div className="flex items-center gap-5">
                    <Skeleton width="120px" height="0.75rem" />
                    <Skeleton width="150px" height="0.75rem" />
                    <Skeleton width="80px" height="0.75rem" />
                </div>
            </div>
            <div className="text-right space-y-2">
                <Skeleton width="120px" height="1.75rem" className="ml-auto" />
                <Skeleton width="60px" height="0.75rem" className="ml-auto" />
                <Skeleton width="140px" height="2.5rem" className="rounded-xl ml-auto" />
            </div>
        </div>
    );
};

export default BookingCardSkeleton;
