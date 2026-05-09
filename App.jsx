import React, { useState } from 'react';
import { Search, Sun, Cloud, Wind, Droplets, SunDim, Thermometer } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const hourlyData =[
  { time: '12 AM', temp: 16 }, { time: '4 AM', temp: 14 },
  { time: '8 AM', temp: 18 }, { time: '12 PM', temp: 24 },
  { time: '4 PM', temp: 26 }, { time: '8 PM', temp: 21 }
];

export default function App() {
  const[searchQuery, setSearchQuery] = useState('');
  
  // StealthSafe Unlock Logic State
  const[isUnlocked, setIsUnlocked] = useState(false);
  const [sunTapped, setSunTapped] = useState(false);

  // F-02: Sun -> Cloud unlock sequence (1.5 second window)
  const handleSunClick = () => {
    setSunTapped(true);
    // Reset the tap window after 1.5 seconds
    setTimeout(() => {
      setSunTapped(false);
    }, 1500);
  };

  const handleCloudClick = () => {
    if (sunTapped) {
      setIsUnlocked(true); // Vault Unlocked!
    } else {
      console.log("Cloud tapped, but Sun wasn't tapped first.");
    }
  };

  // -----------------------------------------
  // LAYER 2: THE VAULT (Placeholder)
  // -----------------------------------------
  if (isUnlocked) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="min-h-screen bg-gray-900 text-white p-6 font-sans flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">StealthSafe Vault</h1>
          <p className="text-gray-400 mb-8">You have successfully triggered the secret gesture.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-red-500 transition-colors">Fake Call</button>
            <button className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-red-500 transition-colors">Record Audio</button>
            <button className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-red-500 transition-colors">Safe Places</button>
            <button className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-red-500 transition-colors">Alert Contact</button>
          </div>

          <button 
            onClick={() => setIsUnlocked(false)} 
            className="mt-12 text-sm text-gray-500 underline"
          >
            Lock Vault & Return to Weather
          </button>
        </div>
      </motion.div>
    );
  }

  // -----------------------------------------
  // LAYER 1: DECOY WEATHER
  // -----------------------------------------
  return (
    <AnimatePresence>
      <motion.div 
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 text-white p-5 font-sans flex justify-center"
      >
        <div className="w-full max-w-md">
          
          {/* Search Bar */}
          <div className="flex items-center bg-white/20 rounded-2xl px-4 py-3 mb-8 backdrop-blur-md">
            <Search size={20} className="text-white/80" />
            <input 
              type="text" 
              placeholder="Search city or zip code..." 
              className="bg-transparent border-none outline-none ml-3 w-full text-white placeholder-white/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Main Weather Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold mb-2 shadow-sm">Kochi</h1>
            <p className="text-lg text-white/90 mb-4">Partly Cloudy</p>
            
            <div className="flex justify-center items-center gap-6">
              {/* STEP 1: SUN ICON */}
              <motion.div whileTap={{ scale: 0.8 }}>
                <Sun 
                  className={`w-20 h-20 cursor-pointer drop-shadow-lg transition-colors duration-300 ${sunTapped ? 'text-yellow-100' : 'text-yellow-300'}`}
                  onClick={handleSunClick} 
                  fill="currentColor"
                />
              </motion.div>
              
              <span className="text-7xl font-light tracking-tighter">26°</span>
              
              {/* STEP 2: CLOUD ICON */}
              <motion.div whileTap={{ scale: 0.8 }}>
                <Cloud 
                  className="text-white/90 w-16 h-16 cursor-pointer drop-shadow-md mt-4" 
                  onClick={handleCloudClick} 
                  fill="currentColor"
                />
              </motion.div>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="bg-white/10 rounded-3xl p-4 mb-6 backdrop-blur-md">
            <h2 className="text-sm font-medium text-white/80 mb-4 uppercase tracking-wider">Today's Temp</h2>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                  <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} fillOpacity={0.3} fill="#fbbf24" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md flex flex-col justify-between h-28">
              <div className="flex items-center text-white/70 text-sm"><Wind size={16} className="mr-2"/> Wind</div>
              <div className="text-2xl font-semibold">12 km/h</div>
            </div>
            <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md flex flex-col justify-between h-28">
              <div className="flex items-center text-white/70 text-sm"><Droplets size={16} className="mr-2"/> Humidity</div>
              <div className="text-2xl font-semibold">68%</div>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}