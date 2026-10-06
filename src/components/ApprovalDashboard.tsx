import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  entityType: string;
  entityId: string;
  status: 'pending' | 'approved' | 'rejected' | 'partial' | 'escalated';
  currentLevel: number;
  totalLevels: number;
  amount?: number;
  requestedAt: Date;
  dueDate?: Date;
  requestedBy: string;
  reason?: string;
}

interface ApprovalDashboardProps {
  organizationId: string;
  userId: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'escalated':
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    default:
      return <Clock className="h-4 w-4 text-blue-600" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, any> = {
    pending: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    escalated: 'bg-orange-100 text-orange-800',
  };

  return variants[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({
  organizationId,
  userId,
}) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'history'>('pending');

  // Mock data - replace with API calls
  const pendingRequests: ApprovalRequest[] = [
    {
      id: '1',
      entityType: 'purchase_order',
      entityId: 'PO-001',
      status: 'pending',
      currentLevel: 1,
      totalLevels: 3,
      amount: 50000,
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      requestedBy: 'John Doe',
      reason: 'Office supplies procurement',
    },
  ];

  const historyRequests: ApprovalRequest[] = [
    {
      id: '2',
      entityType: 'expense_claim',
      entityId: 'EXP-042',
      status: 'approved',
      currentLevel: 3,
      totalLevels: 3,
      amount: 15000,
      requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      requestedBy: 'Jane Smith',
      reason: 'Travel expenses',
    },
  ];

  const requests = selectedTab === 'pending' ? pendingRequests : historyRequests;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('approvals.pending', 'Pending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-gray-500">
              {t('approvals.awaitingAction', 'awaiting your action')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('approvals.approved', 'Approved')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">24</div>
            <p className="text-xs text-gray-500">
              {t('approvals.thisMonth', 'this month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('approvals.rejected', 'Rejected')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-gray-500">
              {t('approvals.thisMonth', 'this month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('approvals.avgTime', 'Avg. Time')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5d</div>
            <p className="text-xs text-gray-500">
              {t('approvals.toApprove', 'to approve')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('approvals.requests', 'Approval Requests')}</CardTitle>
              <CardDescription>
                {t('approvals.manageRequests', 'Manage and track approval workflows')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedTab === 'pending' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('pending')}
                size="sm"
              >
                {t('approvals.pending', 'Pending')}
              </Button>
              <Button
                variant={selectedTab === 'history' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('history')}
                size="sm"
              >
                {t('approvals.history', 'History')}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('approvals.noRequests', 'No requests to display')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.id', 'ID')}</TableHead>
                    <TableHead>{t('common.type', 'Type')}</TableHead>
                    <TableHead>{t('common.amount', 'Amount')}</TableHead>
                    <TableHead>{t('approvals.status', 'Status')}</TableHead>
                    <TableHead>{t('approvals.progress', 'Progress')}</TableHead>
                    <TableHead>{t('common.requestedBy', 'Requested By')}</TableHead>
                    <TableHead>{t('common.date', 'Date')}</TableHead>
                    <TableHead>{t('common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.entityId}</TableCell>
                      <TableCell className="capitalize">
                        {request.entityType.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {request.amount
                          ? `KSh ${request.amount.toLocaleString()}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <Badge className={getStatusBadge(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(request.currentLevel / request.totalLevels) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {request.currentLevel}/{request.totalLevels}
                        </span>
                      </TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>{formatDate(request.requestedAt)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              {t('common.approve', 'Approve')}
                            </Button>
                            <Button variant="outline" size="sm">
                              {t('common.reject', 'Reject')}
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <Button variant="ghost" size="sm">
                            {t('common.view', 'View')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalDashboard;