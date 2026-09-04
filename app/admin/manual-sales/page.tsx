"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, User, Package, Tag, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import {
  searchCustomers,
  getApplicablePromoCodes,
  createAdminAssistedOrder,
} from "@/lib/db/actions/admin-order.action";
import { getActivePackages } from "@/lib/db/actions/package.action";
import { ROUTES } from "@/constants/routes";

interface Customer {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
}

interface Package {
  id: string;
  name: string;
  ticketCount: number;
  totalPricePiastres: number;
  pricePerTicketPiastres: number;
}

interface PromoCode {
  id: string;
  code: string;
  type: string;
  valuePiastres: number;
  maxUses: number | null;
  usedCount: number;
  validUntil: Date | null;
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
}

export default function ManualSalesPage() {
  const [mode, setMode] = useState<"registered" | "guest">("registered");
  const [step, setStep] = useState<
    | "search"
    | "customer"
    | "package"
    | "promo"
    | "attendees"
    | "confirm"
    | "success"
  >("search");
  const [loading, setLoading] = useState(false);

  // Customer search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Package selection
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Promo code
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(
    null,
  );
  const [manualPromoCode, setManualPromoCode] = useState("");

  // Attendees
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  // Payment
  const [paymentReference, setPaymentReference] = useState("");

  // Result
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleSearchCustomers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const result = await searchCustomers({ search: query });
      if (result.success && result.data) {
        setSearchResults(result.data.users);
        if (result.data.users.length === 0) {
          toast.error("No customers found matching your search");
        }
      } else {
        toast.error("Failed to search customers");
      }
    } catch (error) {
      toast.error("Failed to search customers");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        handleSearchCustomers(query);
      }, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep("customer");
    loadPackages();
  };

  const loadPackages = async () => {
    setLoading(true);
    try {
      const pkgs = await getActivePackages();
      setPackages(pkgs);
    } catch (error) {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = async (pkg: Package) => {
    setSelectedPackage(pkg);
    setLoading(true);
    try {
      const result = await getApplicablePromoCodes({ packageId: pkg.id });
      if (result.success && result.data) {
        setPromoCodes(result.data.promoCodes);
      }
      // Skip promo step for guest mode, go directly to attendees
      if (mode === "guest") {
        setStep("attendees");
        initializeAttendees(pkg);
      } else {
        setStep("promo");
      }
    } catch (error) {
      toast.error("Failed to load promo codes");
      setStep("attendees");
      initializeAttendees(pkg);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPromo = () => {
    setSelectedPromoCode(null);
    setStep("attendees");
    initializeAttendees(selectedPackage!);
  };

  const handleSelectPromoCode = (promo: PromoCode) => {
    setSelectedPromoCode(promo);
    setStep("attendees");
    initializeAttendees(selectedPackage!);
  };

  const handleApplyManualPromo = async () => {
    if (!manualPromoCode.trim()) return;
    // For manual promo code, we'll validate it during order creation
    const manualPromo: PromoCode = {
      id: "",
      code: manualPromoCode,
      type: "discount",
      valuePiastres: 0,
      maxUses: null,
      usedCount: 0,
      validUntil: null,
    };
    setSelectedPromoCode(manualPromo);
    setStep("attendees");
    initializeAttendees(selectedPackage!);
  };

  const initializeAttendees = (pkg: Package) => {
    const initialAttendees: Attendee[] = [];
    for (let i = 0; i < pkg.ticketCount; i++) {
      if (i === 0 && mode === "registered" && selectedCustomer) {
        // Pre-fill first attendee from customer data (registered mode only)
        initialAttendees.push({
          name: selectedCustomer.fullName || "",
          email: selectedCustomer.email,
          phone: selectedCustomer.phone || "",
        });
      } else {
        // Empty fields for all other attendees and guest mode
        initialAttendees.push({
          name: "",
          email: "",
          phone: "",
        });
      }
    }
    setAttendees(initialAttendees);
  };

  const handleAttendeeChange = (
    index: number,
    field: keyof Attendee,
    value: string,
  ) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const calculatePricing = () => {
    if (!selectedPackage) return { original: 0, discount: 0, final: 0 };

    const original = selectedPackage.totalPricePiastres;
    let discount = 0;
    let final = original;

    if (selectedPromoCode && selectedPromoCode.id) {
      // This is a validated promo code from the list
      if (selectedPromoCode.type === "fixed_price") {
        final = selectedPromoCode.valuePiastres;
        discount = original - final;
      } else if (selectedPromoCode.type === "discount") {
        discount = selectedPromoCode.valuePiastres;
        final = Math.max(0, original - discount);
      } else if (
        selectedPromoCode.type === "free" ||
        selectedPromoCode.type === "free_vip"
      ) {
        discount = original;
        final = 0;
      }
    }
    // For manual promo codes, we'll calculate during order creation

    return { original, discount, final };
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;
    if (mode === "registered" && !selectedCustomer) return;

    setLoading(true);
    try {
      const operationId = crypto.randomUUID();
      const result = await createAdminAssistedOrder({
        mode,
        customerUserId:
          mode === "registered" ? selectedCustomer?.id : undefined,
        packageId: selectedPackage.id,
        promoCode: selectedPromoCode?.code || undefined,
        attendees,
        paymentReference: paymentReference || undefined,
        operationId,
      });

      if (result.success && result.data) {
        setOrderId(result.data.orderId);
        setStep("success");
        toast.success("Order created successfully");
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("search");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedCustomer(null);
    setPackages([]);
    setSelectedPackage(null);
    setPromoCodes([]);
    setSelectedPromoCode(null);
    setManualPromoCode("");
    setAttendees([]);
    setPaymentReference("");
    setOrderId(null);
  };

  const formatPrice = (piastres: number) => {
    return (piastres / 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manual Sales</h1>
        <p className="text-muted-foreground text-sm">
          Create admin-assisted ticket purchases for WhatsApp sales
        </p>
      </div>

      {/* Mode Selection */}
      {step === "search" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Sale Mode</CardTitle>
            <CardDescription>
              Choose between registered customer or guest attendee
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant={mode === "registered" ? "default" : "outline"}
              onClick={() => setMode("registered")}
              className="flex-1"
            >
              Registered Customer
            </Button>
            <Button
              variant={mode === "guest" ? "default" : "outline"}
              onClick={() => {
                setMode("guest");
                setSelectedCustomer(null);
                setStep("package");
                loadPackages();
              }}
              className="flex-1"
            >
              Guest Attendee
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "search" && mode === "registered" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Customer
            </CardTitle>
            <CardDescription>
              Search for a customer by email or name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <Label>Results</Label>
                {searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="font-medium">
                      {customer.fullName || "No name"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.phone || "No phone"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              searchQuery &&
              !loading && (
                <div className="text-center text-muted-foreground py-4">
                  No customers found. Try a different search term.
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {step === "customer" && selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <div className="text-lg font-medium">
                {selectedCustomer.fullName || "Not provided"}
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="text-lg font-medium">
                {selectedCustomer.email}
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="text-lg font-medium">
                {selectedCustomer.phone || "Not provided"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setStep("search")}>Back</Button>
              <Button onClick={() => setStep("package")}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "package" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Package
            </CardTitle>
            <CardDescription>
              Choose a ticket package for the customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => handleSelectPackage(pkg)}
              >
                <div className="font-medium text-lg">{pkg.name}</div>
                <div className="text-sm text-muted-foreground">
                  {pkg.ticketCount} ticket(s)
                </div>
                <div className="text-lg font-bold">
                  EGP {formatPrice(pkg.totalPricePiastres)}
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={() => setStep("customer")}>
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "promo" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Apply Promo Code (Optional)
            </CardTitle>
            <CardDescription>
              Select a promo code or enter manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Or enter promo code manually</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code..."
                  value={manualPromoCode}
                  onChange={(e) => setManualPromoCode(e.target.value)}
                />
                <Button onClick={handleApplyManualPromo}>Apply</Button>
              </div>
            </div>

            {promoCodes.length > 0 && (
              <div className="space-y-2">
                <Label>Available Promo Codes</Label>
                {promoCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleSelectPromoCode(promo)}
                  >
                    <div className="font-medium">{promo.code}</div>
                    <div className="text-sm text-muted-foreground">
                      Type: {promo.type} | {promo.usedCount}/
                      {promo.maxUses || "∞"} used
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkipPromo}>
                Skip
              </Button>
              <Button variant="outline" onClick={() => setStep("package")}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "attendees" && selectedPackage && (
        <Card>
          <CardHeader>
            <CardTitle>Attendee Information</CardTitle>
            <CardDescription>
              Enter details for {selectedPackage.ticketCount} attendee(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendees.map((attendee, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <Label className="font-medium">Attendee {index + 1}</Label>
                <Input
                  placeholder="Name"
                  value={attendee.name}
                  onChange={(e) =>
                    handleAttendeeChange(index, "name", e.target.value)
                  }
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={attendee.email}
                  onChange={(e) =>
                    handleAttendeeChange(index, "email", e.target.value)
                  }
                  required={mode === "registered"}
                />
                <Input
                  placeholder="Phone"
                  value={attendee.phone}
                  onChange={(e) =>
                    handleAttendeeChange(index, "phone", e.target.value)
                  }
                  required={mode === "registered"}
                />
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  mode === "guest" ? setStep("package") : setStep("promo")
                }
              >
                Back
              </Button>
              <Button onClick={() => setStep("confirm")}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "confirm" && selectedPackage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Confirm Purchase
            </CardTitle>
            <CardDescription>
              Review and confirm the order details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "registered" && selectedCustomer && (
              <div className="space-y-2">
                <Label>Customer</Label>
                <div className="p-3 bg-accent rounded-lg">
                  <div className="font-medium">
                    {selectedCustomer.fullName || "No name"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedCustomer.email}
                  </div>
                </div>
              </div>
            )}
            {mode === "guest" && (
              <div className="space-y-2">
                <Label>Customer</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-800">
                    Guest Attendee (no user account)
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Package</Label>
              <div className="p-3 bg-accent rounded-lg">
                <div className="font-medium">{selectedPackage.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedPackage.ticketCount} ticket(s)
                </div>
              </div>
            </div>

            {selectedPromoCode && (
              <div className="space-y-2">
                <Label>Promo Code</Label>
                <div className="p-3 bg-accent rounded-lg">
                  <div className="font-medium">{selectedPromoCode.code}</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Pricing</Label>
              <div className="p-3 bg-accent rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span>Original:</span>
                  <span>EGP {formatPrice(calculatePricing().original)}</span>
                </div>
                {calculatePricing().discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-EGP {formatPrice(calculatePricing().discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Final:</span>
                  <span>EGP {formatPrice(calculatePricing().final)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Reference (Optional)</Label>
              <Textarea
                placeholder="e.g., WhatsApp transfer #123"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("attendees")}>
                Back
              </Button>
              <Button onClick={handleConfirmPurchase} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Confirm Purchase & Send Ticket"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "success" && orderId && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Order Created Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
              <div className="font-medium text-green-900">
                Order ID: {orderId}
              </div>
              <div className="text-sm text-green-700 mt-2">
                The customer has been sent confirmation emails with their QR
                codes.
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Create Another Order
              </Button>
              <Button asChild>
                <a href={ROUTES.ADMIN.ORDERS.DETAILS(orderId)}>View Order</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
