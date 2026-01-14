import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockLoans } from '@/data/mockLoans';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, X, Leaf, ArrowRight } from 'lucide-react';

export default function LoanSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [esgFilter, setEsgFilter] = useState<string>('all');
  const [marginRange, setMarginRange] = useState<[number, number]>([0, 500]);
  const [facilityFilter, setFacilityFilter] = useState<string>('all');

  const currencies = [...new Set(mockLoans.map(l => l.currency.value))];
  const facilityTypes = [...new Set(mockLoans.map(l => l.facility_type.value))];

  const getMarginBps = (marginStr: string): number => {
    const match = marginStr.match(/(\d+)\s*bps/);
    return match ? parseInt(match[1]) : 0;
  };

  const filteredLoans = useMemo(() => {
    return mockLoans.filter(loan => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesBorrower = loan.borrower.value.toLowerCase().includes(query);
        const matchesId = loan.id.toLowerCase().includes(query);
        const matchesLender = loan.lenders.value.some(l => l.toLowerCase().includes(query));
        if (!matchesBorrower && !matchesId && !matchesLender) return false;
      }

      // Currency filter
      if (currencyFilter !== 'all' && loan.currency.value !== currencyFilter) return false;

      // ESG filter
      if (esgFilter === 'yes' && !loan.esg_linked.value) return false;
      if (esgFilter === 'no' && loan.esg_linked.value) return false;

      // Facility type filter
      if (facilityFilter !== 'all' && loan.facility_type.value !== facilityFilter) return false;

      // Margin range filter
      const marginBps = getMarginBps(loan.interest_margin.value);
      if (marginBps < marginRange[0] || marginBps > marginRange[1]) return false;

      return true;
    });
  }, [searchQuery, currencyFilter, esgFilter, facilityFilter, marginRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setCurrencyFilter('all');
    setEsgFilter('all');
    setFacilityFilter('all');
    setMarginRange([0, 500]);
  };

  const hasActiveFilters = searchQuery || currencyFilter !== 'all' || esgFilter !== 'all' || 
    facilityFilter !== 'all' || marginRange[0] !== 0 || marginRange[1] !== 500;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Search & Filter</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Query the loan database with advanced filters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <div className="enterprise-card p-4 space-y-6 sticky top-20">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filters</h2>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Borrower, ID, or lender..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-xs">Currency</Label>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All currencies</SelectItem>
                  {currencies.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Facility Type */}
            <div className="space-y-2">
              <Label className="text-xs">Facility Type</Label>
              <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {facilityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ESG */}
            <div className="space-y-2">
              <Label className="text-xs">ESG-Linked</Label>
              <Select value={esgFilter} onValueChange={setEsgFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All loans</SelectItem>
                  <SelectItem value="yes">ESG-linked only</SelectItem>
                  <SelectItem value="no">Non-ESG only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Margin Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Interest Margin (bps)</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {marginRange[0]} - {marginRange[1]}
                </span>
              </div>
              <Slider
                value={marginRange}
                onValueChange={(value) => setMarginRange(value as [number, number])}
                min={0}
                max={500}
                step={25}
                className="py-2"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="enterprise-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-semibold">
                Results
                <span className="ml-2 text-muted-foreground font-normal">
                  ({filteredLoans.length} loan{filteredLoans.length !== 1 ? 's' : ''})
                </span>
              </h2>
            </div>

            {filteredLoans.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No loans match your filters
                </p>
                <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-3">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredLoans.map((loan) => (
                  <div key={loan.id} className="p-4 interactive">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{loan.borrower.value}</span>
                          <span className="text-xs font-mono text-muted-foreground">{loan.id}</span>
                          {loan.esg_linked.value && (
                            <Badge variant="secondary" className="gap-1 text-2xs">
                              <Leaf className="h-2.5 w-2.5" />
                              ESG
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {loan.facility_type.value}
                        </p>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Principal</span>
                        <p className="font-mono mt-0.5">
                          {loan.currency.value} {loan.principal.value}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin</span>
                        <p className="font-mono mt-0.5">{loan.interest_margin.value}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Maturity</span>
                        <p className="mt-0.5">
                          {new Date(loan.maturity_date.value).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <Link 
                          to={`/loans/${loan.id}`}
                          className="inline-flex items-center text-primary hover:underline"
                        >
                          View Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
