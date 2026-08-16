"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateTicketLimitSetting } from "@/lib/db/actions/setting.action";
import { useRouter } from "next/navigation";

interface TicketLimitFormProps {
  maxTotalTickets: number;
  totalTicketsSold: number;
  remainingTickets: number;
}

export default function TicketLimitForm({
  maxTotalTickets,
  totalTicketsSold,
  remainingTickets,
}: TicketLimitFormProps) {
  const [value, setValue] = useState(String(maxTotalTickets));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed < 1) {
        setError("Ticket limit must be a positive number");
        return;
      }

      const result = await updateTicketLimitSetting({
        maxTotalTickets: parsed,
      });

      if (result.success) {
        setMessage("Ticket limit updated successfully.");
        router.refresh();
      } else {
        setError("Failed to update ticket limit.");
      }
    } catch {
      setError("Failed to update ticket limit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Total Ticket Capacity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">{maxTotalTickets}</div>
            <div className="text-xs text-muted-foreground">Limit</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
            <div className="text-xs text-muted-foreground">Sold</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">{remainingTickets}</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="maxTotalTickets">Max Tickets</Label>
          <Input
            id="maxTotalTickets"
            type="number"
            min="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Limit"}
          </Button>
        </form>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
