"use client";

import React from "react";

interface User {
  _id: string;
  id: string;
  name: string;
  role: string;
  email: string;
  major?: string;
}

interface DashboardData {
  totalContributions?: number;
  submissions?: number;
  comments?: number;
  monthlyMatches?: number[];
  monthlyMessages?: number[];
  userStats?: {
    name: string;
    messageCount: number;
  }[];
}

interface PopupDashboardProps {
  user: User;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  onClose: () => void;
}

const PopupDashboard: React.FC<PopupDashboardProps> = ({
  user,
  dashboardData,
  isLoading,
  onClose,
}) => {
  // Line chart dimensions and settings
  const chartHeight = 200;
  const chartWidth = 400;
  const months = ["1", "2", "3", "4", "5", "6"];
  const matchData = dashboardData?.monthlyMatches || [1, 2, 2, 2, 1, 3];
  const maxY = Math.max(...matchData, 3); // Ensure at least 3 for scale

  // Create points for line chart
  const points = matchData.map((v, i) => {
    const x = (i * (chartWidth / (matchData.length - 1)));
    const y = chartHeight - (v / maxY) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // Bar chart dimensions and settings
  const barChartHeight = 200;
  const barWidth = 40;
  const barGap = 30;
  const userStats = dashboardData?.userStats || [
    { name: "Kiet", messageCount: 125 },
    { name: "Cuong", messageCount: 85 },
    { name: "Huy", messageCount: 65 }
  ];
  const maxBarValue = Math.max(...userStats.map(stat => stat.messageCount), 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 md:w-4/5 lg:w-3/4 max-h-[90vh] overflow-y-auto">
        {/* Header popup */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="mr-2 text-black">{user.name} Dashboard</span>
            <span className="text-sm bg-blue-600 text-white px-2 py-0.5 rounded">
              {user.role === 'student' ? 'Student' : 'Tutor'}
            </span>
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Close dashboard"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        {/* Dashboard content */}
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 bg-blue-600 text-white px-3 py-1 rounded inline-block">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-black"><span className="font-medium">Name:</span> {user.name}</p>
                  <p className="text-black"><span className="font-medium">Email:</span> {user.email}</p>
                </div>
                <div>
                  
                  {user.major && <p className="text-black"><span className="font-medium">Major:</span> {user.major}</p>}
                </div>
              </div>
            </div>
            
            {/* Statistics Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 bg-blue-600 text-white px-3 py-1 rounded inline-block">Activity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-blue-600 font-medium">Total Contributions</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardData?.totalContributions || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-blue-600 font-medium">Submissions</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardData?.submissions || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-blue-600 font-medium">Comments</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardData?.comments || 0}</p>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart - Monthly Match Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Monthly Match Statistics</h3>
                <div className="relative bg-white p-4 rounded-lg" style={{height: chartHeight + 60}}>
                  <svg width={chartWidth} height={chartHeight} className="bg-transparent">
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6"/>
                        <stop offset="100%" stopColor="#60A5FA"/>
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {Array.from({length: maxY + 1}).map((_, y) => (
                      <React.Fragment key={`grid-${y}`}>
                        <line 
                          x1="0" 
                          y1={chartHeight - (y/maxY)*chartHeight} 
                          x2={chartWidth} 
                          y2={chartHeight - (y/maxY)*chartHeight} 
                          stroke="#E5E7EB" 
                          strokeWidth="1"
                          strokeDasharray={y === 0 ? "" : "3,3"}
                        />
                        <text 
                          x="-5" 
                          y={chartHeight - (y/maxY)*chartHeight + 5} 
                          fontSize="12" 
                          fill="#6B7280" 
                          textAnchor="end"
                        >
                          {y}
                        </text>
                      </React.Fragment>
                    ))}
                    
                    {/* Month labels */}
                    {months.map((m, i) => (
                      <text 
                        key={`month-${m}`} 
                        x={i*(chartWidth/(months.length-1))} 
                        y={chartHeight + 20} 
                        fontSize="12" 
                        fill="#6B7280" 
                        textAnchor="middle"
                      >
                        {m}
                      </text>
                    ))}

                    {/* Fill area under line */}
                    <path 
                      d={`M 0,${chartHeight} ${points} ${chartWidth},${chartHeight} Z`} 
                      fill="url(#blueGradient)"
                    />
                    
                    {/* Line */}
                    <polyline 
                      fill="none" 
                      stroke="url(#lineGradient)" 
                      strokeWidth="2" 
                      points={points} 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Points */}
                    {matchData.map((v, i) => {
                      const x = (i * (chartWidth / (matchData.length - 1)));
                      const y = chartHeight - (v / maxY) * chartHeight;
                      return (
                        <g key={`point-${i}`}>
                          <circle cx={x} cy={y} r="5" fill="#1E40AF" />
                          <circle cx={x} cy={y} r="3" fill="#3B82F6" />
                        </g>
                      );
                    })}
                  </svg>
                  <div className="text-xs text-gray-500 text-center mt-4">Number of {user.role === 'student' ? 'student' : 'tutor'} matches per month</div>
                </div>
              </div>
              
              {/* Bar Chart - Message Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Message Statistics</h3>
                <div className="relative bg-white p-4 rounded-lg" style={{height: barChartHeight + 60}}>
                  <svg width="100%" height={barChartHeight} className="bg-transparent">
                    <defs>
                      {userStats.map((_, i) => (
                        <linearGradient key={`barGradient-${i}`} id={`barGradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={['#3B82F6', '#10B981', '#8B5CF6'][i % 3]} stopOpacity="1"/>
                          <stop offset="100%" stopColor={['#3B82F6', '#10B981', '#8B5CF6'][i % 3]} stopOpacity="0.6"/>
                        </linearGradient>
                      ))}
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                      <React.Fragment key={`bar-grid-${y}`}>
                        <line 
                          x1="40" 
                          y1={barChartHeight - (y/maxBarValue)*barChartHeight} 
                          x2="95%" 
                          y2={barChartHeight - (y/maxBarValue)*barChartHeight} 
                          stroke="#E5E7EB" 
                          strokeWidth="1"
                          strokeDasharray={y === 0 ? "" : "3,3"}
                        />
                        <text 
                          x="35" 
                          y={barChartHeight - (y/maxBarValue)*barChartHeight + 5} 
                          fontSize="12" 
                          fill="#6B7280" 
                          textAnchor="end"
                        >
                          {y}
                        </text>
                      </React.Fragment>
                    ))}

                    {/* Bars */}
                    {userStats.map((stat, i) => {
                      const totalBars = userStats.length;
                      const totalWidth = chartWidth - 60; // Account for axis labels
                      const dynamicBarWidth = Math.min(50, totalWidth / totalBars - 20);
                      const x = 50 + i * (totalWidth / totalBars);
                      const y = barChartHeight - (stat.messageCount / maxBarValue) * barChartHeight;
                      const height = (stat.messageCount / maxBarValue) * barChartHeight;
                      
                      return (
                        <g key={`bar-${i}`}>
                          <rect 
                            x={x - dynamicBarWidth/2} 
                            y={y} 
                            width={dynamicBarWidth} 
                            height={height}
                            rx="3"
                            fill={`url(#barGradient-${i})`} 
                            className="hover:opacity-90 transition-all"
                          />
                          <text 
                            x={x} 
                            y={y - 10} 
                            fontSize="12" 
                            fill="#374151" 
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {stat.messageCount}
                          </text>
                          <text 
                            x={x} 
                            y={barChartHeight + 15} 
                            fontSize="12" 
                            fill="#6B7280" 
                            textAnchor="middle"
                          >
                            {stat.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="text-xs text-gray-500 text-center mt-4">Messages received in last month</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupDashboard;