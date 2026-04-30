import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import axios from 'axios';

export const ExportData: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!startDate || !endDate) {
      alert('Vui lòng chọn khoảng thời gian!');
      return;
    }

    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/export/${format}`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `transactions_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Không thể export dữ liệu. Vui lòng thử lại!');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Download className="w-6 h-6 text-blue-500" />
        Export Dữ Liệu
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-12 h-12 text-green-500" />
            <div className="text-center">
              <p className="font-semibold text-gray-800">Excel</p>
              <p className="text-xs text-gray-600">Định dạng .xlsx</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="flex flex-col items-center gap-3 p-6 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <p className="font-semibold text-gray-800">PDF</p>
              <p className="text-xs text-gray-600">Định dạng .pdf</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex flex-col items-center gap-3 p-6 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <File className="w-12 h-12 text-blue-500" />
            <div className="text-center">
              <p className="font-semibold text-gray-800">CSV</p>
              <p className="text-xs text-gray-600">Định dạng .csv</p>
            </div>
          </button>
        </div>

        {exporting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-blue-700 font-medium">Đang export dữ liệu...</p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Lưu ý:</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Excel: Bao gồm biểu đồ và định dạng đẹp</li>
            <li>PDF: Phù hợp để in ấn và lưu trữ</li>
            <li>CSV: Dễ dàng import vào các ứng dụng khác</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
