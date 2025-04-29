"use client";
import React from "react";
import Layout from "../../componets/layout";
import { FiClock, FiUsers, FiUserCheck } from 'react-icons/fi';

const TutorDashboard: React.FC = () => {
  // Sample data for line chart - matching data
  const matchData = [1, 2, 2, 2, 1, 3];
  const months = ["1", "2", "3", "4", "5", "6"];
  const maxY = 3;
  const chartHeight = 200;
  const chartWidth = 300;

  // Create gradient for line chart
  const gradientId = "blueGradient";

  const points = matchData.map((v, i) => {
    const x = (i * (chartWidth / (matchData.length - 1)));
    const y = chartHeight - (v / maxY) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // Data for bar chart - male tutor matching
  const barData = [2, 3, 1, 4];
  const barLabels = ["Jan", "Feb", "Mar", "Apr"];
  const maxBar = 5;
  const barChartHeight = 200;
  const barWidth = 40;
  const barGap = 30;

  // Overview data
  const overviewData = [
    { title: "Total Time", value: "124h", icon: <FiClock size={24} />, color: "bg-blue-600" },
    { title: "Matchings", value: "18", icon: <FiUsers size={24} />, color: "bg-green-600" },
    { title: "Male Tutor Matchings", value: "12", icon: <FiUserCheck size={24} />, color: "bg-purple-600" },
  ];

  return (
    <Layout activeMenu="dashboard">
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Tutor Dashboard</h1>
          <div className="bg-gray-800 rounded-md px-4 py-2">
            <span className="text-gray-400 text-sm">April, 2025</span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {overviewData.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border-l-4 shadow-lg transition-all hover:translate-y-[-5px] hover:shadow-xl" style={{ borderLeftColor: item.color.replace('bg-', '#') }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{item.title}</p>
                  <h3 className="text-white text-2xl font-bold">{item.value}</h3>
                </div>
                <div className={`${item.color} p-3 rounded-lg bg-opacity-20`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line chart */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Monthly Matchings</h2>
              <select className="bg-gray-700 text-white text-sm rounded-md px-3 py-1 border border-gray-600">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
              </select>
            </div>
            <div className="relative" style={{height: chartHeight+40}}>
              <svg width={chartWidth} height={chartHeight} className="bg-transparent">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60A5FA"/>
                    <stop offset="100%" stopColor="#3B82F6"/>
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0,1,2,3].map(y => (
                  <React.Fragment key={`grid-${y}`}>
                    <line 
                      x1="0" 
                      y1={chartHeight - (y/maxY)*chartHeight} 
                      x2={chartWidth} 
                      y2={chartHeight - (y/maxY)*chartHeight} 
                      stroke="#374151" 
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                    <text 
                      x="-5" 
                      y={chartHeight - (y/maxY)*chartHeight + 5} 
                      fontSize="12" 
                      fill="#9CA3AF" 
                      textAnchor="end"
                    >
                      {y}
                    </text>
                  </React.Fragment>
                ))}
                
                {months.map((m,i) => (
                  <text 
                    key={`month-${m}`} 
                    x={i*(chartWidth/(months.length-1))} 
                    y={chartHeight+20} 
                    fontSize="12" 
                    fill="#9CA3AF" 
                    textAnchor="middle"
                  >
                    {m}
                  </text>
                ))}

                {/* Fill area under line */}
                <path 
                  d={`M 0,${chartHeight} ${points} ${chartWidth},${chartHeight} Z`} 
                  fill={`url(#${gradientId})`}
                />
                
                {/* Line */}
                <polyline 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3" 
                  points={points} 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Points */}
                {matchData.map((v,i) => {
                  const x = (i * (chartWidth / (matchData.length - 1)));
                  const y = chartHeight - (v / maxY) * chartHeight;
                  return (
                    <g key={`point-${i}`}>
                      <circle cx={x} cy={y} r="6" fill="#1E40AF" />
                      <circle cx={x} cy={y} r="4" fill="#3B82F6" />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 text-xs text-gray-400 rotate-[-90deg]">Number of matchings</div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] text-xs text-gray-400">Month</div>
            </div>
          </div>
          
          {/* Bar chart */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white"> Tutor Matchings</h2>
              <select className="bg-gray-700 text-white text-sm rounded-md px-3 py-1 border border-gray-600">
                <option>This week</option>
                <option>This month</option>
              </select>
            </div>
            <div className="relative" style={{height: barChartHeight+40, width: 4*barWidth+3*barGap+40}}>
              <svg width={4*barWidth+3*barGap+40} height={barChartHeight} className="bg-transparent">
                <defs>
                  {barLabels.map((_, i) => (
                    <linearGradient key={`barGradient-${i}`} id={`barGradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][i % 4]} stopOpacity="1"/>
                      <stop offset="100%" stopColor={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][i % 4]} stopOpacity="0.6"/>
                    </linearGradient>
                  ))}
                </defs>
                
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(y => (
                  <React.Fragment key={`bar-grid-${y}`}>
                    <line 
                      x1="30" 
                      y1={barChartHeight - (y/maxBar)*barChartHeight} 
                      x2={4*barWidth+3*barGap+40} 
                      y2={barChartHeight - (y/maxBar)*barChartHeight} 
                      stroke="#374151" 
                      strokeWidth="1"
                      strokeDasharray={y === 0 ? "" : "5,5"}
                    />
                    <text 
                      x="25" 
                      y={barChartHeight - (y/maxBar)*barChartHeight + 5} 
                      fontSize="12" 
                      fill="#9CA3AF" 
                      textAnchor="end"
                    >
                      {y}
                    </text>
                  </React.Fragment>
                ))}

                {/* Bars with animation */}
                {barData.map((v, i) => {
                  const x = 40 + i*(barWidth+barGap);
                  const y = barChartHeight - (v / maxBar) * barChartHeight;
                  const height = (v / maxBar) * barChartHeight;
                  
                  return (
                    <g key={`bar-${i}`}>
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={height}
                        rx="4"
                        fill={`url(#barGradient-${i})`} 
                        className="hover:brightness-125 transition-all cursor-pointer"
                      />
                      <text 
                        x={x + barWidth/2} 
                        y={y - 10} 
                        fontSize="12" 
                        fill="white" 
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {v}
                      </text>
                      <text 
                        x={x + barWidth/2} 
                        y={barChartHeight + 15} 
                        fontSize="12" 
                        fill="#9CA3AF" 
                        textAnchor="middle"
                      >
                        {barLabels[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 text-xs text-gray-400 rotate-[-90deg]">Total tutor matchings</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorDashboard;
