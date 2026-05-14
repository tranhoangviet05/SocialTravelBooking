import React from 'react';
import Skeleton from './Skeleton';

const WalletSkeleton = () => {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width="250px" height="2rem" />
                    <Skeleton width="400px" height="1rem" />
                </div>
                <Skeleton width="48px" height="48px" className="rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-100 rounded-[2.5rem] p-8 h-[240px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Skeleton width="40px" height="40px" className="rounded-xl" />
                            <Skeleton width="150px" height="1rem" />
                        </div>
                        <Skeleton width="24px" height="24px" />
                    </div>
                    <Skeleton width="60%" height="4rem" />
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <Skeleton width="300px" height="1rem" />
                    </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-[240px]">
                    <div className="space-y-4">
                        <Skeleton width="100px" height="0.75rem" />
                        <Skeleton width="200px" height="2.5rem" />
                        <Skeleton width="100%" height="2rem" />
                    </div>
                    <Skeleton width="100%" height="3.5rem" className="rounded-2xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton width="200px" height="1.5rem" />
                    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-5 flex items-center justify-between border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <Skeleton width="40px" height="40px" className="rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton width="180px" height="1rem" />
                                        <Skeleton width="250px" height="0.75rem" />
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <Skeleton width="100px" height="1.25rem" className="ml-auto" />
                                    <Skeleton width="80px" height="0.75rem" className="ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton width="200px" height="1.5rem" />
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm min-h-[400px] space-y-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton width="60px" height="0.75rem" />
                                    <Skeleton width="100px" height="0.75rem" />
                                </div>
                                <Skeleton width="100%" height="0.5rem" className="rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletSkeleton;
