import React from 'react';
import Skeleton from './Skeleton';

const SettingsSkeleton = () => {
    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width="250px" height="2rem" />
                    <Skeleton width="400px" height="1rem" />
                </div>
                <Skeleton width="48px" height="48px" className="rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <Skeleton width="48px" height="48px" className="rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton width="180px" height="1.25rem" />
                            <Skeleton width="150px" height="0.75rem" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Skeleton width="120px" height="0.75rem" />
                            <Skeleton width="100%" height="3.5rem" className="rounded-2xl" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton width="120px" height="0.75rem" />
                            <Skeleton width="100%" height="3.5rem" className="rounded-2xl" />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <Skeleton width="150px" height="0.75rem" />
                            <Skeleton width="100%" height="3.5rem" className="rounded-2xl" />
                            <Skeleton width="80%" height="0.75rem" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a] rounded-[2.5rem] p-10 shadow-2xl h-[400px]">
                    <div className="flex items-center gap-4 mb-10">
                        <Skeleton width="56px" height="56px" className="rounded-2xl bg-white/10" />
                        <div className="space-y-2">
                            <Skeleton width="200px" height="1.5rem" className="bg-white/10" />
                            <Skeleton width="150px" height="0.75rem" className="bg-white/10" />
                        </div>
                    </div>
                    <div className="space-y-10">
                        <div className="space-y-5">
                            <div className="flex justify-between">
                                <Skeleton width="200px" height="0.75rem" className="bg-white/10" />
                                <Skeleton width="40px" height="1.5rem" className="rounded-lg bg-white/10" />
                            </div>
                            <Skeleton width="100%" height="0.5rem" className="rounded-full bg-white/10" />
                            <Skeleton width="90%" height="0.75rem" className="bg-white/10" />
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton width="150px" height="1rem" className="bg-white/10" />
                                <Skeleton width="120px" height="0.75rem" className="bg-white/10" />
                            </div>
                            <Skeleton width="48px" height="24px" className="rounded-full bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsSkeleton;
