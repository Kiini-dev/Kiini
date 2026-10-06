import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import mutateAsync from '@/lib/mutationHelpers';

interface ResetToDefaultButtonProps {
  settingKey?: string;
  category?: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onSuccess?: () => void;
}

export function ResetToDefaultButton({
  settingKey,
  category,
  label = 'Reset to Default',
  variant = 'outline',
  size = 'sm',
  onSuccess,
}: ResetToDefaultButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetSettingMutation = trpc.settings.resetSettingToDefault.useMutation();
  const resetCategoryMutation = trpc.settings.resetCategoryToDefaults.useMutation();

  const handleReset = async () => {
    setIsLoading(true);
    try {
      if (settingKey) {
        await mutateAsync(resetSettingMutation, { key: settingKey });
        toast.success(`Setting reset to default`);
      } else if (category) {
        await mutateAsync(resetCategoryMutation, { category });
        toast.success(`All settings in ${category} reset to defaults`);
      }
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(`Failed to reset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        {label}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
            <AlertDialogDescription>
              {settingKey
                ? `This will reset the setting "${settingKey}" to its default value. This action cannot be undone.`
                : `This will reset all settings in the "${category}" category to their default values. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Resetting...' : 'Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

