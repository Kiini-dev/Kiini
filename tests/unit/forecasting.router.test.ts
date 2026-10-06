import { describe, expect, it } from 'vitest';
import { buildForecastSeries, summarizeForecast } from '../../server/routers/forecasting';

describe('forecasting data helpers', () => {
  it('returns no mock values when the history is empty', () => {
    const series = buildForecastSeries([], 6, 'base');

    expect(series).toEqual([]);
    expect(summarizeForecast([])).toEqual({
      avgForecast: 0,
      rangeLow: 0,
      rangeHigh: 0,
      rSquared: 0,
      trend: 'flat',
    });
  });

  it('uses real observed history to produce a forecast series', () => {
    const series = buildForecastSeries([100, 110, 120, 130], 3, 'optimistic');

    expect(series.length).toBe(3);
    expect(series[0].forecast).toBeGreaterThan(0);
    expect(series.every((point) => Number.isFinite(point.forecast))).toBe(true);
  });
});
