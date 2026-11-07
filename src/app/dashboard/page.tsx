'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Users,
  Activity,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  Calendar,
  Building,
  HeartPulse,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/common/StatCard';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';
import api from '@/lib/api';

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppLayout
      title="Administrative Dashboard"
      subtitle="Comprehensive clinical metrics, doctor workload, and patient distribution"
    >
      <div className="space-y-8">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Operational Overview
            </h3>
            <p className="text-xs text-slate-500">
              Real-time aggregated health statistics from MongoDB pipeline
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
              />
              <span>Refresh Analytics</span>
            </button>
            <Link
              href="/doctors"
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </Link>
          </div>
        </div>

        {/* 1. KPI Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Doctors"
              value={data?.kpi?.totalDoctors || 0}
              subtitle="Registered medical staff"
              icon={Stethoscope}
              colorScheme="emerald"
              trend={{ value: '+100% active', isPositive: true }}
            />
            <StatCard
              title="Total Patients"
              value={data?.kpi?.totalPatients || 0}
              subtitle="Recorded in system"
              icon={Users}
              colorScheme="blue"
              trend={{ value: 'Live tracking', isPositive: true }}
            />
            <StatCard
              title="Active Treatment"
              value={data?.kpi?.activePatients || 0}
              subtitle="Under active clinical care"
              icon={Activity}
              colorScheme="purple"
            />
            <StatCard
              title="Avg Patients / Doctor"
              value={data?.kpi?.avgPatientsPerDoctor || 0}
              subtitle="Workload load balance"
              icon={TrendingUp}
              colorScheme="amber"
            />
          </div>
        )}

        {/* 2. Visual Analytics Section: Patients per Doctor & Date-based Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patients per Doctor Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Patients per Doctor
                </h4>
                <p className="text-xs text-slate-500">
                  Patient load allocation across top doctors
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-lg">
                Workload
              </span>
            </div>

            <div className="h-72 w-full mt-2">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading workload chart...
                </div>
              ) : data?.patientsPerDoctor?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.patientsPerDoctor}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="doctorName"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#34d399' }}
                    />
                    <Bar
                      dataKey="patientCount"
                      name="Assigned Patients"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No patient workload data recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Date-Based Statistics: Timeline Area Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Date-Based Statistics
                </h4>
                <p className="text-xs text-slate-500">
                  Monthly trend of patient admissions & registrations
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 rounded-lg flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Trends
              </span>
            </div>

            <div className="h-72 w-full mt-2">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading trend chart...
                </div>
              ) : data?.dateTrends?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.dateTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="patientTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="doctorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="patients"
                      name="Patient Admissions"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#patientTrend)"
                    />
                    <Area
                      type="monotone"
                      dataKey="doctors"
                      name="Doctors Joined"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#doctorTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No date trends available yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Condition & Specialization Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Condition Distribution Donut */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Patient Conditions
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Distribution by diagnosed medical condition
            </p>

            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading conditions...
                </div>
              ) : data?.conditionDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.conditionDistribution}
                      dataKey="count"
                      nameKey="condition"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {data.conditionDistribution.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No conditions recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Department / Specialization List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Specialization Overview
                </h4>
                <p className="text-xs text-slate-500">
                  Doctor representation across medical specialties
                </p>
              </div>
              <Link
                href="/doctors"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View All Doctors →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 my-auto">
              {data?.specializationDistribution?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {item.specialization}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (item.count / (data?.kpi?.totalDoctors || 1)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Recent Doctors & Patients Activity Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Doctors */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                Recently Added Doctors
              </h4>
              <Link
                href="/doctors"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Manage Doctors
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.recentActivity?.doctors?.map((doc: any) => (
                <div key={doc._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-500">
                      {doc.specialization} • {doc.hospital}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-cyan-600" />
                Recently Admitted Patients
              </h4>
              <Link
                href="/patients"
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
              >
                Manage Patients
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.recentActivity?.patients?.map((pat: any) => (
                <div key={pat._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{pat.name}</p>
                    <p className="text-xs text-slate-500">
                      {pat.condition} • Dr. {pat.doctor?.name || 'Assigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        pat.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : pat.status === 'In Treatment'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pat.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(pat.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
