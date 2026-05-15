import React from 'react';
import Skeleton from '../common/Skeleton';

const AdminTable = ({ headers, children, title, description, actions, loading, rowCount = 5 }) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {(title || description || actions) && (
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50">
                            {headers.map((header, idx) => (
                                <th 
                                    key={idx} 
                                    className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            [...Array(rowCount)].map((_, i) => (
                                <tr key={i}>
                                    {headers.map((_, j) => (
                                        <td key={j} className="px-8 py-4">
                                            <Skeleton height="1.25rem" width={j === 0 ? "140px" : "100px"} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            children
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTable;
