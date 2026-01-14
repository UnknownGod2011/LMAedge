import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockLoans } from '@/data/mockLoans';
import { Loan } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitCompare, ArrowLeftRight, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonRowProps {
  label: string;
  value1: string | number | boolean | undefined;
  value2: string | number | boolean | undefined;
  mono?: boolean;
}

function ComparisonRow({ label, value1, value2, mono = false }: ComparisonRowProps) {
  const isDifferent = value1 !== value2;
  const formatValue = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  };

  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className={cn(
        mono && 'font-mono',
        isDifferent && 'font-medium'
      )}>
        {formatValue(value1)}
      </div>
      <div className={cn(
        mono && 'font-mono',
        isDifferent && 'font-medium'
      )}>
        {formatValue(value2)}
      </div>
    </div>
  );
}

export default function LoanCompare() {
  const [searchParams] = useSearchParams();
  const initialLoan1 = searchParams.get('loan1') || '';
  const initialLoan2 = searchParams.get('loan2') || '';

  const [loan1Id, setLoan1Id] = useState(initialLoan1);
  const [loan2Id, setLoan2Id] = useState(initialLoan2);

  const loan1 = mockLoans.find(l => l.id === loan1Id);
  const loan2 = mockLoans.find(l => l.id === loan2Id);

  const swapLoans = () => {
    const temp = loan1Id;
    setLoan1Id(loan2Id);
    setLoan2Id(temp);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Compare Loans</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Side-by-side comparison of loan terms
        </p>
      </div>

      {/* Loan Selectors */}
      <div className="enterprise-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={loan1Id} onValueChange={setLoan1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select first loan" />
              </SelectTrigger>
              <SelectContent>
                {mockLoans.map(loan => (
                  <SelectItem key={loan.id} value={loan.id} disabled={loan.id === loan2Id}>
                    <span className="font-mono text-xs mr-2">{loan.id}</span>
                    {loan.borrower.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={swapLoans}
            disabled={!loan1Id || !loan2Id}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Select value={loan2Id} onValueChange={setLoan2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select second loan" />
              </SelectTrigger>
              <SelectContent>
                {mockLoans.map(loan => (
                  <SelectItem key={loan.id} value={loan.id} disabled={loan.id === loan1Id}>
                    <span className="font-mono text-xs mr-2">{loan.id}</span>
                    {loan.borrower.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      {loan1 && loan2 ? (
        <div className="enterprise-card">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-border bg-muted/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Field
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{loan1.borrower.value}</span>
                {loan1.esg_linked.value && (
                  <Badge variant="secondary" className="gap-1 text-2xs">
                    <Leaf className="h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground">{loan1.id}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{loan2.borrower.value}</span>
                {loan2.esg_linked.value && (
                  <Badge variant="secondary" className="gap-1 text-2xs">
                    <Leaf className="h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground">{loan2.id}</span>
            </div>
          </div>

          {/* Core Terms */}
          <div className="p-4">
            <h3 className="section-header">Core Terms</h3>
            <ComparisonRow 
              label="Facility Type" 
              value1={loan1.facility_type.value} 
              value2={loan2.facility_type.value} 
            />
            <ComparisonRow 
              label="Currency" 
              value1={loan1.currency.value} 
              value2={loan2.currency.value} 
            />
            <ComparisonRow 
              label="Principal" 
              value1={loan1.principal.value} 
              value2={loan2.principal.value}
              mono 
            />
            <ComparisonRow 
              label="Interest Margin" 
              value1={loan1.interest_margin.value} 
              value2={loan2.interest_margin.value}
              mono 
            />
            <ComparisonRow 
              label="Maturity Date" 
              value1={new Date(loan1.maturity_date.value).toLocaleDateString('en-GB')} 
              value2={new Date(loan2.maturity_date.value).toLocaleDateString('en-GB')} 
            />
            <ComparisonRow 
              label="Number of Lenders" 
              value1={loan1.lenders.value.length} 
              value2={loan2.lenders.value.length} 
            />
          </div>

          {/* Economic Terms */}
          <div className="p-4 border-t border-border">
            <h3 className="section-header">Economic Terms</h3>
            <ComparisonRow 
              label="Repayment Schedule" 
              value1={loan1.repayment_schedule.value} 
              value2={loan2.repayment_schedule.value} 
            />
            <ComparisonRow 
              label="Arrangement Fee" 
              value1={loan1.arrangement_fee.value} 
              value2={loan2.arrangement_fee.value}
              mono 
            />
            <ComparisonRow 
              label="Commitment Fee" 
              value1={loan1.commitment_fee.value} 
              value2={loan2.commitment_fee.value} 
            />
          </div>

          {/* Covenants */}
          <div className="p-4 border-t border-border">
            <h3 className="section-header">Covenants</h3>
            <ComparisonRow 
              label="Financial Covenants" 
              value1={loan1.covenants.value.filter(c => c.type === 'financial').length} 
              value2={loan2.covenants.value.filter(c => c.type === 'financial').length} 
            />
            <ComparisonRow 
              label="Reporting Obligations" 
              value1={loan1.reporting_obligations.value.length} 
              value2={loan2.reporting_obligations.value.length} 
            />
          </div>

          {/* ESG */}
          <div className="p-4 border-t border-border">
            <h3 className="section-header">ESG</h3>
            <ComparisonRow 
              label="ESG-Linked" 
              value1={loan1.esg_linked.value} 
              value2={loan2.esg_linked.value} 
            />
            <ComparisonRow 
              label="ESG Targets" 
              value1={loan1.esg_terms.value.length} 
              value2={loan2.esg_terms.value.length} 
            />
          </div>

          {/* Metadata */}
          <div className="p-4 border-t border-border">
            <h3 className="section-header">Metadata</h3>
            <ComparisonRow 
              label="Current Version" 
              value1={`v${loan1.versions.length}`} 
              value2={`v${loan2.versions.length}`}
              mono 
            />
            <ComparisonRow 
              label="Last Updated" 
              value1={new Date(loan1.updated_at).toLocaleDateString('en-GB')} 
              value2={new Date(loan2.updated_at).toLocaleDateString('en-GB')} 
            />
          </div>
        </div>
      ) : (
        <div className="enterprise-card p-12 text-center">
          <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-sm font-medium">Select two loans to compare</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Use the dropdowns above to select loans for side-by-side comparison
          </p>
        </div>
      )}
    </div>
  );
}
