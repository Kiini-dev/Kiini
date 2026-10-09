import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { ChartOfAccountsSelector } from '@/components/ChartOfAccountsSelector';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getPaymentMethodOptions } from '@/const/paymentMethods';
import { getAccountNormalSide } from '@shared/accountingBalance';

interface PaymentDialogProps {
  invoiceId: string;
  clientId: string;
  invoiceTotal: number;
  paidAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function PaymentWithCOADialog({
  invoiceId,
  clientId,
  invoiceTotal,
  paidAmount,
  open,
  onOpenChange,
  onSuccess,
}: PaymentDialogProps) {
  const [formData, setFormData] = useState({
    amount: (invoiceTotal - paidAmount) / 100, // Convert from cents
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer' as const,
    accountId: '',
    referenceNumber: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [coaBalance, setCoaBalance] = useState<number | null>(null);
  const [coaBalanceSide, setCoaBalanceSide] = useState<'debit' | 'credit' | null>(null);

  // Fetch available COA accounts
  const { data: coaAccounts } = trpc.chartOfAccounts.list.useQuery({});

  // Fetch COA balance when account is selected
  const getBalanceMutation = trpc.enhancedPayments.getAccountBalance.useMutation();

  // Create payment mutation
  const createPaymentMutation = trpc.enhancedPayments.createPaymentWithCOA.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      onOpenChange(false);
      setFormData({
        amount: (invoiceTotal - paidAmount) / 100,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        accountId: '',
        referenceNumber: '',
        notes: '',
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Payment failed: ${error.message}`);
    },
  });

  const handleAccountChange = async (accountId: string) => {
    setFormData(prev => ({
      ...prev,
      accountId,
    }));
    setCoaBalance(null);
    setCoaBalanceSide(null);
    
    try {
      const balance = await getBalanceMutation.mutateAsync(accountId);
      setCoaBalance(balance.balance || 0);
      setCoaBalanceSide(balance.balanceSide);
    } catch (error) {
      toast.error('Failed to fetch account balance');
    }
  };

  const handleSubmit = async () => {
    if (!formData.accountId) {
      toast.error('Please select a Chart of Accounts');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    if (formData.amount > (invoiceTotal - paidAmount) / 100) {
      toast.error('Payment amount cannot exceed remaining invoice balance');
      return;
    }

    setLoading(true);
    try {
      await createPaymentMutation.mutateAsync({
        invoiceId,
        clientId,
        accountId: formData.accountId,
        amount: formData.amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const remainingBalance = (invoiceTotal - paidAmount) / 100;
  const selectedAccount = coaAccounts?.find(acc => acc.id === formData.accountId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment with COA</DialogTitle>
          <DialogDescription>
            Record payment and update Chart of Accounts balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Display */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Invoice Total:</span>
                  <span className="font-semibold">KES {(invoiceTotal / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="font-semibold">KES {(paidAmount / 100).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-bold text-red-600">KES {remainingBalance.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={remainingBalance}
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
            {formData.amount > remainingBalance && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Amount exceeds remaining balance</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getPaymentMethodOptions().map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart of Accounts */}
          <div className="space-y-2">
            <Label htmlFor="accountId">Chart of Accounts</Label>
            <ChartOfAccountsSelector accounts={coaAccounts ?? []} value={formData.accountId} onChange={handleAccountChange} placeholder="Select COA account" />

            {selectedAccount && coaBalance !== null && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Current Balance: KES {Math.abs(coaBalance / 100).toLocaleString()} {coaBalanceSide === 'debit' ? 'Dr' : 'Cr'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {selectedAccount && (
            <p className="text-sm text-muted-foreground">
              This payment posts as a {getAccountNormalSide(selectedAccount.accountType)} to match the account's normal balance.
            </p>
          )}

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
            <Input
              id="referenceNumber"
              value={formData.referenceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
              placeholder="Cheque #, Transaction ID, etc."
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this payment..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.accountId || formData.amount <= 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Record Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
