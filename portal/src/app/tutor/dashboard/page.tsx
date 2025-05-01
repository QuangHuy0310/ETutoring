"use client";
import React from "react";
import Layout from "../../componets/layout";
import { FiClock, FiUsers, FiUserCheck, FiFileText, FiMessageSquare } from 'react-icons/fi';

const TutorDashboard: React.FC = () => {
  // Sample data for line chart - matching data
  const matchData = [1, 3, 3, 3, 2, 5];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const maxY = 5;
  const chartHeight = 200;
  const chartWidth = 300;

  // Create gradient for line chart
  const gradientId = "blueGradient";

  const points = matchData.map((v, i) => {
    const x = (i * (chartWidth / (matchData.length - 1)));
    const y = chartHeight - (v / maxY) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // Data for bar chart - messages received
  const barData = [110, 85, 65];
  const barLabels = ["Type 1", "Type 2", "Type 3"];
  const maxBar = 120;
  const barChartHeight = 200;
  const barWidth = 40;
  const barGap = 30;

  // Overview data - using the activity summary from the image
  const overviewData = [
    { title: "Total Contributions", value: "62", icon: <FiFileText size={24} />, color: "bg-blue-600" },
    { title: "Submissions", value: "43", icon: <FiFileText size={24} />, color: "bg-blue-600" },
    { title: "Comments", value: "8", icon: <FiMessageSquare size={24} />, color: "bg-blue-600" },
  ];

  return (
    <Layout activeMenu="dashboard">
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Tutor Dashboard</h1>
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Tutor</span>
          </div>
          <button className="text-gray-400 text-xl">
            <span>×</span>
          </button>
        </div>

        
        {/* Activity Summary */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
          <div className="bg-blue-600 text-white rounded px-4 py-1 mb-4 inline-block">
            <span>Activity Summary</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {overviewData.map((item, index) => (
              <div key={index} className="bg-gray-700 rounded-xl p-4 text-center shadow-lg">
                <div className="text-blue-400 font-medium">{item.title}</div>
                <div className="text-2xl font-bold text-blue-400">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line chart */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Monthly Matchings</h2>
            </div>
            <div className="relative" style={{height: chartHeight+40}}>
              <svg width={chartWidth} height={chartHeight} className="bg-transparent">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(y => (
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
                  </React.Fragment>
                ))}
                
                {/* Fill area under line */}
                <path 
                  d={`M 0,${chartHeight} ${points} ${chartWidth},${chartHeight} Z`} 
                  fill={`url(#${gradientId})`}
                />
                
                {/* Line */}
                <polyline 
                  fill="none" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
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
                      <circle cx={x} cy={y} r="5" fill="#3B82F6" />
                      <circle cx={x} cy={y} r="3" fill="#FFFFFF" />
                    </g>
                  );
                })}
              </svg>
              <div className="text-sm text-gray-400 text-center mt-2">Number of tutor matches per month</div>
            </div>
          </div>
          
          {/* Bar chart */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Messages Received</h2>
            </div>
            <div className="relative" style={{height: barChartHeight+40}}>
              <svg width="100%" height={barChartHeight} className="bg-transparent">
                <defs>
                  <linearGradient id="bar1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="bar2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="bar3Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[0, 30, 60, 90, 120].map(y => (
                  <React.Fragment key={`bar-grid-${y}`}>
                    <line 
                      x1="40" 
                      y1={barChartHeight - (y/maxBar)*barChartHeight} 
                      x2="100%" 
                      y2={barChartHeight - (y/maxBar)*barChartHeight} 
                      stroke="#374151" 
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                    <text 
                      x="35" 
                      y={barChartHeight - (y/maxBar)*barChartHeight + 5} 
                      fontSize="10" 
                      fill="#9CA3AF" 
                      textAnchor="end"
                    >
                      {y}
                    </text>
                  </React.Fragment>
                ))}

                {/* Bars */}
                {barData.map((v, i) => {
                  const barSpace = (chartWidth - 40) / 3;
                  const x = 60 + i * barSpace;
                  const y = barChartHeight - (v / maxBar) * barChartHeight;
                  const height = (v / maxBar) * barChartHeight;
                  const gradientIds = ["url(#bar1Gradient)", "url(#bar2Gradient)", "url(#bar3Gradient)"];
                  
                  return (
                    <g key={`bar-${i}`}>
                      <rect 
                        x={x - barWidth/2} 
                        y={y} 
                        width={barWidth} 
                        height={height}
                        rx="4"
                        fill={gradientIds[i]}
                      />
                      <text 
                        x={x} 
                        y={y - 10} 
                        fontSize="12" 
                        fill="white" 
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {v}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="text-sm text-gray-400 text-center mt-2">Messages received in last month</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorDashboard;
