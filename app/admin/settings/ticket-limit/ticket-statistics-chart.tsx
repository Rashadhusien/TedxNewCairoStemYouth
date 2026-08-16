"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TicketStatistics } from "@/lib/db/actions/setting.action";

interface TicketStatisticsChartProps {
  stats: TicketStatistics;
}

export default function TicketStatisticsChart({
  stats,
}: TicketStatisticsChartProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 20;

  const formatCurrency = (value: number) => `EGP ${value.toFixed(2)}`;

  // Pagination for tickets
  const totalPages = Math.ceil(stats.recentTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = stats.recentTickets.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Free Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeTickets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packages Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Packages Distribution</CardTitle>
            <CardDescription>Most popular ticket packages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.packagesDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="packageName" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Tickets"]}
                  labelFormatter={(value) => `${value}`}
                />
                <Legend />
                <Bar dataKey="count" fill="#e62b1e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Current status of all tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ticketsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#6bcb77" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tickets by Price */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Price Point</CardTitle>
          <CardDescription>
            Number of tickets sold at each price level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ticketsByPrice}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="price"
                tickFormatter={(value) => `EGP ${value}`}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [value, "Tickets"]}
                labelFormatter={(value) => `Price: EGP ${value}`}
              />
              <Legend />
              <Bar dataKey="count" fill="#6bcb77" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Promo Code Usage */}
      {stats.promoCodeUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Usage</CardTitle>
            <CardDescription>
              Most used promo codes and total discounts applied
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.promoCodeUsage.map((promo) => (
                <div
                  key={promo.code}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-semibold">{promo.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {promo.count} uses
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      -{formatCurrency(promo.totalDiscount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total discount
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            All confirmed and checked-in tickets ({stats.recentTickets.length}{" "}
            total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentTickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No tickets sold yet
              </p>
            ) : (
              <>
                {currentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {ticket.attendeeName || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.type} • {ticket.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {ticket.pricePaid === 0
                          ? "Free"
                          : formatCurrency(ticket.pricePaid)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
