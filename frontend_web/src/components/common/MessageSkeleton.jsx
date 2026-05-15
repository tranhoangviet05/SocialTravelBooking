import React from 'react';
import Skeleton from './Skeleton';

const MessageSkeleton = () => {
    return (
        <div className="h-screen flex bg-white overflow-hidden border border-gray-200">
            {/* Sidebar Skeleton */}
            <div className="w-[360px] border-r border-gray-200 flex flex-col">
                <div className="p-4">
                    <Skeleton width="100px" height="2rem" className="mb-4" />
                    <Skeleton width="100%" height="2.5rem" className="rounded-full" />
                </div>
                <div className="flex-1 px-2 space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                            <Skeleton width="56px" height="56px" className="rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton width="120px" height="1rem" />
                                    <Skeleton width="40px" height="0.75rem" />
                                </div>
                                <Skeleton width="80%" height="0.8rem" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Skeleton */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="h-[60px] px-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton width="40px" height="40px" className="rounded-full" />
                        <div className="space-y-1">
                            <Skeleton width="120px" height="1rem" />
                            <Skeleton width="80px" height="0.75rem" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 space-y-4">
                    <div className="flex justify-start items-end gap-2">
                        <Skeleton width="28px" height="28px" className="rounded-full" />
                        <Skeleton width="200px" height="40px" className="rounded-[20px]" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton width="180px" height="40px" className="rounded-[20px]" />
                    </div>
                    <div className="flex justify-start items-end gap-2">
                        <Skeleton width="28px" height="28px" className="rounded-full" />
                        <Skeleton width="250px" height="80px" className="rounded-[20px]" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton width="120px" height="40px" className="rounded-[20px]" />
                    </div>
                </div>

                <div className="p-4 pt-2">
                    <Skeleton width="100%" height="2.5rem" className="rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default MessageSkeleton;
