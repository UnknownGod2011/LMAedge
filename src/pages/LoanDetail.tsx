import { useParams, Link } from 'react-router-dom';
import { mockLoans } from '@/data/mockLoans';
import { DataField } from '@/components/ui/DataField';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  GitCompare, 
  Leaf,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const loan = mockLoans.find(l => l.id === id);

  if (!loan) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-lg font-semibold">Loan not found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The requested loan record does not exist.
          </p>
          <Link to="/loans">
            <Button variant="secondary" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Loans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const latestVersion = loan.versions[loan.versions.length - 1];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link 
            to="/loans" 
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back to Loans
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{loan.borrower.value}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-mono text-muted-foreground">{loan.id}</span>
            <StatusBadge status={loan.status} />
            {loan.esg_linked.value && (
              <Badge variant="secondary" className="gap-1">
                <Leaf className="h-3 w-3" />
                ESG-Linked
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/compare?loan1=${loan.id}`}>
            <Button variant="secondary" size="sm">
              <GitCompare className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </Link>
          <Link to={`/api?loan=${loan.id}`}>
            <Button variant="secondary" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="terms">Loan Terms</TabsTrigger>
          <TabsTrigger value="covenants">Covenants</TabsTrigger>
          <TabsTrigger value="esg">ESG</TabsTrigger>
          <TabsTrigger value="versions">
            Versions
            <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              {loan.versions.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="space-y-6">
          {/* Core Terms */}
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <h2 className="section-header mb-0">Core Terms</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <DataField 
                label="Borrower" 
                value={loan.borrower.value}
                confidence={loan.borrower.confidence}
                sourcePage={loan.borrower.source_page}
              />
              <DataField 
                label="Facility Type" 
                value={loan.facility_type.value}
                confidence={loan.facility_type.confidence}
                sourcePage={loan.facility_type.source_page}
              />
              <DataField 
                label="Principal Amount" 
                value={`${loan.currency.value} ${loan.principal.value}`}
                confidence={loan.principal.confidence}
                sourcePage={loan.principal.source_page}
                mono
              />
              <DataField 
                label="Interest Margin" 
                value={loan.interest_margin.value}
                confidence={loan.interest_margin.confidence}
                sourcePage={loan.interest_margin.source_page}
                mono
              />
              <DataField 
                label="Maturity Date" 
                value={new Date(loan.maturity_date.value).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                confidence={loan.maturity_date.confidence}
                sourcePage={loan.maturity_date.source_page}
              />
              <DataField 
                label="Lenders" 
                value={
                  <div className="space-y-1">
                    {loan.lenders.value.map((lender, idx) => (
                      <div key={idx} className="text-sm">{lender}</div>
                    ))}
                  </div>
                }
                confidence={loan.lenders.confidence}
                sourcePage={loan.lenders.source_page}
              />
            </div>
          </div>

          {/* Economic Terms */}
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <h2 className="section-header mb-0">Economic Terms</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <DataField 
                label="Repayment Schedule" 
                value={loan.repayment_schedule.value}
                confidence={loan.repayment_schedule.confidence}
                sourcePage={loan.repayment_schedule.source_page}
              />
              <DataField 
                label="Arrangement Fee" 
                value={loan.arrangement_fee.value}
                confidence={loan.arrangement_fee.confidence}
                sourcePage={loan.arrangement_fee.source_page}
                mono
              />
              <DataField 
                label="Commitment Fee" 
                value={loan.commitment_fee.value}
                confidence={loan.commitment_fee.confidence}
                sourcePage={loan.commitment_fee.source_page}
              />
              <DataField 
                label="Prepayment Terms" 
                value={loan.prepayment_terms.value}
                confidence={loan.prepayment_terms.confidence}
                sourcePage={loan.prepayment_terms.source_page}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="covenants" className="space-y-6">
          {/* Financial Covenants */}
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <h2 className="section-header mb-0">Financial Covenants</h2>
            </div>
            <div className="divide-y divide-border">
              {loan.covenants.value
                .filter(c => c.type === 'financial')
                .map((covenant, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{covenant.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {covenant.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono">{covenant.threshold}</span>
                        {covenant.frequency && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {covenant.frequency}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {loan.covenants.value.filter(c => c.type === 'financial').length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                  No financial covenants extracted
                </div>
              )}
            </div>
          </div>

          {/* Reporting Obligations */}
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <h2 className="section-header mb-0">Reporting Obligations</h2>
            </div>
            <div className="p-4">
              {loan.reporting_obligations.value.length > 0 ? (
                <ul className="space-y-2">
                  {loan.reporting_obligations.value.map((obligation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      {obligation}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No reporting obligations extracted
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="esg" className="space-y-6">
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-success" />
                <h2 className="section-header mb-0">ESG Terms</h2>
              </div>
            </div>
            <div className="p-4">
              <DataField 
                label="ESG-Linked" 
                value={loan.esg_linked.value ? 'Yes' : 'No'}
                confidence={loan.esg_linked.confidence}
                sourcePage={loan.esg_linked.source_page}
              />
            </div>
            {loan.esg_linked.value && loan.esg_terms.value.length > 0 && (
              <div className="border-t border-border divide-y divide-border">
                {loan.esg_terms.value.map((term, idx) => (
                  <div key={idx} className="p-4">
                    <h3 className="text-sm font-medium mb-2">{term.target}</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {term.margin_adjustment && (
                        <div>
                          <span className="text-muted-foreground">Margin Adjustment:</span>
                          <span className="ml-2 font-mono">{term.margin_adjustment}</span>
                        </div>
                      )}
                      {term.measurement_date && (
                        <div>
                          <span className="text-muted-foreground">Measurement Date:</span>
                          <span className="ml-2">
                            {new Date(term.measurement_date).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <h2 className="section-header mb-0">Version History</h2>
            </div>
            <div className="divide-y divide-border">
              {loan.versions.map((version, idx) => {
                const isLatest = idx === loan.versions.length - 1;
                return (
                  <div key={version.version} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-xs font-mono">
                          v{version.version}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{version.file_name}</span>
                            {isLatest && (
                              <Badge variant="secondary" className="text-2xs">Latest</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Uploaded by {version.uploaded_by}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(version.uploaded_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {version.changes && version.changes.length > 0 && (
                      <div className="mt-4 pl-11">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Changes from previous version
                        </p>
                        <div className="space-y-2">
                          {version.changes.map((change, cIdx) => (
                            <div 
                              key={cIdx} 
                              className="text-xs p-2 rounded border border-border"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{change.field}</span>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    'text-2xs',
                                    change.change_type === 'commercial' 
                                      ? 'border-primary/30 text-primary'
                                      : 'border-muted-foreground/30'
                                  )}
                                >
                                  {change.change_type}
                                </Badge>
                              </div>
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <span className="text-muted-foreground">Before: </span>
                                  <span className="diff-removed px-1 rounded">{change.old_value}</span>
                                </div>
                                <div className="flex-1">
                                  <span className="text-muted-foreground">After: </span>
                                  <span className="diff-added px-1 rounded">{change.new_value}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
