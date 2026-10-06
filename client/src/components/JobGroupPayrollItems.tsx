import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface JobGroupPayrollItem {
  type: string;
  amount: string;
  percentage?: string;
  frequency?: "monthly" | "quarterly" | "annual" | "one_time";
}

interface JobGroupPayrollItemsProps {
  label: string;
  items: JobGroupPayrollItem[];
  onChange: (items: JobGroupPayrollItem[]) => void;
  amountOptional?: boolean;
}

export function JobGroupPayrollItems({ label, items, onChange, amountOptional = false }: JobGroupPayrollItemsProps) {
  const updateItem = (index: number, patch: Partial<JobGroupPayrollItem>) => {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { type: "", amount: "", frequency: "monthly" }])}>
          <Plus className="h-3 w-3 mr-1" /> Add line
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No defaults configured.</p>
      ) : items.map((item, index) => (
        <div key={`${label}-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_auto]">
          <Input
            placeholder={label === "Default Benefits" ? "Medical insurance" : "Type"}
            value={item.type}
            onChange={(event) => updateItem(index, { type: event.target.value })}
            className="flex-1"
          />
          {!amountOptional && (
            <Input
              type="number"
              min="0"
              placeholder="Amount"
              value={item.amount}
              onChange={(event) => updateItem(index, { amount: event.target.value })}
              className="w-28"
            />
          )}
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="Percent"
            value={item.percentage || ""}
            onChange={(event) => updateItem(index, { percentage: event.target.value })}
            className="w-full"
            aria-label={`${label} percentage ${index + 1}`}
          />
          <select
            value={item.frequency || "monthly"}
            onChange={(event) => updateItem(index, { frequency: event.target.value as JobGroupPayrollItem["frequency"] })}
            className="h-10 rounded-md border bg-background px-2 text-sm"
            aria-label={`${label} frequency ${index + 1}`}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
            <option value="one_time">One time</option>
          </select>
          <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${label} line ${index + 1}`} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
