"use client";
import React from "react";
import Layout from "../componets/layout";
import { FiClock, FiUsers, FiUserCheck } from 'react-icons/fi';

const StudentDashboard: React.FC = () => {
  // Sample data for line chart - study hours by month
  const studyHoursData = [5, 8, 12, 10, 15, 13];
  const months = ["1", "2", "3", "4", "5", "6"];
  const maxY = 20;
  const chartHeight = 200;
  const chartWidth = 300;
  const points = studyHoursData.map((v, i) => {
    const x = (i * (chartWidth / (studyHoursData.length - 1)));
    const y = chartHeight - (v / maxY) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // Data for bar chart - male tutor matching
  const maleMatchingData = [2, 3, 1, 4];
  const matchingLabels = ["Jan", "Feb", "Mar", "Apr"];
  const maxBar = 5;
  const barChartHeight = 200;
  const barWidth = 40;
  const barGap = 30;

  // Overview data
  const statsData = [
    { title: "Total Time", value: "63h", icon: <FiClock size={24} />, color: "bg-blue-500" },
    { title: "Matchings", value: "8", icon: <FiUsers size={24} />, color: "bg-green-500" },
    { title: "Male Tutor Matchings", value: "5", icon: <FiUserCheck size={24} />, color: "bg-purple-500" },
  ];

  return (
    <Layout activeMenu="dashboard">
      <div className="p-6 bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
          <div className="bg-gray-800 rounded-md px-3 py-1">
            <span className="text-gray-400">Semester: Spring 2025</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {statsData.map((stat, index) => (
            <div key={index} className={`bg-gray-800 p-4 rounded-lg border-l-4`} style={{ borderLeftColor: stat.color.replace('bg-', '#') }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-300 text-sm">{stat.title}</p>
                  <p className="text-white text-xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg bg-opacity-20`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Line chart - Total Time */}
          <div className="bg-gray-800 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4 text-white">Total Study Time (Hours)</h2>
            <div className="relative" style={{height: chartHeight+40}}>
              <svg width={chartWidth} height={chartHeight} className="bg-gray-900 border-l border-b border-gray-700">
                {/* Grid lines */}
                {[0, 5, 10, 15, 20].map(y => (
                  <React.Fragment key={y}>
                    <line 
                      x1="0" 
                      y1={chartHeight - (y/maxY)*chartHeight} 
                      x2={chartWidth} 
                      y2={chartHeight - (y/maxY)*chartHeight} 
                      stroke="#374151" 
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    <text 
                      x={-5} 
                      y={chartHeight - (y/maxY)*chartHeight + 5} 
                      fontSize="12" 
                      fill="#ccc" 
                      textAnchor="end"
                    >
                      {y}
                    </text>
                  </React.Fragment>
                ))}
                
                {months.map((m,i) => (
                  <text key={m} x={i*(chartWidth/(months.length-1))} y={chartHeight+15} fontSize="12" fill="#ccc" textAnchor="middle">{m}</text>
                ))}
                
                {/* Fill area under the line */}
                <path 
                  d={`M 0,${chartHeight} ${points} ${chartWidth},${chartHeight} Z`} 
                  fill="#4ADE80"
                  fillOpacity="0.1"
                />
                
                <polyline fill="none" stroke="#4ADE80" strokeWidth="2" points={points} />
                
                {studyHoursData.map((v,i) => {
                  const x = (i * (chartWidth / (studyHoursData.length - 1)));
                  const y = chartHeight - (v / maxY) * chartHeight;
                  return <circle key={i} cx={x} cy={y} r="4" fill="#4ADE80" />;
                })}
              </svg>
              <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 text-xs text-gray-400 rotate-[-90deg]">Study hours</div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] text-xs text-gray-400">Month</div>
            </div>
          </div>
          
          {/* Bar chart - Male Tutor Matching */}
          <div className="bg-gray-800 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4 text-white">Tutor Matchings</h2>
            <div className="relative" style={{height: barChartHeight+40, width: 4*barWidth+3*barGap+40}}>
              <svg width={4*barWidth+3*barGap+40} height={barChartHeight} className="bg-gray-900 border-l border-b border-gray-700">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(y => (
                  <React.Fragment key={y}>
                    <line 
                      x1="0" 
                      y1={barChartHeight - (y/maxBar)*barChartHeight} 
                      x2={4*barWidth+3*barGap+40} 
                      y2={barChartHeight - (y/maxBar)*barChartHeight} 
                      stroke="#374151" 
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    <text 
                      x={-5} 
                      y={barChartHeight - (y/maxBar)*barChartHeight + 5} 
                      fontSize="12" 
                      fill="#ccc" 
                      textAnchor="end"
                    >
                      {y}
                    </text>
                  </React.Fragment>
                ))}
                
                {maleMatchingData.map((v,i) => {
                  const x = 40 + i*(barWidth+barGap);
                  const y = barChartHeight - (v / maxBar) * barChartHeight;
                  return (
                    <g key={i}>
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={(v / maxBar) * barChartHeight} 
                        fill={["#60A5FA", "#10B981", "#8B5CF6", "#F59E0B"][i % 4]} 
                      />
                      <text 
                        x={x+barWidth/2} 
                        y={y-5} 
                        fontSize="12" 
                        fill="white" 
                        textAnchor="middle"
                      >
                        {v}
                      </text>
                      <text 
                        x={x+barWidth/2} 
                        y={barChartHeight+15} 
                        fontSize="12" 
                        fill="#ccc" 
                        textAnchor="middle"
                      >
                        {matchingLabels[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 text-xs text-gray-400 rotate-[-90deg]">Tutor matchings</div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] text-xs text-gray-400">Month</div>
            </div>
          </div>

          {/* Matching history */}
          <div className="bg-gray-800 rounded-lg p-5 col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-white">Recent Matching History</h2>
            <div className="space-y-3">
              {[
                { tutor: "Thomas Anderson", date: "20/04/2025", topic: "Mathematics" },
                { tutor: "James Wilson", date: "15/04/2025", topic: "Physics" },
                { tutor: "Robert Johnson", date: "10/04/2025", topic: "Chemistry" },
                { tutor: "Michael Smith", date: "05/04/2025", topic: "English" }
              ].map((match, i) => (
                <div key={i} className="p-3 bg-gray-700 rounded-md flex justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{match.tutor}</p>
                    <p className="text-xs text-gray-400">{match.topic} - {match.date}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-300 text-xs rounded">Tutor</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
