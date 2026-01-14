import { Link } from 'react-router-dom';
import { mockLoans } from '@/data/mockLoans';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceIndicator } from '@/components/ui/ConfidenceIndicator';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Leaf } from 'lucide-react';

export default function LoansList() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Loans</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All digitised loan records
        </p>
      </div>

      <div className="enterprise-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Principal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Maturity
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ESG
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Version
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockLoans.map((loan) => (
                <tr key={loan.id} className="data-row">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono">{loan.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{loan.borrower.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {loan.lenders.value.length} lender{loan.lenders.value.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{loan.facility_type.value}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-mono">
                        {loan.currency.value} {loan.principal.value}
                      </span>
                      <ConfidenceIndicator confidence={loan.principal.confidence} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{loan.interest_margin.value}</span>
                      <ConfidenceIndicator confidence={loan.interest_margin.confidence} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono">
                      {new Date(loan.maturity_date.value).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {loan.esg_linked.value ? (
                      <Badge variant="secondary" className="gap-1">
                        <Leaf className="h-3 w-3" />
                        ESG
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={loan.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-mono text-muted-foreground">
                      v{loan.versions.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link 
                      to={`/loans/${loan.id}`}
                      className="inline-flex items-center text-xs text-primary hover:underline"
                    >
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
