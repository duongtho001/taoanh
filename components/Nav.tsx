import React from 'react';

type Tab = 'pose-generator' | 'background-changer' | 'pose-transfer' | 'expression-changer' | 'gallery' | 'api-settings';

interface NavItem {
    id: Tab | string;
    label: string;
    href?: string;
}

interface NavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Nav: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: NavItem[] = [
    { id: 'pose-generator', label: 'Tạo Dáng Chụp Ảnh' },
    { id: 'background-changer', label: 'Thay Đổi Phông Nền' },
    { id: 'pose-transfer', label: 'Chuyển Đổi Dáng' },
    { id: 'expression-changer', label: 'Biểu Cảm AI' },
    { id: 'gallery', label: 'Thư viện' },
    { id: 'upscale', label: 'Upscale Ảnh', href: 'https://www.iloveimg.com/upscale-image' },
    { id: 'api-settings', label: 'Cài đặt API' },
  ];

  return (
    <nav className="mb-8">
      <div className="flex justify-center flex-wrap gap-2 p-2 bg-slate-800/50 border border-slate-700 rounded-full">
        {navItems.map((item) => {
          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs sm:px-4 sm:text-sm font-medium rounded-full transition-colors duration-200 text-slate-300 hover:bg-slate-700"
              >
                {item.label}
              </a>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`px-3 py-2 text-xs sm:px-4 sm:text-sm font-medium rounded-full transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Nav;