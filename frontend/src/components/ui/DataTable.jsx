import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DataTable = ({ columns, data, searchPlaceholder = "Search students...", onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredData = data.filter((row) =>
    columns.some(({ key }) => 
      row[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
      {/* Header with search */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end justify-between">
          <h2 className="text-2xl text-white font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Interns List
          </h2>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-5 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 placeholder-gray-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
            <tr>
              {columns.map(({ key, label, sortable = true }) => (
                <th
                  key={key}
                  className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:text-primary transition-colors group"
                  onClick={sortable ? () => handleSort(key) : undefined}
                >
                  <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                    {label}
                    {sortable && (
                      <motion.span
                        animate={{ rotate: sortConfig.key === key ? (sortConfig.direction === 'asc' ? 0 : 180) : -90 }}
                        className="text-xs opacity-50 w-4 h-4"
                      >
                        ↕️
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {sortedData.map((row, index) => (
              <motion.tr
                key={row._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-100/50 hover:border-primary/20"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(({ key, render }) => (
                  <td key={key} className="px-6 py-5 text-sm">
                    {render ? render(row[key], row) : row[key] || 'N/A'}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {sortedData.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 0v6m0-6H4m15 0v6m0-6h2m-15-4h18M4 5v-.8c0-.414.168-.789.44-1.068C4.596 3.232 5.017 3 5.5 3h3c.483 0 .904.232 1.06.592.272.279.44.654.44 1.068V5m15 0v-.8c0-.414-.168-.789-.44-1.068C19.404 3.232 18.983 3 18.5 3h-3c-.483 0-.904.232-1.06.592a1.496 1.496 0 00-.44 1.068V5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No students found</h3>
          <p className="text-gray-500">{searchTerm ? 'Try adjusting your search terms.' : 'No students assigned yet.'}</p>
        </div>
      )}

      <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-900/50">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedData.length} of {data.length} students
          {searchTerm && ` • filtered from "${searchTerm}"`}
        </div>
      </div>
    </div>
  );
};

export default DataTable;

