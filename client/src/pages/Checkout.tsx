import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Shield,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardUrl } from "@/lib/permissions";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

type CheckoutStep = "plan" | "payment" | "confirm";

interface Plan {
  key: string;
  label: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
}

interface PaymentMethod {
  type: "card" | "mpesa" | "bank";
  label: string;
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    type: "card",
    label: "Credit/Debit Card",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    type: "mpesa",
    label: "M-Pesa",
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    type: "bank",
    label: "Bank Transfer",
    icon: <Building2 className="h-5 w-5" />,
  },
];

function CheckoutContent() {
  const { user, loading: authLoading } = useAuthWithPersistence();
  const [location, navigate] = useLocation();
  const [, params] = useRoute("/checkout/:planKey?");

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("plan");
  const [selectedPlan, setSelectedPlan] = useState<string>(params?.planKey || "");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod['type'] | "">("");

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  const [mpesaNumber, setMpesaNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Fetch data
  const { data: planData, isLoading: plansLoading } = trpc.multiTenancy.getAvailablePlans.useQuery({});
  const { data: currentSubscription } = trpc.multiTenancy.getCurrentSubscription.useQuery(undefined, { enabled: !!user?.organizationId });
  const plansArray = (planData?.plans ?? []).map((plan: any) => {
    const rawFeatures = Array.isArray(plan.features) ? plan.features : typeof plan.features === "string" ? (() => { try { return JSON.parse(plan.features); } catch { return []; } })() : [];
    return {
      key: plan.planSlug || plan.tier || plan.id,
      label: plan.planName || plan.planSlug || plan.tier || "Plan",
      monthlyKes: Number(plan.monthlyPrice ?? 0),
      annualKes: Number(plan.annualPrice ?? 0),
      description: plan.description || "",
      features: rawFeatures,
    };
  });

  // Mutations
  const createSubscriptionMutation = trpc.multiTenancy.createSubscription.useMutation({
    onSuccess: (data) => {
      toast.success("Subscription created successfully!");
      navigate("/portal");
    },
    onError: (err) => toast.error(err.message || "Failed to create subscription"),
  });

  const upgradeSubscriptionMutation = trpc.multiTenancy.upgradeSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription upgraded successfully!");
      navigate("/portal");
    },
    onError: (err) => toast.error(err.message || "Failed to upgrade subscription"),
  });
  const createSetupIntentMutation = trpc.stripe.createSetupIntent.useMutation();

  useEffect(() => {
    if (params?.planKey) {
      setSelectedPlan(params.planKey);
    } else {
      try {
        const queryString = location.split("?")[1] || "";
        const planParam = new URLSearchParams(queryString).get("plan");
        if (planParam) {
          setSelectedPlan(planParam);
        }
      } catch {
        // ignore malformed query
      }
    }
  }, [params?.planKey, location]);

  useEffect(() => {
    if (user && !user.organizationId && !authLoading) {
      navigate(getDashboardUrl(user.role || "user"));
      return;
    }
    if (!user && !authLoading) {
      const nextPath = location || "/checkout";
      navigate(`/signup?next=${encodeURIComponent(nextPath)}`);
    }
  }, [user, location, navigate, authLoading]);

  if (!user) {
    return null;
  }

  const selectedPlanData = plansArray?.find((p) => p.key === selectedPlan);
  const currentPlanKey = currentSubscription?.subscription?.planKey;
  const isUpgrade = Boolean(currentPlanKey);

  const calculatePrice = () => {
    if (!selectedPlanData) return 0;
    return billingCycle === "annual"
      ? selectedPlanData.annualKes || selectedPlanData.monthlyKes * 12
      : selectedPlanData.monthlyKes;
  };

  const handleNext = () => {
    if (currentStep === "plan" && selectedPlan) {
      setCurrentStep("payment");
    } else if (currentStep === "payment" && paymentMethod) {
      setCurrentStep("confirm");
    }
  };

  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("plan");
    } else if (currentStep === "confirm") {
      setCurrentStep("payment");
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlanData) return;

    let paymentData =
      paymentMethod === "card"
        ? { card: { name: cardholderName }, stripePaymentMethodId: "", stripeSetupIntentId: "" }
        : paymentMethod === "mpesa"
        ? {
            mpesa: {
              phoneNumber: mpesaNumber,
            },
          }
        : paymentMethod === "bank"
        ? {
            bank: {
              bankName,
              accountNumber,
            },
          }
        : {};

    if (paymentMethod === "card") {
      if (!stripe || !elements) {
        toast.error("Stripe card payments are not configured");
        return;
      }
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error("Enter your card details");
        return;
      }
      const setupIntent = await createSetupIntentMutation.mutateAsync();
      if (!setupIntent.clientSecret) {
        toast.error("Unable to start secure card setup");
        return;
      }
      const confirmation = await stripe.confirmCardSetup(setupIntent.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardholderName, email: user.email || undefined },
        },
      });
      if (confirmation.error || !confirmation.setupIntent?.payment_method) {
        toast.error(confirmation.error?.message || "Card verification failed");
        return;
      }
      paymentData = {
        card: { name: cardholderName },
        stripePaymentMethodId: String(confirmation.setupIntent.payment_method),
        stripeSetupIntentId: setupIntent.setupIntentId,
      };
    }

    const subscriptionData = {
      planKey: selectedPlan,
      billingCycle,
      paymentMethod: paymentMethod as any,
      paymentData,
    };

    if (isUpgrade) {
      await upgradeSubscriptionMutation.mutateAsync(subscriptionData);
    } else {
      await createSubscriptionMutation.mutateAsync(subscriptionData);
    }
  };

  const renderPlanStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Select the plan that best fits your needs</p>
      </div>

      {plansLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center">
            <div className="bg-muted p-1 rounded-lg">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === "annual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("annual")}
              >
                Annual
                <Badge variant="secondary" className="ml-2">Save 20%</Badge>
              </Button>
            </div>
          </div>

          {/* Plan Selection */}
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plansArray?.map((plan) => (
                <div key={plan.key}>
                  <RadioGroupItem value={plan.key} id={plan.key} className="sr-only" />
                  <Label
                    htmlFor={plan.key}
                    className={cn(
                      "block cursor-pointer rounded-lg border-2 p-4 transition-colors",
                      selectedPlan === plan.key
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{plan.label}</h3>
                        {plan.key === "professional" && (
                          <Badge variant="default">Most Popular</Badge>
                        )}
                      </div>

                      <div className="text-2xl font-bold">
                        Ksh {billingCycle === "annual"
                          ? (plan.annualKes || plan.monthlyKes * 12).toLocaleString()
                          : plan.monthlyKes.toLocaleString()
                        }
                        <span className="text-sm font-normal text-muted-foreground">
                          /{billingCycle === "annual" ? "year" : "month"}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">{plan.description}</p>

                      <ul className="space-y-1">
                        {(Array.isArray(plan.features)
                          ? plan.features
                          : typeof plan.features === 'object' && plan.features !== null
                          ? Object.values(plan.features)
                          : []
                        )?.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {typeof feature === 'string' ? feature : feature?.label || String(feature)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Information</h2>
        <p className="text-muted-foreground">Choose your payment method and enter details</p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="grid gap-3">
            {PAYMENT_METHODS.map((method) => (
              <div key={method.type}>
                <RadioGroupItem value={method.type} id={method.type} className="sr-only" />
                <Label
                  htmlFor={method.type}
                  className={cn(
                    "flex items-center cursor-pointer rounded-lg border-2 p-4 transition-colors",
                    paymentMethod === method.type
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  {method.icon}
                  <span className="ml-3 font-medium">{method.label}</span>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Payment Form */}
      {paymentMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Card Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-background p-3">
              <CardElement options={{ hidePostalCode: true }} />
            </div>
            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "mpesa" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              M-Pesa Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="mpesaNumber">M-Pesa Phone Number</Label>
              <Input
                id="mpesaNumber"
                placeholder="+254 712 345 678"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                You'll receive a prompt on this number to complete the payment
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "bank" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Bank Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="KCB Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Bank Transfer Instructions:</p>
              <p className="text-sm text-muted-foreground">
                After submitting, you'll receive bank details to complete the transfer.
                Your subscription will be activated once payment is confirmed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Confirm Your Order</h2>
        <p className="text-muted-foreground">Review your subscription details before confirming</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{selectedPlanData?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Billing Cycle:</span>
              <span className="capitalize">{billingCycle}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="capitalize">{paymentMethod}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>Ksh {calculatePrice().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p>{user.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p>{user.email}</p>
            </div>
            {isUpgrade && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This will upgrade your current {currentSubscription?.planName} plan.
                  Changes will be prorated.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Your payment information is secure and encrypted.
            <Lock className="h-4 w-4 ml-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case "plan":
        return selectedPlan;
      case "payment":
        if (paymentMethod === "card") {
          return cardholderName && stripePromise;
        } else if (paymentMethod === "mpesa") {
          return mpesaNumber;
        } else if (paymentMethod === "bank") {
          return bankName && accountNumber;
        }
        return false;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold">Secure Checkout</h1>
            </div>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: "plan", label: "Choose Plan", step: 1 },
              { key: "payment", label: "Payment", step: 2 },
              { key: "confirm", label: "Confirm", step: 3 },
            ].map((step) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                    currentStep === step.key
                      ? "bg-primary text-primary-foreground"
                      : ["plan", "payment", "confirm"].indexOf(currentStep) >= step.step - 1
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.step}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium",
                    currentStep === step.key ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {currentStep === "plan" && renderPlanStep()}
        {currentStep === "payment" && renderPaymentStep()}
        {currentStep === "confirm" && renderConfirmStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === "plan"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep === "confirm" ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || createSubscriptionMutation.isLoading || upgradeSubscriptionMutation.isLoading}
              size="lg"
            >
              {(createSubscriptionMutation.isLoading || upgradeSubscriptionMutation.isLoading) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isUpgrade ? "Upgrade Subscription" : "Complete Purchase"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return <Elements stripe={stripePromise}><CheckoutContent /></Elements>;
}