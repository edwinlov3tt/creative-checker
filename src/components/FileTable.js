import React, { useState } from 'react';

const FileTable = ({ files }) => {
  const [sortField, setSortField] = useState('width');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filter, setFilter] = useState('all');

  const processedFiles = [...files]
    .filter(file => {
      const matches = file.specCheck?.matches?.length > 0;
      if (filter === 'match') return matches;
      if (filter === 'mismatch') return !matches;
      return true;
    })
    .sort((a, b) => {
      const valueA = a.dimensions[sortField];
      const valueB = b.dimensions[sortField];
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

  const handleSortChange = (e) => {
    setSortField(e.target.value);
  };

  const toggleOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
      <div className="p-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortField}
            onChange={handleSortChange}
            className="border-gray-300 rounded-lg text-sm"
          >
            <option value="width">Width</option>
            <option value="height">Height</option>
          </select>
          <button
            onClick={toggleOrder}
            className="px-2 py-1 text-sm border rounded-lg"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="match">Spec Match</option>
            <option value="mismatch">No Match</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedFiles.map(file => {
              const matches = file.specCheck?.matches?.length > 0;
              return (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{file.displayName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.dimensions.width} × {file.dimensions.height}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.type.split('/')[1]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {matches ? (
                      <span className="text-green-600">Match</span>
                    ) : (
                      <span className="text-red-600">No Match</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileTable;
