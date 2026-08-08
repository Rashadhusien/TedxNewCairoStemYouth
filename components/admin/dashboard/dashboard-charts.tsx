"use client";

import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPiastres } from "@/lib/pricing";
import type { DashboardStats } from "@/lib/db/actions/dashboard.action";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const registrationsConfig = {
  count: {
    label: "Registrations",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const revenueConfig = {
  amountPiastres: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const signupsConfig = {
  count: {
    label: "Signups",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const statusConfig = {
  count: {
    label: "Tickets",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const typeConfig = {
  count: {
    label: "Tickets",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const roleConfig = {
  count: {
    label: "Users",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function formatChartDate(date: string) {
  try {
    return format(parseISO(date), "MMM d");
  } catch {
    return date;
  }
}

type DashboardChartsProps = {
  stats: DashboardStats;
};

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const statusChartData = stats.ticketsByStatus.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Registrations</CardTitle>
          <CardDescription>
            Daily ticket registrations over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={registrationsConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <AreaChart
              data={stats.registrationsByDay}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatChartDate}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatChartDate(String(value))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                fill="var(--color-count)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>
            Daily confirmed revenue over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={revenueConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              data={stats.revenueByDay}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatChartDate}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(value) =>
                  `${Math.round(Number(value) / 100).toLocaleString()}`
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatChartDate(String(value))}
                    formatter={(value) => formatPiastres(Number(value))}
                  />
                }
              />
              <Bar
                dataKey="amountPiastres"
                fill="var(--color-amountPiastres)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tickets by Status</CardTitle>
          <CardDescription>
            Current distribution across all ticket statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={statusConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    nameKey="label"
                    formatter={(value, name) => (
                      <span className="flex w-full justify-between gap-4">
                        <span>{name}</span>
                        <span className="font-mono">
                          {Number(value).toLocaleString()}
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <Pie
                data={statusChartData}
                dataKey="count"
                nameKey="label"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={
                      entry.fill ?? CHART_COLORS[index % CHART_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders by Package</CardTitle>
          <CardDescription>Breakdown by package type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={typeConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              data={stats.ordersByPackage}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 8 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Signups</CardTitle>
          <CardDescription>
            New user registrations over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={signupsConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <LineChart
              data={stats.signupsByDay}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatChartDate}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatChartDate(String(value))}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
          <CardDescription>Platform user role distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={roleConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart
              data={stats.usersByRole}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
