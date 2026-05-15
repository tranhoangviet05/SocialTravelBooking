import React from 'react';
import Skeleton from './Skeleton';

export const ServiceCardVerticalSkeleton = () => {
    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4">
                <Skeleton width="100%" height="100%" className="rounded-2xl" />
            </div>
            
            <div className="space-y-3 flex-1">
                <div className="flex justify-between items-center">
                    <Skeleton width="40%" height="0.75rem" />
                    <Skeleton width="20%" height="0.75rem" />
                </div>
                
                <Skeleton width="90%" height="1.25rem" className="rounded-md" />
                
                <div className="flex items-center gap-2">
                    <Skeleton variant="circle" width="24px" height="24px" />
                    <Skeleton width="50%" height="0.75rem" />
                </div>
                
                <div className="flex gap-2">
                    <Skeleton width="60px" height="1.25rem" className="rounded-md" />
                    <Skeleton width="70px" height="1.25rem" className="rounded-md" />
                </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton width="30px" height="0.5rem" />
                    <Skeleton width="100px" height="1.5rem" />
                </div>
                <Skeleton width="60px" height="0.75rem" />
            </div>
        </div>
    );
};

export const CommunityPostSkeleton = () => {
    return (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 flex flex-col h-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex gap-3 flex-1">
                {/* Left: Avatar Skeleton */}
                <div className="flex flex-col items-center">
                    <Skeleton variant="circle" width="36px" height="36px" className="shrink-0" />
                    <div className="w-[1.5px] grow bg-gray-100 my-2 rounded-full"></div>
                </div>

                {/* Right: Content Skeleton */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                        <Skeleton width="40%" height="0.75rem" />
                        <Skeleton width="20%" height="0.5rem" />
                    </div>
                    <Skeleton width="30%" height="0.5rem" />
                    
                    <div className="space-y-2">
                        <Skeleton width="100%" height="0.75rem" />
                        <Skeleton width="90%" height="0.75rem" />
                        <Skeleton width="60%" height="0.75rem" />
                    </div>
                    
                    <Skeleton width="100%" height="150px" className="rounded-xl" />
                </div>
            </div>

            {/* Actions Footer Skeleton */}
            <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <Skeleton variant="circle" width="18px" height="18px" />
                    <Skeleton variant="circle" width="18px" height="18px" />
                    <Skeleton variant="circle" width="18px" height="18px" />
                    <Skeleton variant="circle" width="18px" height="18px" />
                </div>
                <Skeleton width="40%" height="0.5rem" />
            </div>
        </div>
    );
};

export const DestinationCardSkeleton = () => {
    return (
        <div className="w-full h-[380px] bg-slate-100 rounded-3xl animate-pulse relative overflow-hidden">
            <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
                <div className="w-3/4 h-6 bg-slate-200 rounded-md"></div>
            </div>
        </div>
    );
};
