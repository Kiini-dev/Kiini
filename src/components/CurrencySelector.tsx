import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { CurrencyCode } from '@/server/services/currencyService';

interface CurrencySelectorProps {
  organizationId: string;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  showRates?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  organizationId,
  onCurrencyChange,
  showRates = false,
}) => {
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('KES');
  const [loading, setLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  // Get supported currencies
  const { data: currencies } = api.currency.getSupportedCurrencies.useQuery();

  // Fetch exchange rates if showing rates
  useEffect(() => {
    if (!showRates) return;

    const fetchRates = async () => {
      setLoading(true);
      try {
        // TODO: Call API endpoint to fetch exchange rates
        // const rates = await api.currency.getExchangeRates.query({ baseCurrency: selectedCurrency });
        // setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [selectedCurrency, showRates]);

  const handleCurrencyChange = async (value: CurrencyCode) => {
    setSelectedCurrency(value);
    
    // Update organization setting
    try {
      // TODO: Call API to update organization currency
      // await api.currency.setOrganizationCurrency.mutate({
      //   organizationId,
      //   currency: value,
      // });

      onCurrencyChange?.(value);
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  return (
    <div className="space-y-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t('common.currency', 'Currency Settings')}
        </CardTitle>
        <CardDescription>
          {t('currency.selectCurrency', 'Select your organization\'s base currency')}
        </CardDescription>
      </CardHeader>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">
            {t('common.baseCurrency', 'Base Currency')}
          </label>
          <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies?.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{currency.symbol}</span>
                    <span>{currency.code}</span>
                    <span className="text-xs text-gray-500">{currency.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showRates && (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            {loading ? t('common.loading', 'Loading...') : t('common.refresh', 'Refresh Rates')}
          </Button>
        )}
      </div>

      {showRates && Object.keys(exchangeRates).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">
            {t('currency.exchangeRates', 'Exchange Rates')}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(exchangeRates).map(([currency, rate]) => (
              <div key={currency} className="flex justify-between">
                <span>{currency}:</span>
                <span className="font-mono">{rate.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;