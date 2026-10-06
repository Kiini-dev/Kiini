import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Download, Upload, Loader2, CheckCircle, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const BackupRestore: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    backupType: "FULL" as "FULL" | "INCREMENTAL",
    schedule: "",
    retentionDays: 30,
  });

  // Queries and mutations
  const createBackupMutation = trpc.backupRestore.createBackup.useMutation({
    onSuccess: (data) => {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastBackupDate(new Date().toLocaleString());
      const totalRecords = Object.values(data.data).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
      toast.success(`Backup created with ${totalRecords} records from ${Object.keys(data.data).length} tables`);
      setIsBackingUp(false);
      refetchBackupHistory(); // Refresh the backup history
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create backup');
      setIsBackingUp(false);
    },
  });

  const restoreMutation = trpc.backupRestore.restoreBackup.useMutation({
    onSuccess: (data) => {
      const totalInserted = Object.values(data.results).reduce((sum: number, result: any) => sum + result.inserted, 0);
      toast.success(`Backup restored successfully! ${totalInserted} records restored from ${Object.keys(data.results).length} tables`);
      setSelectedFile(null);
      setShowRestoreConfirm(false);
      setIsRestoring(false);
      refetchBackupHistory(); // Refresh the backup history
    },
    onError: (error) => {
      toast.error(error.message || "Failed to restore backup");
      setIsRestoring(false);
    },
  });

  const { data: backupHistory, refetch: refetchBackupHistory } = trpc.backupRestore.listBackups.useQuery();

  const deleteBackupMutation = trpc.backupRestore.deleteBackup.useMutation({
    onSuccess: () => {
      toast.success("Backup history entry deleted");
      refetchBackupHistory();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete backup history");
    },
  });

  const { data: backupSchedules, refetch: refetchBackupSchedules } = trpc.backupRestore.listBackupSchedules.useQuery();

  const createBackupScheduleMutation = trpc.backupRestore.createBackupSchedule.useMutation({
    onSuccess: () => {
      toast.success("Backup schedule created");
      refetchBackupSchedules();
      setShowScheduleDialog(false);
      setScheduleForm({ name: "", backupType: "FULL", schedule: "", retentionDays: 30 });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create backup schedule");
    },
  });

  const updateBackupScheduleMutation = trpc.backupRestore.updateBackupSchedule.useMutation({
    onSuccess: () => {
      toast.success("Backup schedule updated");
      refetchBackupSchedules();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update backup schedule");
    },
  });

  const deleteBackupScheduleMutation = trpc.backupRestore.deleteBackupSchedule.useMutation({
    onSuccess: () => {
      toast.success("Backup schedule deleted");
      refetchBackupSchedules();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete backup schedule");
    },
  });

  const handleCreateBackup = () => {
    try {
      setIsBackingUp(true);
      createBackupMutation.mutate({
        includeActivityLogs: true,
        label: `Manual backup ${new Date().toLocaleString()}`,
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create backup');
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Please select a backup file to restore');
      return;
    }

    try {
      setIsRestoring(true);
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);
      
      // Validate backup format
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      restoreMutation.mutate({
        backup: backupData,
        dryRun: false, // Actually perform the restore
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to read or parse backup file');
      setIsRestoring(false);
    }
  };

  const openCreateSchedule = () => {
    setEditingScheduleId(null);
    setScheduleForm({ name: "", backupType: "FULL", schedule: "", retentionDays: 30 });
    setShowScheduleDialog(true);
  };

  const openEditSchedule = (schedule: any) => {
    setEditingScheduleId(schedule.id);
    setScheduleForm({
      name: schedule.name || "",
      backupType: String(schedule.backupType || "FULL").toUpperCase() as "FULL" | "INCREMENTAL",
      schedule: schedule.schedule || "",
      retentionDays: Number(schedule.retentionDays) || 30,
    });
    setShowScheduleDialog(true);
  };

  const handleSaveSchedule = async () => {
    try {
      if (editingScheduleId) {
        await updateBackupScheduleMutation.mutateAsync({ id: editingScheduleId, ...scheduleForm });
      } else {
        await createBackupScheduleMutation.mutateAsync(scheduleForm);
      }
      setShowScheduleDialog(false);
      setEditingScheduleId(null);
    } catch {
      // Mutation handlers show the request error.
    }
  };

  return (
    <div>
    <div className="space-y-6">
      {/* Backup Section */}
      <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Create Backup</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Create a complete backup of your database that can be restored later.
            </p>
          </div>

          {lastBackupDate && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Last backup: {lastBackupDate}
              </span>
            </div>
          )}

          <Button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="w-full dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          >
            {isBackingUp ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating backup...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Restore from Backup</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Restore your database from a previously created backup file.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Restoring a backup will add new records and skip duplicates. This action cannot be undone.
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Backup File</label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </Button>
            </div>
          </div>

          <Button
            onClick={() => setShowRestoreConfirm(true)}
            disabled={!selectedFile || isRestoring}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white"
          >
            {isRestoring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Restore Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Backup History Section */}
      <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Backup History</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              View all backup and restore operations performed on the system.
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {backupHistory && backupHistory.length > 0 ? (
              backupHistory.map((backup: any) => (
                <div key={backup.id} className="p-3 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">{backup.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          backup.backupType === 'full' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          backup.backupType === 'restore' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {backup.backupType}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          backup.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {backup.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {backup.recordCount ? `${backup.recordCount} records` : 'N/A'} • 
                        {backup.tables ? `${backup.tables.length} tables` : 'N/A'} • 
                        {backup.completedAt ? new Date(backup.completedAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this backup history entry?')) {
                          deleteBackupMutation.mutate(backup.id);
                        }
                      }}
                      className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No backup history available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scheduled Backups Section */}
      <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Scheduled Backups</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Manage automated backup schedules for regular system backups.
              </p>
            </div>
            <Button onClick={openCreateSchedule} className="dark:bg-blue-600 dark:hover:bg-blue-700">
              Create Schedule
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {backupSchedules && backupSchedules.length > 0 ? (
              backupSchedules.map((schedule: any) => (
                <div key={schedule.id} className="p-3 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">{schedule.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          schedule.backupType === 'FULL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {schedule.backupType}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          schedule.status === 'SCHEDULED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          schedule.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {schedule.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        Schedule: {schedule.schedule} • Retention: {schedule.retentionDays} days
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Last run: {schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'} • 
                        Next run: {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newStatus = String(schedule.status).toUpperCase() === 'SCHEDULED' ? 'PAUSED' : 'SCHEDULED';
                          updateBackupScheduleMutation.mutate({
                            id: schedule.id,
                            status: newStatus,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                          {String(schedule.status).toUpperCase() === 'SCHEDULED' ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit schedule"
                        aria-label={`Edit ${schedule.name}`}
                        onClick={() => openEditSchedule(schedule)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this backup schedule?')) {
                            deleteBackupScheduleMutation.mutate(schedule.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No scheduled backups configured
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Schedule Dialog */}
      <AlertDialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">{editingScheduleId ? "Edit Backup Schedule" : "Create Backup Schedule"}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-300">
              Set up an automated backup schedule for regular system backups.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Schedule Name
              </label>
              <input
                type="text"
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Daily Full Backup"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Backup Type
              </label>
              <select
                value={scheduleForm.backupType}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, backupType: e.target.value as "FULL" | "INCREMENTAL" }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="FULL">Full Backup</option>
                <option value="INCREMENTAL">Incremental Backup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Schedule (Cron Expression)
              </label>
              <input
                type="text"
                value={scheduleForm.schedule}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, schedule: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="0 2 * * * (Daily at 2 AM)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Retention Days
              </label>
              <input
                type="number"
                value={scheduleForm.retentionDays}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, retentionDays: parseInt(e.target.value) || 30 }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                min="1"
                max="365"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveSchedule}
              disabled={!scheduleForm.name || !scheduleForm.schedule || createBackupScheduleMutation.isPending || updateBackupScheduleMutation.isPending}
            >
              {editingScheduleId ? "Save Changes" : "Create Schedule"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Confirm Restore</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-300">
            This will restore your database from the selected backup file.
            New records will be added and duplicates will be skipped. This action cannot be undone.
          </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>File:</strong> {selectedFile?.name}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Mode:</strong> Merge (Add new records, skip duplicates)
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Confirm Restore
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </div>
  );
};

export default BackupRestore;
