'use client';

import React, { useMemo } from 'react';
import labels from '@/lib/labels.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
// import { dummyUsers } from './users-table';

const dummyUsers = [
  {
    id: 1,
    name: 'أحمد علي',
    role: 'student',
    status: 'نشطة',
    cohort: 'الدفعة الأولى',
    country: 'مصر',
    age: 22,
  },
  {
    id: 2,
    name: 'سارة محمد',

    role: 'teacher',
    status: 'نشطة',
    cohort: 'الدفعة الثانية',
    country: 'السعودية',
    age: 30,
  },
];

export default function StatisticsPage() {
  const stats = useMemo(() => {
    const total = dummyUsers.length;
    const active = dummyUsers.filter((u) => u.status === 'نشطة').length;
    const suspended = dummyUsers.filter((u) => u.status === 'معلقة').length;

    // By Role
    const byRole = {
      students: dummyUsers.filter((u) => u.role === 'student').length,
      teachers: dummyUsers.filter((u) => u.role === 'teacher').length,
    };

    // By Cohort
    const cohortMap = new Map<string, number>();
    dummyUsers.forEach((u) => {
      cohortMap.set(u.cohort, (cohortMap.get(u.cohort) || 0) + 1);
    });
    const byCohort = Array.from(cohortMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // By Country (all countries, sorted descending)
    const countryMap = new Map<string, number>();
    dummyUsers.forEach((u) => {
      countryMap.set(u.country, (countryMap.get(u.country) || 0) + 1);
    });
    const byCountry = Array.from(countryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // By Age
    const ageMap = new Map<number, number>();
    dummyUsers.forEach((u) => {
      ageMap.set(u.age, (ageMap.get(u.age) || 0) + 1);
    });
    const byAge = Array.from(ageMap.entries())
      .map(([age, value]) => ({ age: String(age), value }))
      .sort((a, b) => Number(a.age) - Number(b.age));

    return {
      total,
      active,
      suspended,
      byRole,
      byCohort,
      byCountry,
      byAge,
    };
  }, []);

  const roleChartData = [
    {
      name: labels.dashboard.stats.students,
      value: stats.byRole.students,
      fill: 'var(--color-primary)',
    },
    {
      name: labels.dashboard.stats.teachers,
      value: stats.byRole.teachers,
      fill: 'var(--color-secondary)',
    },
  ];

  const statusChartData = [
    {
      name: labels.dashboard.users.active,
      value: stats.active,
      fill: 'var(--color-success)',
    },
    {
      name: labels.dashboard.users.suspended,
      value: stats.suspended,
      fill: 'var(--color-warning)',
    },
  ];

  const roleChartConfig: ChartConfig = {
    value: {
      label: '',
    },
  };

  const cohortChartConfig: ChartConfig = {
    value: {
      label: labels.dashboard.stats.byCohort,
    },
  };

  const ageChartConfig: ChartConfig = {
    value: {
      label: labels.dashboard.stats.byAge,
    },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card/90 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.dashboard.stats.totalUsers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/90 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.dashboard.stats.activeUsers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/90 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {labels.dashboard.stats.suspendedUsers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {stats.suspended}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Role Distribution */}
        <Card className="border-border bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {labels.dashboard.stats.byRole}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={roleChartConfig}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, bottom: 10 }}>
                  <Pie
                    data={roleChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    label={(entry) => `${entry.value}`}
                    legendType="diamond"
                    labelLine={false}
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {labels.dashboard.stats.byStatus}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={roleChartConfig}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, bottom: 10 }}>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    label={(entry) => `${entry.value}`}
                    labelLine={false}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cohort Distribution */}
        <Card className="border-border bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {labels.dashboard.stats.byCohort}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={cohortChartConfig}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCohort}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    className="text-muted-foreground text-xs"
                  />
                  <YAxis className="text-muted-foreground text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-accent)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* All Countries List */}
        <Card className="border-border bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {labels.dashboard.stats.allCountries}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[250px] overflow-auto rounded-md border border-border p-2 space-y-1">
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground border-b border-border pb-2">
                <span>{labels.dashboard.stats.country}</span>
                <span className="text-right">
                  {labels.dashboard.stats.count}
                </span>
              </div>
              {stats.byCountry.map((c) => (
                <div
                  key={c.name}
                  className="grid grid-cols-2 gap-2 text-sm py-1 rounded hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors"
                >
                  <span className="truncate font-medium text-foreground/90">
                    {c.name}
                  </span>
                  <span className="text-right text-accent font-semibold">
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card className="border-border bg-card/90 backdrop-blur md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {labels.dashboard.stats.byAge}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={ageChartConfig}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byAge}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="age"
                    className="text-muted-foreground text-xs"
                  />
                  <YAxis className="text-muted-foreground text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-primary)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
