import React, { useState, useEffect } from 'react';
import { apiKeyManager } from '../services/apiKeyManager';

const ApiSettings: React.FC = () => {
  const [keys, setKeys] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setKeys(apiKeyManager.getKeysAsString());
  }, []);

  const handleSave = () => {
    try {
      apiKeyManager.saveKeys(keys);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000); // Reset status after 2 seconds
    } catch (error) {
      setSaveStatus('error');
      console.error("Failed to save API keys", error);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Cài đặt API Key Gemini</h2>
      <p className="text-slate-400 mb-6">
        Nhập danh sách API Key của bạn vào ô bên dưới, mỗi key một dòng. Ứng dụng sẽ tự động sử dụng key tiếp theo nếu key hiện tại gặp lỗi. 
        Các key này được lưu trữ an toàn ngay trên trình duyệt của bạn.
      </p>
      
      <div className="space-y-4">
        <div>
            <label htmlFor="apiKeys" className="block text-sm font-medium text-slate-300 mb-2">
                Danh sách API Keys (mỗi key một dòng)
            </label>
            <textarea
                id="apiKeys"
                rows={8}
                className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-purple-500 focus:border-purple-500 transition font-mono"
                placeholder="...key1...&#10;...key2...&#10;...key3..."
                value={keys}
                onChange={(e) => setKeys(e.target.value)}
            />
        </div>

        <div className="flex items-center justify-end gap-4">
             {saveStatus === 'success' && <p className="text-green-400 text-sm">Đã lưu thành công!</p>}
             {saveStatus === 'error' && <p className="text-red-400 text-sm">Lưu thất bại!</p>}
            <button
                onClick={handleSave}
                className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transition-all"
            >
                Lưu
            </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
