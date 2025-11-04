'use client';

import { ChartDataPoint } from '@/lib/types/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Utensils, Droplets, Weight } from 'lucide-react';

interface HealthChartProps {
  data: ChartDataPoint[];
  chartType?: 'overview' | 'exercise' | 'nutrition' | 'hydration';
  onChartTypeChange?: (type: 'overview' | 'exercise' | 'nutrition' | 'hydration') => void;
  isLoading?: boolean;
  className?: string;
}

interface ChartTypeButtonProps {
  type: 'overview' | 'exercise' | 'nutrition' | 'hydration';
  isSelected: boolean;
  onClick: (type: 'overview' | 'exercise' | 'nutrition' | 'hydration') => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}

function ChartTypeButton({ 
  type, 
  isSelected, 
  onClick, 
  icon, 
  label, 
  color 
}: ChartTypeButtonProps) {
  return (
    <button
      onClick={() => onClick(type)}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200 hover:scale-105
        ${isSelected 
          ? `${color} text-white shadow-md` 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-8 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="h-80 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {entry.value}
              {entry.dataKey === 'hydration' ? 'L' : 
               entry.dataKey === 'nutrition' ? '×100 cal' : 
               entry.dataKey === 'weight' ? 'kg' : 'min'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function HealthChart({ 
  data, 
  chartType = 'overview',
  onChartTypeChange,
  isLoading = false, 
  className = '' 
}: HealthChartProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const chartTypes = [
    { 
      type: 'overview' as const, 
      label: 'Overview', 
      icon: <Activity className="w-4 h-4" />, 
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600' 
    },
    { 
      type: 'exercise' as const, 
      label: 'Exercise', 
      icon: <Activity className="w-4 h-4" />, 
      color: 'bg-gradient-to-r from-green-500 to-emerald-600' 
    },
    { 
      type: 'nutrition' as const, 
      label: 'Nutrition', 
      icon: <Utensils className="w-4 h-4" />, 
      color: 'bg-gradient-to-r from-orange-500 to-red-600' 
    },
    { 
      type: 'hydration' as const, 
      label: 'Hydration', 
      icon: <Droplets className="w-4 h-4" />, 
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600' 
    }
  ];

  const renderOverviewChart = () => (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="exerciseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="nutritionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="hydrationGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="exercise"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#exerciseGradient)"
          name="Exercise (min)"
        />
        <Area
          type="monotone"
          dataKey="nutrition"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#nutritionGradient)"
          name="Nutrition (×100 cal)"
        />
        <Area
          type="monotone"
          dataKey="hydration"
          stroke="#06b6d4"
          strokeWidth={2}
          fill="url(#hydrationGradient)"
          name="Hydration (L)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderSingleMetricChart = () => {
    const metricConfig = {
      exercise: { key: 'exercise', color: '#10b981', name: 'Exercise (min)' },
      nutrition: { key: 'nutrition', color: '#f59e0b', name: 'Nutrition (×100 cal)' },
      hydration: { key: 'hydration', color: '#06b6d4', name: 'Hydration (L)' }
    };

    const config = metricConfig[chartType as keyof typeof metricConfig];
    if (!config) return renderOverviewChart();

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={config.key}
            stroke={config.color}
            strokeWidth={3}
            dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
            name={config.name}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Health Trends</h3>
        <div className="flex space-x-2">
          {chartTypes.map((type) => (
            <ChartTypeButton
              key={type.type}
              type={type.type}
              isSelected={chartType === type.type}
              onClick={onChartTypeChange || (() => {})}
              icon={type.icon}
              label={type.label}
              color={type.color}
            />
          ))}
        </div>
      </div>

      <div className="h-80">
        {chartType === 'overview' ? renderOverviewChart() : renderSingleMetricChart()}
      </div>
    </div>
  );
}

export default HealthChart;