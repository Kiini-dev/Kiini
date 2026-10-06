import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, CircleHelp, PlayCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

type TourStep = {
  id: string;
  title: string;
  description: string;
  target?: string;
};

type SetupTask = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

const DEFAULT_TOUR_STEPS: TourStep[] = [
  { id: "workspace", title: "Your workspace", description: "This is your main work area. Your dashboard and the page you open appear here.", target: "[data-tour=page-content]" },
  { id: "navigation", title: "Explore the navigation", description: "Use the navigation rail to open the modules available to your role, such as CRM, finance, HR, and reports.", target: "[data-tour=mobile-nav], [data-tour=sidebar]" },
  { id: "search", title: "Find things quickly", description: "Search for records and pages from the header. On smaller screens, use the search icon.", target: "[data-tour=global-search]" },
  { id: "favorites", title: "Keep important records close", description: "Open your starred records here so frequently used items are easy to get back to.", target: "[data-tour=favorites]" },
  { id: "profile", title: "Manage your profile", description: "Open your account menu to update your profile, security preferences, and account settings.", target: "[data-tour=user-menu]" },
  { id: "notifications", title: "Stay up to date", description: "Approvals, messages, and important workspace updates appear in notifications.", target: "[data-tour=notifications]" },
  { id: "calendar", title: "Plan your work", description: "Open your calendar to review upcoming events and scheduled work.", target: "[data-tour=calendar]" },
  { id: "messages", title: "Communicate with your team", description: "Use the messages or communications shortcut to reach your workspace conversations.", target: "[data-tour=messages]" },
  { id: "reminders", title: "Keep track of follow-ups", description: "Review due and pending reminders without leaving your current page.", target: "[data-tour=reminders]" },
  { id: "help", title: "Get help whenever you need it", description: "Reopen this walkthrough from the help icon at any time.", target: "[data-tour=help]" },
];

const DEFAULT_SETUP_TASKS: SetupTask[] = [
  { id: "profile", title: "Complete your profile", description: "Add your name, photo, and contact details.", href: "/settings" },
  { id: "company", title: "Configure company details", description: "Set the organization identity used in documents and emails.", href: "/settings" },
  { id: "team", title: "Invite your team", description: "Create users and assign the right roles.", href: "/users" },
  { id: "templates", title: "Review document templates", description: "Make invoices, quotes, and reports match your business.", href: "/document-templates" },
];

const DEFAULT_GUIDANCE = {
  enabled: true,
  overlay: { enabled: true, opacity: 0.45, color: "#0f172a", closeOnOutsideClick: true },
  pointer: { type: "spotlight", color: "#f59e0b", thickness: 2, animated: true },
  tooltip: { type: "card", position: "bottom", showProgress: true },
  videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
  steps: DEFAULT_TOUR_STEPS,
  tasks: DEFAULT_SETUP_TASKS,
  hotspots: { enabled: true, color: "#f59e0b", pulse: true, showUnreadBadges: true },
};

function getStorageKey(userId?: string) {
  return `kiini-guidance-${userId || "guest"}`;
}

function getTourSeenKey(userId: string) {
  return `kiini-guidance-tour-seen-${userId}`;
}

function getVisibleTarget(selector?: string): Element | null {
  if (!selector) return null;
  const targets = Array.from(document.querySelectorAll(selector));
  return targets.find((target) => {
    const rect = target.getBoundingClientRect();
    const style = window.getComputedStyle(target);
    return style.display !== "none" && style.visibility !== "hidden" &&
      rect.width > 0 && rect.height > 0 &&
      rect.right > 0 && rect.bottom > 0 &&
      rect.left < window.innerWidth && rect.top < window.innerHeight;
  }) ?? null;
}

