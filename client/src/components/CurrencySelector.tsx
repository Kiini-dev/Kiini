import React, { useState, useEffect } from 'react';
import { type CurrencyCode, CURRENCIES as SUPPORTED_CURRENCIES } from '@/pages/website/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Globe, DollarSign } from 'lucide-react';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  onFormatChange?: (format: 'symbol' | 'code') => void;
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * CurrencySelector - Component for selecting currency
 * Displays supported African currencies with symbol and code
 */
export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  onFormatChange,
  showLabel = true,
  disabled = false,
  className = '',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'symbol' | 'code'>('symbol');

  const handleFormatChange = (format: 'symbol' | 'code') => {
    setSelectedFormat(format);
    onFormatChange?.(format);
  };

  const currencies = Object.entries(SUPPORTED_CURRENCIES).map(([code, details]) => ({
    code: code as CurrencyCode,
    ...details,
  }));

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <label className="text-sm font-medium text-gray-700">Currency</label>
        </div>
      )}

      <div className="space-y-2">
        <Select value={value} onOpenChange={() => {}} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem
                key={currency.code}
                value={currency.code}
                onClick={() => onChange(currency.code)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span>{currency.code}</span>
                  <span className="text-gray-500 text-sm">- {currency.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Format selector */}
      <div className="flex gap-2">
        <button
          onClick={() => handleFormatChange('symbol')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            selectedFormat === 'symbol'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Symbol {SUPPORTED_CURRENCIES[value]?.symbol}
        </button>
        <button
          onClick={() => handleFormatChange('code')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            selectedFormat === 'code'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Code {value}
        </button>
      </div>

      {/* Preview */}
      <Card className="p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Preview:</span>
          <span className="text-lg font-semibold">
            {selectedFormat === 'symbol' ? (
              <>
                {SUPPORTED_CURRENCIES[value]?.symbol} 1,000.00
              </>
            ) : (
              <>
                1,000.00 {value}
              </>
            )}
          </span>
        </div>
      </Card>

      {/* Info */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <p>
          Current rate: 1 {value} = $
          {(1 / SUPPORTED_CURRENCIES[value]?.rate).toFixed(4)} USD
        </p>
      </div>
    </div>
  );
};

export default CurrencySelector;
