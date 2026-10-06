/**
 * Pricing Plans Page
 * Displays available subscription tiers with feature comparison,
 * monthly/annual billing toggle, and trial countdown banner.
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Check,
  Zap,
  Crown,
  Shield,
  Star,
  Clock,
  ArrowRight,
  Loader2,
  Users,
  FolderKanban,
  HardDrive,
  HeadphonesIcon,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

// ─── tier metadata ──────────────────────────────────────────────────────────
interface TierMeta {
  icon: React.ReactNode;
  accentClass: string;
  popular?: boolean;
}

const TIER_META: Record<string, TierMeta> = {
  trial:        { icon: <Zap className="w-5 h-5" />,     accentClass: "text-gray-500" },
  starter:      { icon: <Star className="w-5 h-5" />,    accentClass: "text-blue-500" },
  gold:         { icon: <Crown className="w-5 h-5" />,   accentClass: "text-green-500", popular: true },
  professional: { icon: <Crown className="w-5 h-5" />,   accentClass: "text-violet-600", popular: true },
  enterprise:   { icon: <Shield className="w-5 h-5" />,  accentClass: "text-indigo-600" },
  custom:       { icon: <Shield className="w-5 h-5" />,  accentClass: "text-orange-500" },
};

const TIER_RANK: Record<string, number> = {
  trial: 1, starter: 2, gold: 3, professional: 4, enterprise: 5, custom: 6,
};

function formatMonthlyDisplay(plan: any, cycle: "monthly" | "annual"): string {
  const amount =
    cycle === "annual"
      ? parseFloat(plan.annualPrice ?? "0") / 12
      : parseFloat(plan.monthlyPrice ?? "0");
  if (amount === 0) return "Free";
  return `KES ${amount.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()));
  }
  return [];
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  // ── Data queries ────────────────────────────────────────────────────────
  const { data: plansData, isLoading: plansLoading } = trpc.billing.getPlans.useQuery({});

  const { data: subData } = trpc.billing.getCurrentSubscription.useQuery(undefined as any, {
    retry: false,
    // gracefully ignore feature-permission errors
    onError: () => {},
  } as any);

  const subscribeMutation = trpc.billing.createSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription updated! Your plan has been changed.");
    },
    onError: (err) => {
      toast.error(`Could not update plan: ${err.message}`);
    },
  });

  // ── Derived state ────────────────────────────────────────────────────────
  const plans = useMemo(() => {
    const list: any[] = plansData?.plans ?? [];
    return [...list].sort((a, b) => {
      const byOrder = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (byOrder !== 0) return byOrder;
      return (TIER_RANK[a.tier] ?? 99) - (TIER_RANK[b.tier] ?? 99);
    });
  }, [plansData?.plans]);

  const subscription = subData?.subscription as any | null;
  const currentPlanId = subscription?.planId ?? null;
  const isTrialUser = subscription?.status === "trial";

  const trialDaysLeft = useMemo(() => {
    if (!isTrialUser || !subscription?.renewalDate) return 0;
    try {
      return Math.max(0, differenceInDays(parseISO(subscription.renewalDate), new Date()));
    } catch {
      return 0;
    }
  }, [isTrialUser, subscription?.renewalDate]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleSelectPlan(planId: string) {
    const clientId = subscription?.clientId;
    if (!clientId) {
      toast.error("Your account is not linked to an organization. Contact your administrator.");
      return;
    }
    subscribeMutation.mutate({ clientId, planId, billingCycle });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ModuleLayout
      title="Pricing Plans"
      description="Flexible plans for every team size — upgrade or downgrade any time"
    >
      {/* Trial countdown banner */}
      {isTrialUser && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Trial period active — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
            </p>
            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
              Upgrade to a paid plan to maintain uninterrupted access when your trial ends.
            </p>
          </div>
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="mb-10 flex items-center justify-center gap-4">
        <span
          className={
            billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"
          }
        >
          Monthly
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={billingCycle === "annual"}
          onClick={() =>
            setBillingCycle((c) => (c === "monthly" ? "annual" : "monthly"))
          }
          className={[
            "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            billingCycle === "annual" ? "bg-primary" : "bg-input",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
              billingCycle === "annual" ? "translate-x-6" : "translate-x-1",
            ].join(" ")}
          />
        </button>

        <span
          className={
            billingCycle === "annual" ? "font-semibold" : "text-muted-foreground"
          }
        >
          Annual{" "}
          <Badge variant="secondary" className="ml-1 text-xs">
            2 months free
          </Badge>
        </span>
      </div>

      {/* Plans grid */}
      {plansLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">
          No plans available at this time. Please contact support.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const meta = TIER_META[plan.tier] ?? TIER_META.starter;
            const isCurrent = plan.id === currentPlanId;
            const isFree = parseFloat(plan.monthlyPrice ?? "0") === 0;
            const features = parseFeatures(plan.features);
            const monthlyDisplay = formatMonthlyDisplay(plan, billingCycle);
            const annualTotal =
              billingCycle === "annual" && !isFree
                ? `KES ${Number(plan.annualPrice ?? 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })} billed annually`
                : null;

            return (
              <Card
                key={plan.id}
                className={[
                  "relative flex flex-col transition-shadow hover:shadow-md",
                  meta.popular
                    ? "ring-2 ring-primary shadow-lg"
                    : "border",
                  isCurrent ? "bg-primary/5 dark:bg-primary/10" : "",
                ].join(" ")}
              >
                {/* Popular badge */}
                {meta.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <Badge className="px-3 py-1 text-xs">Most Popular</Badge>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <div className="absolute -top-3.5 right-4">
                    <Badge variant="secondary" className="px-3 py-1 text-xs">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div
                    className={`mb-1 flex items-center gap-2 ${meta.accentClass}`}
                  >
                    {meta.icon}
                    <CardTitle className="text-lg">{plan.planName}</CardTitle>
                  </div>

                  {plan.description && (
                    <CardDescription className="text-sm leading-snug">
                      {plan.description}
                    </CardDescription>
                  )}

                  {/* Price display */}
                  <div className="mt-4">
                    {isFree ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">{monthlyDisplay}</span>
                        <span className="ml-1 text-sm text-muted-foreground">/mo</span>
                        {annualTotal && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {annualTotal}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-5">
                  {/* Limits */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>
                        {Number(plan.maxUsers) <= 0
                          ? "Unlimited users"
                          : `Up to ${plan.maxUsers} user${plan.maxUsers !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FolderKanban className="h-4 w-4 shrink-0" />
                      <span>
                        {plan.maxProjects === -1
                          ? "Unlimited projects"
                          : `Up to ${plan.maxProjects} project${plan.maxProjects !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                    {plan.maxStorageGB !== undefined && plan.maxStorageGB !== null && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="h-4 w-4 shrink-0" />
                        <span>
                          {plan.maxStorageGB === -1
                            ? "Unlimited storage"
                            : `${plan.maxStorageGB} GB storage`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HeadphonesIcon className="h-4 w-4 shrink-0" />
                      <span className="capitalize">
                        {(plan.supportLevel ?? "email").replace(/[_/]/g, " ")} support
                      </span>
                    </div>
                  </div>

                  {/* Feature list */}
                  {features.length > 0 && (
                    <ul className="flex-1 space-y-2">
                      {features.map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  <Button
                    className="mt-auto w-full"
                    variant={meta.popular && !isCurrent ? "default" : "outline"}
                    disabled={isCurrent || subscribeMutation.isPending}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {subscribeMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    {isCurrent
                      ? "Current Plan"
                      : isFree
                      ? "Get Started Free"
                      : isTrialUser
                      ? `Upgrade to ${plan.planName}`
                      : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Feature comparison table */}
      {!plansLoading && plans.length > 1 && (
        <Card className="mt-14">
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
            <CardDescription>
              Side-by-side overview of what each plan includes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Feature</TableHead>
                  {plans.map((p) => (
                    <TableHead
                      key={p.id}
                      className={[
                        "text-center",
                        p.id === currentPlanId ? "text-primary" : "",
                      ].join(" ")}
                    >
                      {p.planName}
                      {p.id === currentPlanId && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (current)
                        </span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(
                  [
                    {
                      label: "Monthly Price",
                      getValue: (p: any) =>
                        parseFloat(p.monthlyPrice ?? "0") === 0
                          ? "Free"
                          : `KES ${Number(p.monthlyPrice).toLocaleString("en-KE", { maximumFractionDigits: 0 })}/mo`,
                    },
                    {
                      label: "Annual Price",
                      getValue: (p: any) =>
                        parseFloat(p.annualPrice ?? "0") === 0
                          ? "—"
                          : `KES ${Number(p.annualPrice).toLocaleString("en-KE", { maximumFractionDigits: 0 })}/yr`,
                    },
                    {
                      label: "Trial Period",
                      getValue: (p: any) => Number(p.trialDays) > 0 ? `${p.trialDays} days` : "—",
                    },
                    {
                      label: "Users",
                      getValue: (p: any) =>
                        p.maxUsers === -1 ? "Unlimited" : p.maxUsers,
                    },
                    {
                      label: "Projects",
                      getValue: (p: any) =>
                        p.maxProjects === -1 ? "Unlimited" : p.maxProjects,
                    },
                    {
                      label: "Storage",
                      getValue: (p: any) =>
                        p.maxStorageGB === -1
                          ? "Unlimited"
                          : p.maxStorageGB === null || p.maxStorageGB === undefined
                          ? "—"
                          : `${p.maxStorageGB} GB`,
                    },
                    {
                      label: "Support",
                      getValue: (p: any) =>
                        (p.supportLevel ?? "email")
                          .replace(/[_/]/g, " ")
                          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                    },
                  ] as { label: string; getValue: (p: any) => string | number }[]
                ).map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    {plans.map((p) => (
                      <TableCell
                        key={p.id}
                        className="text-center text-muted-foreground"
                      >
                        {row.getValue(p)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Contact / custom plan */}
      <div className="mt-10 rounded-xl border bg-muted/30 p-8 text-center">
        <h3 className="mb-2 text-lg font-semibold">Need a custom plan?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          We offer tailored solutions for large enterprises with specific requirements.
          Contact Kiini to discuss a custom quote.
        </p>
        <Button variant="outline" asChild>
          <a href="mailto:sales@kiini.africa">Contact Sales</a>
        </Button>
      </div>
    </ModuleLayout>
  );
}
