
import React, { useState, useCallback } from 'react';
import Tab1BrandAnalytics from './components/Tab1BrandAnalytics';
import Tab2CSVChatbot from './components/Tab2CSVChatbot';
import Tab3Dashboard from './components/Tab3Dashboard';
import Tab4BestFrameFinder from './components/Tab4LogoFinder';
import { AnalyticsIcon, BotIcon, DashboardIcon, ImageIcon } from './components/icons';

type Tab = 'analytics' | 'chatbot' | 'dashboard' | 'bestFrame';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [csvData, setCsvData] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  const handleCsvUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Tab1BrandAnalytics />;
      case 'chatbot':
        return <Tab2CSVChatbot 
                  csvData={csvData} 
                  csvFileName={csvFileName} 
                  onCsvUpload={handleCsvUpload}
                  apiKey={apiKey}
                  onApiKeyChange={setApiKey}
               />;
      case 'dashboard':
        return <Tab3Dashboard csvData={csvData} csvFileName={csvFileName} />;
      case 'bestFrame':
        return <Tab4BestFrameFinder csvData={csvData} csvFileName={csvFileName} apiKey={apiKey} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactElement }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 md:flex-none md:w-auto flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
        activeTab === tab 
          ? 'bg-slate-700/80 text-cyan-400 border-b-2 border-cyan-400' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div 
      className="min-h-screen font-sans bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6efd3a3c-5899-4d6d-b892-2253fb457a41_1284x856.jpeg')` }}
    >
      <div className="min-h-screen bg-slate-900/70 backdrop-blur-sm">
        <header className="bg-slate-800/50 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-white">Brand Analytics Suite</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="border-b border-slate-700/50 mb-6">
            <nav className="flex flex-wrap -mb-px">
              <TabButton tab="analytics" label="Brand Exposure Analytics" icon={<AnalyticsIcon />} />
              <TabButton tab="chatbot" label="CSV Chatbot" icon={<BotIcon />} />
              <TabButton tab="dashboard" label="Insights Dashboard" icon={<DashboardIcon />} />
              <TabButton tab="bestFrame" label="Best Frame Finder" icon={<ImageIcon />} />
            </nav>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-lg shadow-xl p-4 md:p-8 min-h-[calc(100vh-200px)]">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