export function GuidanceHotspot({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("relative inline-flex", className)}>
            {children}
            <span aria-label={label} className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500 ring-2 ring-background" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-64">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ProductGuidance({ userId, navigate }: { userId?: string; navigate?: (href: string) => void }) {
  const { data: remoteGuidance } = trpc.settings.getProductGuidance.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const guidance = remoteGuidance || DEFAULT_GUIDANCE;
  const tourSteps = guidance.steps?.length ? guidance.steps : DEFAULT_TOUR_STEPS;
  const setupTasks = guidance.tasks?.length ? guidance.tasks : DEFAULT_SETUP_TASKS;
  const storageKey = getStorageKey(userId);
  const [open, setOpen] = useState(false);
  const [touring, setTouring] = useState(false);
  const [activeTourSteps, setActiveTourSteps] = useState<TourStep[]>(tourSteps);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [videoOpen, setVideoOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const autoStartedUser = useRef<string | null>(null);
  const currentStep = activeTourSteps[stepIndex] || activeTourSteps[0];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(stored)) setCompleted(stored);
    } catch {
      setCompleted([]);
    }
  }, [storageKey]);

  const remainingTasks = useMemo(() => setupTasks.filter((task) => !completed.includes(task.id)), [completed, setupTasks]);

  const persistCompleted = (next: string[]) => {
    setCompleted(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const finishTour = useCallback(() => {
    setTouring(false);
    setTargetRect(null);
    if (userId) localStorage.setItem(getTourSeenKey(userId), "true");
  }, [userId]);

  const startTour = useCallback(() => {
    const availableSteps = tourSteps.filter((step) => !step.target || getVisibleTarget(step.target));
    if (!availableSteps.length) return;
    setOpen(false);
    setActiveTourSteps(availableSteps);
    setStepIndex(0);
    setTouring(true);
  }, [tourSteps]);

  useEffect(() => {
    if (!userId || autoStartedUser.current === userId) return;
    autoStartedUser.current = userId;
    if (localStorage.getItem(getTourSeenKey(userId))) return;
    const timer = window.setTimeout(startTour, 900);
    return () => window.clearTimeout(timer);
  }, [startTour, userId]);

  useEffect(() => {
    if (!touring || !currentStep) return;
    const target = getVisibleTarget(currentStep.target);
    target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const updateTarget = () => {
      const visibleTarget = getVisibleTarget(currentStep.target);
      setTargetRect(visibleTarget?.getBoundingClientRect() ?? null);
    };
    const frame = window.requestAnimationFrame(updateTarget);
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [currentStep, touring]);

  useEffect(() => {
    if (!touring) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishTour();
      if (event.key === "ArrowRight") setStepIndex((index) => Math.min(index + 1, activeTourSteps.length - 1));
      if (event.key === "ArrowLeft") setStepIndex((index) => Math.max(index - 1, 0));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTourSteps.length, finishTour, touring]);

  const toggleTask = (id: string) => {
    persistCompleted(completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id]);
  };

  if (!guidance.enabled) return null;
  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 768 : window.innerHeight;
  const tourPosition = targetRect
    ? {
        top: Math.max(12, Math.min(targetRect.top, viewportHeight - 270)),
        left: targetRect.left > 400
          ? Math.max(12, targetRect.left - 392)
          : Math.max(12, Math.min(viewportWidth - 388, targetRect.right + 16)),
      }
    : { top: Math.max(12, (viewportHeight - 230) / 2), left: Math.max(12, (viewportWidth - 376) / 2) };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button data-tour="help" variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9" onClick={startTour} aria-label="Open product guidance">
              <CircleHelp className="h-4 w-4 sm:h-5 sm:w-5" />
              {remainingTasks.length > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-amber-500" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Guides and setup</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" />Setup checklist</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-3">
            {setupTasks.map((task) => {
              const isDone = completed.includes(task.id);
              return (
                <div key={task.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <button type="button" onClick={() => toggleTask(task.id)} className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", isDone && "border-emerald-600 bg-emerald-600 text-white")} aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${task.title}`}>
                    {isDone && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1"><p className={cn("font-medium", isDone && "text-muted-foreground line-through")}>{task.title}</p><p className="text-sm text-muted-foreground">{task.description}</p></div>
                  {task.href && <Button size="sm" variant="ghost" onClick={() => { setOpen(false); navigate?.(task.href!); }}>Open</Button>}
                </div>
              );
            })}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setVideoOpen(true)}><PlayCircle className="mr-2 h-4 w-4" />Watch tutorial</Button>
              <Button onClick={startTour}>Start walkthrough</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {touring && currentStep && createPortal(
        <div className="fixed inset-0 z-[1000]" aria-modal="true" role="dialog" aria-label="Kiini product walkthrough">
          {guidance.overlay.enabled && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: targetRect && guidance.pointer.type === "spotlight"
                  ? "transparent"
                  : guidance.overlay.color,
                opacity: guidance.overlay.opacity,
              }}
              onClick={guidance.overlay.closeOnOutsideClick ? (event) => {
                if (!targetRect ||
                  event.clientX < targetRect.left ||
                  event.clientX > targetRect.right ||
                  event.clientY < targetRect.top ||
                  event.clientY > targetRect.bottom
                ) finishTour();
              } : undefined}
            />
          )}
          {targetRect && (guidance.pointer.type === "spotlight" || guidance.pointer.type === "ring" || guidance.pointer.type === "arrow") && (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed z-[1001] rounded-md"
              style={{
                top: targetRect.top - 5,
                left: targetRect.left - 5,
                width: targetRect.width + 10,
                height: targetRect.height + 10,
                boxShadow: guidance.pointer.type === "spotlight"
                  ? `0 0 0 9999px color-mix(in srgb, ${guidance.overlay.color} ${guidance.overlay.opacity * 100}%, transparent)`
                  : undefined,
                outline: `${guidance.pointer.thickness}px solid ${guidance.pointer.color}`,
                outlineOffset: 1,
                borderRadius: 8,
              }}
            />
          )}
          <section
            className="fixed z-[1001] max-h-[calc(100vh-24px)] w-[min(376px,calc(100vw-24px))] overflow-y-auto rounded-lg border bg-background p-5 text-foreground shadow-2xl"
            style={tourPosition}
          >
            <button type="button" onClick={finishTour} aria-label="Close walkthrough" className="absolute right-3 top-3 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <p className="mb-2 pr-8 text-xs font-medium text-muted-foreground">
              {guidance.tooltip.showProgress ? `Step ${stepIndex + 1} of ${activeTourSteps.length}` : "Kiini walkthrough"}
            </p>
            <h2 className="pr-7 text-lg font-semibold">{currentStep.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentStep.description}</p>
            <div className="mt-5 flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => { finishTour(); setOpen(true); }}>Setup checklist</Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}>Previous</Button>
                <Button size="sm" onClick={() => {
                  if (stepIndex >= activeTourSteps.length - 1) finishTour();
                  else setStepIndex((index) => index + 1);
                }}>{stepIndex === activeTourSteps.length - 1 ? "Finish" : "Next"}</Button>
              </div>
            </div>
          </section>
        </div>,
        document.body,
      )}

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-3">
          <DialogHeader><DialogTitle>Quick start video</DialogTitle></DialogHeader>
          <div className="aspect-video overflow-hidden rounded-md bg-black"><iframe className="h-full w-full" src={guidance.videoUrl} title="Kiini quick start tutorial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
