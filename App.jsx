import React, { useState } from 'react';
import { Search, Sun, Cloud, Wind, Droplets, SunDim, Thermometer } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { motion } from 'framer-motion';

// Mock Data for the 24hr temperature curve
const hourlyData =[
  { time: '12 AM', temp: 16 }, { time: '4 AM', temp: 14 },
  { time: '8 AM', temp: 18 }, { time: '12 PM', temp: 24 },
  { time: '4 PM', temp: 26 }, { time: '8 PM', temp: 21 },
  { time: '11 PM', temp: 17 }
];

// Mock Data for the 7-day forecast
const weeklyForecast =[
  { day: 'Today', max: 26, min: 14, icon: <Sun size={20} className="text-yellow-400" /> },
  { day: 'Mon', max: 24, min: 15, icon: <Cloud size={20} className="text-gray-300" /> },
  { day: 'Tue', max: 22, min: 13, icon: <Cloud size={20} className="text-gray-300" /> },
  { day: 'Wed', max: 25, min: 14, icon: <Sun size={20} className="text-yellow-400" /> },
  { day: 'Thu', max: 27, min: 16, icon: <Sun size={20} className="text-yellow-400" /> },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  // Future Logic: Sun -> Cloud unlock sequence
  const handleSunClick = () => {
    console.log("Sun clicked - Step 1 of unlock initiated");
  };

  const handleCloudClick = () => {
    console.log("Cloud clicked - Step 2 or SOS initiated");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 text-white p-5 font-sans flex justify-center">
      <div className="w-full max-w-md">
        
        {/* Search Bar / Safeword Listener */}
        <div className="flex items-center bg-white/20 rounded-2xl px-4 py-3 mb-8 backdrop-blur-md">
          <Search size={20} className="text-white/80" />
          <input 
            type="text" 
            placeholder="Search city or zip code..." 
            className="bg-transparent border-none outline-none ml-3 w-full text-white placeholder-white/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Hidden Safeword reminder trigger */}
          <div className="w-6 h-6 flex justify-center items-center rounded-full text-white/40 text-xs cursor-pointer hover:text-white/80 transition-colors">
            ?
          </div>
        </div>

        {/* Main Weather Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-semibold mb-2 shadow-sm">Kochi</h1>
          <p className="text-lg text-white/90 mb-4">Partly Cloudy</p>
          
          <div className="flex justify-center items-center gap-6">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Sun 
                className="text-yellow-300 w-20 h-20 cursor-pointer drop-shadow-lg" 
                onClick={handleSunClick} 
                fill="currentColor"
              />
            </motion.div>
            
            <span className="text-7xl font-light tracking-tighter">26°</span>
            
            <motion.div whileTap={{ scale: 0.9 }}>
              <Cloud 
                className="text-white/90 w-16 h-16 cursor-pointer drop-shadow-md mt-4" 
                onClick={handleCloudClick} 
                fill="currentColor"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* 24-Hour Temperature Curve */}
        <div className="bg-white/10 rounded-3xl p-4 mb-6 backdrop-blur-md">
          <h2 className="text-sm font-medium text-white/80 mb-4 uppercase tracking-wider">Today's Temperature</h2>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2x2 Stat Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md flex flex-col justify-between h-28">
            <div className="flex items-center text-white/70 text-sm"><Wind size={16} className="mr-2"/> Wind</div>
            <div className="text-2xl font-semibold">12 <span className="text-lg font-normal text-white/70">km/h</span></div>
          </div>
          <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md flex flex-col justify-between h-28">
            <div className="flex items-center text-white/70 text-sm"><Droplets size={16} className="mr-2"/> Humidity</div>
            <div className="text-2xl font-semibold">68 <span className="text-lg font-normal text-white/70">%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}