"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
import {
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Camera,
  Keyboard,
} from "lucide-react";
// import { toast } from "sonner";

export default function AdminCheckInPage() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    attendeeName: string | null;
    message: string;
    alreadyCheckedIn?: boolean;
  } | null>(null);
  const [useCamera, setUseCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure,
      );
      setIsScanning(true);
      setCameraError(null);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError(
        "Unable to access camera. Please check permissions or use manual input.",
      );
      setUseCamera(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (loading) return;

    await stopScanner();
    setQrCode(decodedText);
    await handleCheckIn(decodedText);

    // Don't auto-restart scanner - let admin manually restart after seeing status
  };

  const onScanFailure = () => {
    // Suppress scan failures (no QR code in frame)
  };

  const handleCheckIn = async (code?: string) => {
    const codeToCheck = code || qrCode;
    if (!codeToCheck.trim()) return;

    setLoading(true);
    setLastResult(null);

    const result = await checkInTicket({ qrCode: codeToCheck.trim() });
    setLoading(false);

    if (!result.success) {
      const errorMsg = getActionErrorMessage(result, "Check-in failed");
      setLastResult({
        success: false,
        attendeeName: null,
        message: errorMsg,
      });
      // toast.error(errorMsg);
      return;
    }

    const alreadyCheckedIn = result.data?.alreadyCheckedIn ?? false;
    const message = alreadyCheckedIn
      ? "This ticket has already been checked in"
      : "Ticket checked in successfully";

    setLastResult({
      success: true,
      attendeeName: result.data?.attendeeName ?? null,
      message,
      alreadyCheckedIn,
    });
    // toast.success(message);
    setQrCode("");
  };

  useEffect(() => {
    if (useCamera && !scannerRef.current) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCamera]);

  const toggleInputMethod = () => {
    if (useCamera) {
      stopScanner();
      setUseCamera(false);
    } else {
      setUseCamera(true);
      setCameraError(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn();
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
            Scan QR code with camera or enter manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle button */}
          <Button
            type="button"
            variant="outline"
            onClick={toggleInputMethod}
            className="w-full"
          >
            {useCamera ? (
              <>
                <Keyboard className="w-4 h-4 mr-2" />
                Switch to Manual Input
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Switch to Camera Scanner
              </>
            )}
          </Button>

          {/* Camera Scanner */}
          {useCamera && !cameraError && (
            <div className="space-y-4">
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden"
              />
              {isScanning && (
                <p className="text-xs text-center text-muted-foreground">
                  Point camera at QR code to scan
                </p>
              )}
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-300">
              {cameraError}
            </div>
          )}

          {/* Manual Input */}
          {!useCamera && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter QR code manually..."
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
            </form>
          )}

          {/* Result Display */}
          {lastResult && (
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                lastResult.success
                  ? lastResult.alreadyCheckedIn
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              {lastResult.success ? (
                lastResult.alreadyCheckedIn ? (
                  <CheckCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                )
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                {lastResult.success && lastResult.attendeeName && (
                  <div className="flex items-center gap-2 mb-1">
                    <User
                      className={`w-4 h-4 ${lastResult.alreadyCheckedIn ? "text-yellow-500" : "text-green-500"}`}
                    />
                    <span
                      className={`font-semibold ${lastResult.alreadyCheckedIn ? "text-yellow-500" : "text-green-500"}`}
                    >
                      {lastResult.attendeeName}
                    </span>
                  </div>
                )}
                <p className="text-sm">{lastResult.message}</p>
              </div>
            </div>
          )}

          {/* Restart Scanner Button */}
          {lastResult && lastResult.success && !isScanning && useCamera && (
            <Button
              type="button"
              onClick={startScanner}
              className="w-full"
              variant="outline"
            >
              <Camera className="w-4 h-4 mr-2" />
              Resume Scanning
            </Button>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • QR code is a UUID string (e.g.,
              550e8400-e29b-41d4-a716-446655440000)
            </p>
            <p>• Only confirmed tickets can be checked in</p>
            <p>• Each ticket can only be checked in once</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
