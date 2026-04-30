import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import axios from 'axios';

interface ReceiptData {
  merchantName?: string;
  date?: Date;
  totalAmount?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  confidence: number;
}

interface Props {
  onScanComplete: (data: ReceiptData) => void;
  onClose: () => void;
}

export const ReceiptScanner: React.FC<Props> = ({ onScanComplete, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setScanning(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/ocr/scan-receipt',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error('Failed to scan receipt:', error);
      alert('Không thể quét hóa đơn. Vui lòng thử lại!');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      onScanComplete(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-500" />
            Quét Hóa Đơn
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Chọn ảnh hóa đơn để quét</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Chọn Ảnh
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full rounded-lg border border-gray-200"
                  />
                  {scanning && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="bg-white rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-800 font-medium">Đang quét hóa đơn...</p>
                      </div>
                    </div>
                  )}
                </div>

                {result && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-gray-800">Kết Quả Quét</h3>
                      <span className="ml-auto text-sm text-gray-600">
                        Độ chính xác: {(result.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {result.merchantName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cửa hàng:</span>
                          <span className="font-medium">{result.merchantName}</span>
                        </div>
                      )}
                      {result.date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày:</span>
                          <span className="font-medium">
                            {new Date(result.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                      {result.totalAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-bold text-lg text-green-600">
                            {result.totalAmount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      )}
                    </div>
                    {result.items && result.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Danh sách mặt hàng:</p>
                        <div className="space-y-1">
                          {result.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.name} x{item.quantity}
                              </span>
                              <span className="font-medium">
                                {item.price.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!result ? (
                  <>
                    <button
                      onClick={() => {
                        setPreview(null);
                        setSelectedFile(null);
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Chọn Lại
                    </button>
                    <button
                      onClick={handleScan}
                      disabled={scanning}
                      className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {scanning ? 'Đang Quét...' : 'Quét Hóa Đơn'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setResult(null);
                        setPreview(null);
                        setSelectedFile(null);
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Quét Lại
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Xác Nhận
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
