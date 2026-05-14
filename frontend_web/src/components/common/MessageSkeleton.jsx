import React from 'react';
import Skeleton from './Skeleton';

const MessageSkeleton = () => {
    return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            {/* Sidebar Skeleton */}
            <div className="w-80 border-r border-slate-50 flex flex-col bg-slate-50/30">
                <div className="p-6">
                    <Skeleton width="150px" height="1.5rem" className="mb-6" />
                    <Skeleton width="100%" height="3rem" className="rounded-xl" />
                </div>
                <div className="flex-1 px-3 space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-4">
                            <Skeleton width="48px" height="48px" className="rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton width="100px" height="1rem" />
                                    <Skeleton width="40px" height="0.75rem" />
                                </div>
                                <Skeleton width="80%" height="0.75rem" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Skeleton */}
            <div className="flex-1 flex flex-col bg-slate-50/20">
                <div className="h-20 px-8 border-b border-slate-50 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-4">
                        <Skeleton width="40px" height="40px" className="rounded-xl" />
                        <div className="space-y-1">
                            <Skeleton width="120px" height="1rem" />
                            <Skeleton width="80px" height="0.75rem" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton width="36px" height="36px" className="rounded-xl" />
                        <Skeleton width="36px" height="36px" className="rounded-xl" />
                        <Skeleton width="36px" height="36px" className="rounded-xl" />
                    </div>
                </div>

                <div className="flex-1 p-8 space-y-6">
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[70%]">
                            <Skeleton width="32px" height="32px" className="rounded-lg mt-auto" />
                            <Skeleton width="200px" height="60px" className="rounded-2xl rounded-tl-none" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Skeleton width="180px" height="40px" className="rounded-2xl rounded-tr-none" />
                    </div>
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[70%]">
                            <Skeleton width="32px" height="32px" className="rounded-lg mt-auto" />
                            <Skeleton width="250px" height="80px" className="rounded-2xl rounded-tl-none" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Skeleton width="120px" height="40px" className="rounded-2xl rounded-tr-none" />
                    </div>
                </div>

                <div className="p-8 pt-4">
                    <Skeleton width="100%" height="3.5rem" className="rounded-2xl" />
                </div>
            </div>
        </div>
    );
};

export default MessageSkeleton;
