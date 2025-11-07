import React from 'react';

interface AspectRatioSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const aspectRatios = [
  { value: '4:5', label: '4:5 (Dọc)' },
  { value: '3:4', label: '3:4 (Dọc)' },
  { value: '9:16', label: '9:16 (Story)' },
  { value: '1:1', label: '1:1 (Vuông)' },
  { value: '16:9', label: '16:9 (Ngang)' },
];

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ value, onChange, label }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <select
        name="aspectRatio"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 text-white focus:ring-purple-500 focus:border-purple-500 transition"
      >
        {aspectRatios.map(ratio => (
          <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
        ))}
      </select>
    </div>
  );
};

export default AspectRatioSelector;
