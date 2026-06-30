import { checkInTicket } from "@/lib/db/actions/ticket.action";
import { getActionErrorMessage } from "@/types/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCheckInPage() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    attendeeName: string | null;
    message: string;
  } | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;

    setLoading(true);
    setLastResult(null);

    const result = await checkInTicket({ qrCode: qrCode.trim() });
    setLoading(false);

    if (!result.success) {
      const errorMsg = getActionErrorMessage(result, "Check-in failed");
      setLastResult({
        success: false,
        attendeeName: null,
        message: errorMsg,
      });
      toast.error(errorMsg);
      return;
    }

    setLastResult({
      success: true,
      attendeeName: result.data?.attendeeName ?? null,
      message: "Ticket checked in successfully",
    });
    toast.success("Ticket checked in successfully");
    setQrCode("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Check-In</h1>
        <p className="text-muted-foreground text-sm">
          Scan or enter QR code to check in attendees
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Check-In Scanner</CardTitle>
          <CardDescription>
            Enter the QR code from the attendee ticket to check them in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter QR code or scan..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                disabled={loading}
                autoFocus
                className="flex-1 font-mono"
              />
              <Button type="submit" disabled={loading || !qrCode.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check In"
                )}
              </Button>
            </div>

            {lastResult && (
              <div
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  lastResult.success
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                {lastResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  {lastResult.success && lastResult.attendeeName && (
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-500">
                        {lastResult.attendeeName}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{lastResult.message}</p>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>
                • QR code is a UUID string (e.g.,
                550e8400-e29b-41d4-a716-446655440000)
              </p>
              <p>• Only confirmed tickets can be checked in</p>
              <p>• Each ticket can only be checked in once</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
