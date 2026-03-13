import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CARRIER_LABELS } from '../types';
import type { CarrierType } from '../types';

interface RateQuote {
  service: string;
  transitDays: number;
  baseRate: number;
  fuelSurcharge: number;
  discount: number;
  totalRate: number;
}

interface RateCalculatorTabProps {
  carrier: CarrierType;
}

const servicesByCarrier: Record<CarrierType, string[]> = {
  fedex: ['Ground', 'Express Saver', '2Day', 'Priority Overnight', 'Standard Overnight'],
  ups: ['Ground', 'Surepost', '3 Day Select', '2nd Day Air', 'Next Day Air'],
  usps: ['Priority Mail', 'First Class', 'Parcel Select', 'Priority Mail Express'],
  dhl: ['Express Worldwide', 'Express 12:00', 'Economy Select'],
};

export function RateCalculatorTab({ carrier }: RateCalculatorTabProps) {
  const [originZip, setOriginZip] = useState('90210');
  const [destinationZip, setDestinationZip] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [quotes, setQuotes] = useState<RateQuote[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    if (!destinationZip || !weight) return;

    setIsCalculating(true);

    // Simulate API call with carrier-specific rates
    setTimeout(() => {
      const services = servicesByCarrier[carrier];
      const baseRates = [12.50, 24.00, 32.00, 45.00, 52.00];
      const transitDays = [5, 3, 2, 1, 1];

      setQuotes(
        services.slice(0, 4).map((service, i) => ({
          service,
          transitDays: transitDays[i],
          baseRate: baseRates[i],
          fuelSurcharge: baseRates[i] * 0.145,
          discount: baseRates[i] * 0.2,
          totalRate: baseRates[i] + (baseRates[i] * 0.145) - (baseRates[i] * 0.2),
        }))
      );
      setIsCalculating(false);
    }, 800);
  };

  const cheapestQuote = quotes.length > 0 ? quotes.reduce((min, q) => q.totalRate < min.totalRate ? q : min) : null;
  const fastestQuote = quotes.length > 0 ? quotes.reduce((min, q) => q.transitDays < min.transitDays ? q : min) : null;

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 p-4 rounded-lg border border-border bg-gray-50">
          <h4 className="font-medium text-text-primary mb-3">Shipment Details</h4>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Origin ZIP</label>
                <input
                  type="text"
                  value={originZip}
                  onChange={(e) => setOriginZip(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                  placeholder="90210"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Destination ZIP</label>
                <input
                  type="text"
                  value={destinationZip}
                  onChange={(e) => setDestinationZip(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                  placeholder="10001"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Dimensions (L × W × H)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                  className="w-full px-2 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                  placeholder="L"
                />
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                  className="w-full px-2 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                  placeholder="W"
                />
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                  className="w-full px-2 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                  placeholder="H"
                />
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleCalculate}
              disabled={!destinationZip || !weight || isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                `Get ${CARRIER_LABELS[carrier]} Rates`
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {quotes.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <p className="text-text-secondary">Enter shipment details to get {CARRIER_LABELS[carrier]} rates</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Best Options */}
              <div className="grid grid-cols-2 gap-3">
                {cheapestQuote && (
                  <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                    <Badge className="bg-green-100 text-green-700 mb-2">Cheapest</Badge>
                    <div className="text-xl font-bold text-text-primary">${cheapestQuote.totalRate.toFixed(2)}</div>
                    <div className="text-sm text-text-secondary">{cheapestQuote.service}</div>
                    <div className="text-xs text-text-muted">{cheapestQuote.transitDays} day{cheapestQuote.transitDays !== 1 ? 's' : ''}</div>
                  </div>
                )}
                {fastestQuote && (
                  <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                    <Badge className="bg-blue-100 text-blue-700 mb-2">Fastest</Badge>
                    <div className="text-xl font-bold text-text-primary">${fastestQuote.totalRate.toFixed(2)}</div>
                    <div className="text-sm text-text-secondary">{fastestQuote.service}</div>
                    <div className="text-xs text-text-muted">{fastestQuote.transitDays} day{fastestQuote.transitDays !== 1 ? 's' : ''}</div>
                  </div>
                )}
              </div>

              {/* All Rates Table */}
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-border">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase">Service</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase">Transit</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase">Base</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase">Fuel</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase">Discount</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {quotes.map((quote, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 font-medium text-text-primary">{quote.service}</td>
                        <td className="px-3 py-2 text-text-secondary">{quote.transitDays}d</td>
                        <td className="px-3 py-2 text-right font-mono text-sm">${quote.baseRate.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-mono text-sm text-text-muted">+${quote.fuelSurcharge.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-mono text-sm text-green-600">-${quote.discount.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-mono text-sm font-semibold">${quote.totalRate.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
