import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  keywords?: string;
}

interface SearchableSelectProps {
  id?: string;
  value: string;
  options: SearchableSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  isLoading?: boolean;
  allowCustomValue?: boolean;
  customValueLabel?: (value: string) => string;
  required?: boolean;
  ariaLabel?: string;
}

export function SearchableSelect({
  id,
  value,
  options,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  isLoading = false,
  allowCustomValue = false,
  customValueLabel = (customValue) => `Use "${customValue}"`,
  required = false,
  ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedOption = options.find((option) => option.value === value);
  const customValue = searchValue.trim();
  const hasMatchingOption = options.some(
    (option) => option.label.toLocaleLowerCase() === customValue.toLocaleLowerCase(),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-required={required}
          aria-label={ariaLabel}
          className="w-full justify-between font-normal"
          disabled={disabled || isLoading}
        >
          <span className="truncate">{selectedOption?.label ?? (allowCustomValue ? value || placeholder : placeholder)}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {required && (
        <input
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
          required
          value={selectedOption ? selectedOption.value : allowCustomValue ? value : ""}
          onChange={() => undefined}
        />
      )}
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} value={searchValue} onValueChange={setSearchValue} />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading options...</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.keywords ?? ""}`}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 size-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                ))}
                {allowCustomValue && customValue && !hasMatchingOption && (
                  <CommandItem
                    value={`custom ${customValue}`}
                    onSelect={() => {
                      onValueChange(customValue);
                      setSearchValue("");
                      setOpen(false);
                    }}
                  >
                    {customValueLabel(customValue)}
                  </CommandItem>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
