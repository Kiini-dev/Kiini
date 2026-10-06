import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Share2, Trash2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { usePermissionAuditLog } from "@/hooks/usePermissionAuditLog";

export interface PermissionDelegation {
  id: string;
  fromUserId: string;
  toUserId: string;
  features: string[];
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
}

interface DelegationRequestData {
  targetUserId: string;
  features: string[];
  durationDays: number;
  reason?: string;
}

/**
 * Permission Delegation Component
 * Allows authorized users to temporarily delegate permissions to others
 */
export function PermissionDelegation() {
  const { hasAccess } = useOrgAccess();
  const { logPermissionDelegate } = usePermissionAuditLog();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [durationDays, setDurationDays] = useState("7");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canDelegate = hasAccess("org:settings:manage");

  const { data: users = [] } = trpc.users.listOrgUsers.useQuery(undefined, {
    staleTime: 60_000,
  });

  const { data: delegations = [] } = trpc.permissions.listDelegations.useQuery(undefined, {
    staleTime: 30_000,
  });

  const delegateMutation = trpc.permissions.delegatePermissions.useMutation({
    onSuccess: () => {
      toast.success("Permission delegated", { description: "Permissions delegated successfully." });
      logPermissionDelegate(selectedFeatures.values().next().value || "", "", selectedUser, parseInt(durationDays));
      resetForm();
      setIsOpen(false);
    },
    onError: (err) => {
      toast.error("Failed to delegate permissions", { description: err.message });
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setSelectedUser("");
    setSelectedFeatures(new Set());
    setDurationDays("7");
    setReason("");
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = new Set(selectedFeatures);
    if (newFeatures.has(feature)) {
      newFeatures.delete(feature);
    } else {
      newFeatures.add(feature);
    }
    setSelectedFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canDelegate) {
      toast.error("Access denied", { description: "You don't have permission to delegate permissions." });
      return;
    }

    if (!selectedUser) {
      toast.error("No user selected", { description: "Please select a user to delegate permissions to." });
      return;
    }

    if (selectedFeatures.size === 0) {
      toast.error("No features selected", { description: "Please select at least one feature to delegate." });
      return;
    }

    setIsSubmitting(true);
    delegateMutation.mutate({
      targetUserId: selectedUser,
      features: Array.from(selectedFeatures),
      durationDays: parseInt(durationDays),
      reason: reason || undefined,
    });
  };

  const removeMutation = trpc.permissions.revokeDelegation.useMutation({
    onSuccess: () => {
      toast.success("Delegation revoked", { description: "Permission delegation revoked successfully." });
    },
  });

  if (!canDelegate) {
    return null;
  }

  const DELEGABLE_FEATURES = [
    "org:invoicing:approve",
    "org:expenses:approve",
    "org:employees:manage",
    "org:payroll:manage",
    "org:projects:manage",
  ];

  return (
    <>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Permission Delegation
          </CardTitle>
          <CardDescription>
            Temporarily delegate your permissions to other team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={() => setIsOpen(true)} size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Delegate Permissions
          </Button>

          {delegations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Active Delegations</h3>
              {delegations.map((delegation: PermissionDelegation) => {
                const isExpired = new Date(delegation.endDate) < new Date();
                const targetUser = users.find((u: any) => u.id === delegation.toUserId);

                return (
                  <div key={delegation.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {targetUser?.name || delegation.toUserId}
                        </p>
                        {isExpired && (
                          <Badge variant="secondary" className="bg-red-500/20 text-red-200">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/60">
                        {delegation.features.length} features • Expires {new Date(delegation.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(delegation.id)}
                      className="text-white/50 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delegate Permissions</DialogTitle>
            <DialogDescription>
              Temporarily delegate permissions to another team member. They will have these permissions until the end date.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-user">User *</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u: any) => u.id !== "current_user_id") // Filter out current user
                    .map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Features to Delegate *</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {DELEGABLE_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={feature}
                      checked={selectedFeatures.has(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5"
                    />
                    <label htmlFor={feature} className="text-sm text-white/70 cursor-pointer">
                      {feature.replace("org:", "").replace(":", " ").toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Select value={durationDays} onValueChange={setDurationDays}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="Why are you delegating these permissions?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-white/5 border-white/10 text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedUser || selectedFeatures.size === 0}
              >
                {isSubmitting ? "Delegating..." : "Delegate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
