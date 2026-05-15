import React from 'react';
import Skeleton from './Skeleton';

const ProviderSettingsSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton width="250px" height="2rem" />
                    <Skeleton width="400px" height="1rem" />
                </div>
                <Skeleton width="48px" height="48px" className="rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
                        <Skeleton width="96px" height="96px" className="rounded-[2rem] mx-auto mb-6" />
                        <Skeleton width="150px" height="1.5rem" className="mx-auto mb-2" />
                        <Skeleton width="120px" height="0.75rem" className="mx-auto mb-4" />
                        <Skeleton width="100px" height="1.5rem" className="mx-auto rounded-full" />
                    </div>
                    <div className="bg-slate-900 rounded-[2rem] p-6 h-[160px]">
                        <Skeleton width="24px" height="24px" className="bg-white/10 mb-4" />
                        <Skeleton width="120px" height="1rem" className="bg-white/10 mb-2" />
                        <Skeleton width="100%" height="2rem" className="bg-white/10" />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton width="150px" height="0.75rem" />
                                <Skeleton width="100%" height="3.5rem" className="rounded-2xl" />
                            </div>
                        ))}
                        <div className="pt-4 border-t border-slate-50">
                            <Skeleton width="180px" height="3.5rem" className="rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderSettingsSkeleton;
