'use client';

import { ExerciseStats } from '@/lib/types/exercise';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Clock, TrendingUp, Target, Award, Flame } from 'lucide-react';

interface ExerciseStatsDisplayProps {
  stats: ExerciseStats;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ExerciseStatsDisplay({ stats }: ExerciseStatsDisplayProps) {
  // Prepare data for charts
  const exerciseTypeData = Object.entries(stats.exercisesByType).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / stats.totalExercises) * 100)
  }));

  const weeklyData = stats.weeklyData || [];

  const intensityData = Object.entries(stats.intensityDistribution).map(([intensity, count]) => ({
    intensity,
    count,
    percentage: Math.round((count / stats.totalExercises) * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Exercises</p>
              <p className="text-3xl font-bold">{stats.totalExercises}</p>
              <p className="text-blue-100 text-sm mt-1">All time</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Duration</p>
              <p className="text-3xl font-bold">{stats.totalDuration}</p>
              <p className="text-green-100 text-sm mt-1">Minutes</p>
            </div>
            <Clock className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Current Streak</p>
              <p className="text-3xl font-bold">{stats.currentStreak}</p>
              <p className="text-orange-100 text-sm mt-1">Days</p>
            </div>
            <Flame className="w-10 h-10 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Weekly Goal</p>
              <p className="text-3xl font-bold">{stats.weeklyGoalProgress}%</p>
              <p className="text-purple-100 text-sm mt-1">Progress</p>
            </div>
            <Target className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-semibold text-gray-900">{stats.longestStreak} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Duration</span>
              <span className="font-semibold text-gray-900">
                {stats.totalExercises > 0 ? Math.round(stats.totalDuration / stats.totalExercises) : 0} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold text-gray-900">{stats.exercisesThisWeek} exercises</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">{stats.exercisesThisMonth} exercises</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last 7 Days</span>
              <span className="font-semibold text-gray-900">
                {weeklyData.slice(-7).reduce((sum, day) => sum + day.exercises, 0)} exercises
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Weekly Average</span>
              <span className="font-semibold text-gray-900">
                {weeklyData.length > 0 ? Math.round(weeklyData.reduce((sum, day) => sum + day.exercises, 0) / Math.min(weeklyData.length, 7)) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goal Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Target: 5 exercises/week</span>
              <span className="font-medium text-gray-900">{stats.exercisesThisWeek}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.weeklyGoalProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">
              {stats.weeklyGoalProgress >= 100 ? '🎉 Goal achieved!' : `${5 - stats.exercisesThisWeek} more to reach your goal`}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Types Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Types</h3>
          {exerciseTypeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exerciseTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {exerciseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} exercises`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No exercise data available
            </div>
          )}
          
          {/* Legend */}
          {exerciseTypeData.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {exerciseTypeData.map((entry, index) => (
                <div key={entry.type} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.type}</span>
                  <span className="text-sm font-medium text-gray-900">({entry.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
          {weeklyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} exercises`, 'Exercises']}
                  />
                  <Bar dataKey="exercises" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No weekly data available
            </div>
          )}
        </div>

        {/* Intensity Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Intensity Distribution</h3>
          {intensityData.length > 0 ? (
            <div className="space-y-3">
              {intensityData.map((item, index) => (
                <div key={item.intensity} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.intensity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500">
              No intensity data available
            </div>
          )}
        </div>

        {/* Duration Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration Trend</h3>
          {weeklyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} minutes`, 'Duration']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No duration data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}