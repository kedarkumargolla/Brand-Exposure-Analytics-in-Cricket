
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { UploadIcon, SendIcon, BotIcon } from './icons';

interface Props {
  csvData: string | null;
  csvFileName: string | null;
  onCsvUpload: (file: File) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const Tab2CSVChatbot: React.FC<Props> = ({ csvData, csvFileName, onCsvUpload, apiKey, onApiKeyChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (csvData && apiKey) {
        setMessages([
            { role: 'model', content: `File "${csvFileName}" loaded. How can I help you analyze this data?` }
        ]);
    } else {
        setMessages([]);
    }
  }, [csvData, csvFileName, apiKey]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onCsvUpload(file);
    } else {
      alert('Please upload a valid .csv file.');
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !csvData || !apiKey || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const response = await getChatbotResponse(csvData, userInput, apiKey);
    
    setMessages([...newMessages, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  if (!csvData || !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">Chatbot Setup</h2>
        <p className="text-slate-400 mb-6 max-w-md">Please provide your Google API key and upload a CSV file to begin your analysis.</p>
        
        <div className="w-full max-w-sm space-y-4">
            <div>
                <input
                    type="password"
                    placeholder="Enter your Google API Key"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                 {!apiKey && <p className="text-xs text-amber-400 mt-1 text-left">API Key is required to use the chatbot.</p>}
            </div>
            <div>
                <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                >
                <UploadIcon />
                <span>{csvFileName ? `Loaded: ${csvFileName}` : 'Select CSV File'}</span>
                </button>
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv"
                />
                 {!csvData && <p className="text-xs text-amber-400 mt-1 text-left">A CSV file is required to use the chatbot.</p>}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-250px)]">
      <div className="p-2 border-b border-slate-700 text-sm text-slate-300">
        Active File: <span className="font-semibold text-cyan-400">{csvFileName}</span>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}
            <div
              className={`max-w-xl p-3 rounded-lg ${
                msg.role === 'user' ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><BotIcon /></div>
                <div className="max-w-xl p-3 rounded-lg bg-slate-700 text-slate-200 flex items-center">
                    <div className="dot-flashing"></div>
                </div>
                <style>{`.dot-flashing{position:relative;width:5px;height:5px;border-radius:5px;background-color:#9880ff;color:#9880ff;animation:dot-flashing 1s infinite linear alternate;animation-delay:0.5s;margin:10px}.dot-flashing::before,.dot-flashing::after{content:'';display:inline-block;position:absolute;top:0}.dot-flashing::before{left:-10px;width:5px;height:5px;border-radius:5px;background-color:#9880ff;color:#9880ff;animation:dot-flashing 1s infinite alternate;animation-delay:0s}.dot-flashing::after{left:10px;width:5px;height:5px;border-radius:5px;background-color:#9880ff;color:#9880ff;animation:dot-flashing 1s infinite alternate;animation-delay:1s}@keyframes dot-flashing{0%{background-color:#9880ff}50%,100%{background-color:rgba(152,128,255,0.2)}}`}</style>
            </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about your data..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tab2CSVChatbot;
