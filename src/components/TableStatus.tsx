import React from 'react';
import { Table } from '../types';

interface TableStatusProps {
  tables: Table[];
}

export const TableStatus: React.FC<TableStatusProps> = ({ tables }) => {
  return (
    <div className="flex gap-4 mt-8">
      {tables.map((table) => (
        <div key={table.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 flex-1">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-sm">
            {table.label}
          </div>
          <div className="flex-1">
            <h5 className="text-[11px] font-bold text-gray-800">{table.waiter}</h5>
            <p className="text-[9px] text-gray-400">{table.items} items → <span className="text-emerald-500">{table.status}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
};
