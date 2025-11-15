import React from 'react';
import { DownloadIcon, ExternalLinkIcon } from './icons';

const Tab1BrandAnalytics: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4">
        Brand Exposure Analytics in Cricket
      </h2>
      <p className="max-w-2xl text-slate-300 mb-8">
        Unlock powerful insights into your brand's visibility during cricket matches. 
        Download our analysis toolkit and access the Colab notebook to get started with your data.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a 
          href="Examples_images_zip.zip" 
          download
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          <DownloadIcon />
          <span>Download Input Image Folder</span>
        </a>
        <a 
          href="https://colab.research.google.com/drive/1334s8wph1eESCw8SmhSjmgTXmEgE8Gnc?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
        >
          <ExternalLinkIcon />
          <span>Open Colab Notebook</span>
        </a>
      </div>
    </div>
  );
};

export default Tab1BrandAnalytics;