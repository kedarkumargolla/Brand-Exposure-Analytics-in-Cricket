
import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  csvData: string | null;
  csvFileName: string | null;
}

const COLORS = ['#06b6d4', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#AF19FF'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const name = payload[0].name;
        const value = payload[0].value;
      return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-3 border border-slate-600 rounded-md shadow-lg text-sm">
          <p className="label text-cyan-400 font-bold mb-1">{label || data.name}</p>
          <p className="intro text-white">{`${name}: ${typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : value}`}</p>
        </div>
      );
    }
    return null;
};

const Tab3Dashboard: React.FC<Props> = ({ csvData, csvFileName }) => {
    const processedData = useMemo(() => {
        if (!csvData) return null;
        try {
            // Use regex to split lines, handling both \n and \r\n
            const lines = csvData.trim().split(/\r?\n/);
            if (lines.length < 2) return null;

            // Helper to find header index case-insensitively
            const findHeaderIndex = (headers: string[], possibleNames: string[]): number => {
                const lowerCaseHeaders = headers.map(h => h.trim().toLowerCase().replace(/"/g, ''));
                for (const name of possibleNames) {
                    const index = lowerCaseHeaders.indexOf(name.toLowerCase());
                    if (index !== -1) return index;
                }
                return -1;
            };
            
            // Regex to split CSV row, handling quoted commas
            const splitCsvLine = (line: string) => {
                 return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            };

            const header = splitCsvLine(lines[0]);
            const brandIndex = findHeaderIndex(header, ['brand_name']);
            const cliIndex = findHeaderIndex(header, ['c_li']);
            const categoryIndex = findHeaderIndex(header, ['Ad_category', 'ad_categories']);

            if (brandIndex === -1 || cliIndex === -1 || categoryIndex === -1) {
                const missing = [];
                if (brandIndex === -1) missing.push("'brand_name'");
                if (cliIndex === -1) missing.push("'c_li'");
                if (categoryIndex === -1) missing.push("'Ad_category' or 'ad_categories'");
                throw new Error(`CSV is missing required columns: ${missing.join(', ')}.`);
            }
            
            const brandFrequency: { [key: string]: number } = {};
            const brandCliSum: { [key: string]: number } = {};
            const categoryFrequency: { [key: string]: number } = {};
            const categoryCliSum: { [key: string]: number } = {};

            for (let i = 1; i < lines.length; i++) {
                const values = splitCsvLine(lines[i]);
                if (values.length > Math.max(brandIndex, cliIndex, categoryIndex)) {
                    // Clean values by removing quotes and trimming whitespace
                    const brand = values[brandIndex]?.replace(/"/g, '').trim();
                    const cliStr = values[cliIndex]?.replace(/"/g, '').trim();
                    const category = values[categoryIndex]?.replace(/"/g, '').trim();
                    const cli = parseFloat(cliStr);

                    if (brand && !isNaN(cli) && category) {
                        brandFrequency[brand] = (brandFrequency[brand] || 0) + 1;
                        brandCliSum[brand] = (brandCliSum[brand] || 0) + cli;
                        categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
                        categoryCliSum[category] = (categoryCliSum[category] || 0) + cli;
                    }
                }
            }

            const topBrandsByFreq = Object.entries(brandFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, Frequency]) => ({ name, Frequency }));
            
            const topBrandsByCli = Object.entries(brandCliSum)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, value]) => ({ name, 'Relative Pixel Area': value }));

            const categoryDataByFreq = Object.entries(categoryFrequency).map(([name, value]) => ({ name, value }));
            const categoryDataByCli = Object.entries(categoryCliSum).map(([name, value]) => ({ name, value }));

            return { topBrandsByFreq, topBrandsByCli, categoryDataByFreq, categoryDataByCli };
        } catch(error) {
            console.error("Error processing CSV for dashboard:", error);
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: "An unknown error occurred while processing the CSV." };
        }
    }, [csvData]);
    
    if (!csvData) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">No CSV File Loaded</h2>
            <p className="text-slate-400">Please upload a CSV file in the 'CSV Chatbot' tab to generate the dashboard.</p>
          </div>
        );
    }

    if (!processedData) {
        return <div className="text-center p-10 text-slate-400">Processing data...</div>;
    }
    
    if (processedData.error) {
        return <div className="text-center p-10 text-red-400">Error: {processedData.error}</div>;
    }

    const { topBrandsByFreq, topBrandsByCli, categoryDataByFreq, categoryDataByCli } = processedData;

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-cyan-400 mb-2">Insights Dashboard</h2>
                <p className="text-slate-300">Displaying key metrics for <span className="font-semibold text-cyan-400">{csvFileName}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4 text-center">Top 10 Brands by Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topBrandsByFreq} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}/>
                            <Bar dataKey="Frequency" fill="#06b6d4" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4 text-center">Top 10 Brands by Relative Pixel Area</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topBrandsByCli} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis type="number" stroke="#94a3b8" domain={[0, 'dataMax']} />
                            <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} tick={{ fontSize: 12 }}/>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}/>
                            <Bar dataKey="Relative Pixel Area" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4 text-center">Ad Category by Frequency</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryDataByFreq} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * Math.PI / 180); const y = cy + radius * Math.sin(-midAngle * Math.PI / 180); return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`} </text> : null; }}>
                                {categoryDataByFreq.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4 text-center">Ad Category by Relative Pixel Area</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                             <Pie data={categoryDataByCli} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * Math.PI / 180); const y = cy + radius * Math.sin(-midAngle * Math.PI / 180); return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`} </text> : null; }}>
                                 {categoryDataByCli.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                             </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Tab3Dashboard;