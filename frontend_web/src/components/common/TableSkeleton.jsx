import React from 'react';
import Skeleton from './Skeleton';

const TableSkeleton = ({ columns, rows = 5 }) => {
    return (
        <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            {[...Array(columns)].map((_, i) => (
                                <th key={i} className="px-8 py-5">
                                    <Skeleton width="60%" height="0.75rem" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[...Array(rows)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(columns)].map((_, j) => (
                                    <td key={j} className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {j === 0 && <Skeleton variant="circle" width="2.5rem" height="2.5rem" className="flex-shrink-0" />}
                                            <div className="flex-1 space-y-2">
                                                <Skeleton width={j === 0 ? "80%" : "60%"} height="1rem" />
                                                {j === 0 && <Skeleton width="40%" height="0.75rem" />}
                                            </div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableSkeleton;
