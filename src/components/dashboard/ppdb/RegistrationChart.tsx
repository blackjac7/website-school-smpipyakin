"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface MonthlyStat {
  name: string;
  Total: number;
  Diterima: number;
  Pending: number;
  Ditolak: number;
}

interface RegistrationChartProps {
  data: MonthlyStat[];
}

export default function RegistrationChart({ data }: RegistrationChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-gray-400">
        Belum ada data pendaftaran
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{fontSize: 12, fill: '#6B7280'}}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
             tick={{fontSize: 12, fill: '#6B7280'}}
             axisLine={false}
             tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{paddingTop: '20px'}} />
          <Area
            type="monotone"
            dataKey="Total"
            name="Total Pendaftar"
            stroke="#F59E0B"
            fillOpacity={1}
            fill="url(#colorTotal)"
            strokeWidth={2}
          />
           <Area
            type="monotone"
            dataKey="Diterima"
            name="Siswa Diterima"
            stroke="#10B981"
            fillOpacity={1}
            fill="url(#colorAccepted)"
             strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
