
import React, { useState, useCallback, useMemo } from 'react';
import { findBestFrame } from '../services/geminiService';
import { BestFrameResponse } from '../types';
import { SendIcon } from './icons';

interface Props {
    csvData: string | null;
    csvFileName: string | null;
    apiKey: string;
}

const EXCLUDED_BRANDS = new Set([
    'icc', 'bcci', '5g', 'india', 'australia', 'world cup', 'asia cup', 'virat', 'babar'
]);

const Tab4BestFrameFinder: React.FC<Props> = ({ csvData, csvFileName, apiKey }) => {
    const [brandName, setBrandName] = useState('');
    const [result, setResult] = useState<BestFrameResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const topBrands = useMemo(() => {
        if (!csvData) return [];
        
        try {
            const lines = csvData.trim().split('\n');
            if (lines.length < 2) return [];
            
            const header = lines[0].split(',').map(h => h.trim());
            const brandIndex = header.indexOf('brand_name');
            if (brandIndex === -1) return [];

            const brandCounts: { [key: string]: number } = {};
            lines.slice(1).forEach(line => {
                const values = line.split(',');
                if (values.length > brandIndex) {
                    const brand = values[brandIndex].trim();
                    if (brand) {
                        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
                    }
                }
            });

            return Object.entries(brandCounts)
                .filter(([brand]) => !EXCLUDED_BRANDS.has(brand.toLowerCase()))
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 15)
                .map(([brand]) => brand);
        } catch (e) {
            console.error("Error parsing top brands from CSV:", e);
            return [];
        }
    }, [csvData]);

    const handleFindFrame = useCallback(async () => {
        if (!brandName.trim() || !csvData || !apiKey) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await findBestFrame(csvData, brandName, apiKey);
            if (response) {
                setResult(response);
            } else {
                setError('Failed to find the best frame. The model may have returned an unexpected format or could not find the brand. Please try again.');
            }
        } catch (e) {
            setError('An error occurred while analyzing the data. Please check your API key and the CSV data format.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [brandName, csvData, apiKey]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10">
                    <div className="loader inline-block"></div>
                    <p className="mt-4 text-slate-300">AI Analyst is scanning the data...</p>
                    <style>{`.loader{width:50px;aspect-ratio:1;border-radius:50%;border:8px solid #514b82;animation:l20-1 0.8s infinite linear alternate,l20-2 1.6s infinite linear}.@keyframes l20-1{0%{clip-path:polygon(50% 50%,0 0,50% 0,50% 0,50% 0,50% 0)}12.5%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 0,100% 0)}25%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 100%,100% 100%)}37.5%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 100%,0 100%)}50%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 100%,0 100%)}62.5%{clip-path:polygon(50% 50%,50% 50%,50% 0,100% 0,100% 100%,0 100%)}75%{clip-path:polygon(50% 50%,50% 50%,50% 50%,100% 0,100% 100%,0 100%)}87.5%{clip-path:polygon(50% 50%,50% 50%,50% 50%,50% 50%,100% 100%,0 100%)}100%{clip-path:polygon(50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,0 100%)}}@keyframes l20-2{0%{transform:scaleY(1) rotate(0deg)}49.99%{transform:scaleY(1) rotate(135deg)}50%{transform:scaleY(-1) rotate(-135deg)}100%{transform:scaleY(-1) rotate(-360deg)}}`}</style>
                </div>
            );
        }
        if (error) {
            return <div className="text-center p-10 text-red-400">{error}</div>;
        }
        if (result) {
            return (
                <div className="bg-slate-700/50 p-6 rounded-lg animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Analyst Recommendation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-slate-800 p-6 rounded-lg flex flex-col items-center justify-center text-center">
                            <p className="text-lg text-slate-300">Most Impactful Frame</p>
                            <p className="text-6xl font-bold text-cyan-400 my-2">{result.frameNumber}</p>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="font-semibold text-cyan-400 mb-2">Analyst's Reasoning:</h4>
                            <p className="text-slate-200 whitespace-pre-wrap">{result.reasoning}</p>
                        </div>
                    </div>
                </div>
            );
        }
        return (
             <div className="text-center text-slate-400 py-10">
                <p>Enter a brand or select one from the list to begin.</p>
            </div>
        );
    };

    if (!apiKey) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold text-white mt-4 mb-2">API Key Required</h2>
                <p className="text-slate-400">Please go to the 'CSV Chatbot' tab to enter your Google API key.</p>
            </div>
        );
    }

    if (!csvData) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">No CSV File Loaded</h2>
            <p className="text-slate-400">Please upload a CSV file in the 'CSV Chatbot' tab to use this tool.</p>
          </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-cyan-400 mb-2">Best Frame Finder</h2>
                <p className="text-slate-300 mb-6">Enter a brand name, and our AI analyst will find the single most valuable frame for that brand's exposure from your CSV data.</p>
            </div>

            <div className="p-2 border-b border-t border-slate-700 text-sm text-slate-300 text-center mb-6">
                Active File: <span className="font-semibold text-cyan-400">{csvFileName}</span>
            </div>

            {topBrands.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm text-slate-400 text-center mb-3">Top 15 Brands in this file:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {topBrands.map(brand => (
                            <button
                                key={brand}
                                onClick={() => setBrandName(brand)}
                                className="bg-slate-600 hover:bg-slate-500 text-white text-sm py-1 px-3 rounded-full transition-colors"
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="relative mb-6">
                <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFindFrame()}
                    placeholder="Enter brand name (e.g., 'Pepsi')"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-4 pr-16 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg"
                    disabled={isLoading}
                />
                <button
                    onClick={handleFindFrame}
                    disabled={isLoading || !brandName.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon />
                </button>
            </div>

            <div className="min-h-[200px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default Tab4BestFrameFinder;