import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockLoans } from '@/data/mockLoans';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Check, Code, FileJson, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function APIExport() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialLoan = searchParams.get('loan') || mockLoans[0]?.id || '';
  
  const [selectedLoanId, setSelectedLoanId] = useState(initialLoan);
  const [copied, setCopied] = useState(false);

  const loan = mockLoans.find(l => l.id === selectedLoanId);

  const generateJSON = () => {
    if (!loan) return '';

    const exportData = {
      id: loan.id,
      borrower: loan.borrower.value,
      lenders: loan.lenders.value,
      facility_type: loan.facility_type.value,
      principal: {
        amount: parseFloat(loan.principal.value.replace(/,/g, '')),
        currency: loan.currency.value,
      },
      interest_margin: loan.interest_margin.value,
      maturity_date: loan.maturity_date.value,
      repayment_schedule: loan.repayment_schedule.value,
      fees: {
        arrangement: loan.arrangement_fee.value,
        commitment: loan.commitment_fee.value,
      },
      prepayment_terms: loan.prepayment_terms.value,
      covenants: loan.covenants.value.map(c => ({
        type: c.type,
        name: c.name,
        description: c.description,
        threshold: c.threshold,
        frequency: c.frequency,
      })),
      reporting_obligations: loan.reporting_obligations.value,
      esg: {
        linked: loan.esg_linked.value,
        terms: loan.esg_terms.value,
      },
      metadata: {
        versions: loan.versions.length,
        created_at: loan.created_at,
        updated_at: loan.updated_at,
      },
    };

    return JSON.stringify(exportData, null, 2);
  };

  const jsonOutput = generateJSON();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'JSON data has been copied to your clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${loan?.id || 'loan'}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download started',
      description: `${loan?.id || 'loan'}-export.json`,
    });
  };

  const apiEndpoint = `https://api.edgeledger.com/v1/loans/${selectedLoanId}`;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Export & API</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Export loan data or integrate via API
        </p>
      </div>

      {/* Loan Selector */}
      <div className="enterprise-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a loan" />
              </SelectTrigger>
              <SelectContent>
                {mockLoans.map(loan => (
                  <SelectItem key={loan.id} value={loan.id}>
                    <span className="font-mono text-xs mr-2">{loan.id}</span>
                    {loan.borrower.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy JSON
            </Button>
            <Button variant="default" size="sm" onClick={downloadJSON}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="json" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="json" className="gap-2">
            <FileJson className="h-4 w-4" />
            JSON Output
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Code className="h-4 w-4" />
            API Reference
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json">
          <div className="enterprise-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">JSON Export</h2>
                <Badge variant="secondary" className="font-mono text-2xs">
                  {loan?.id}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {jsonOutput.length.toLocaleString()} bytes
              </span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                {jsonOutput}
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          {/* Endpoint */}
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold">REST API Endpoint</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="font-mono text-xs">GET</Badge>
                <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded flex-1">
                  {apiEndpoint}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(apiEndpoint);
                    toast({ title: 'Endpoint copied' });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Request Headers
                  </h3>
                  <div className="bg-muted rounded p-3 text-xs font-mono">
                    <div>Authorization: Bearer {'<api_key>'}</div>
                    <div>Content-Type: application/json</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Example cURL
                  </h3>
                  <div className="bg-muted rounded p-3 text-xs font-mono whitespace-pre-wrap">
{`curl -X GET "${apiEndpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Endpoints */}
          <div className="enterprise-card">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold">Available Endpoints</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="font-mono text-xs">GET</Badge>
                  <code className="text-sm font-mono">/v1/loans</code>
                </div>
                <p className="text-xs text-muted-foreground">List all loans with pagination and filtering</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="font-mono text-xs">GET</Badge>
                  <code className="text-sm font-mono">/v1/loans/{'{id}'}</code>
                </div>
                <p className="text-xs text-muted-foreground">Retrieve a specific loan by ID</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="font-mono text-xs">GET</Badge>
                  <code className="text-sm font-mono">/v1/loans/{'{id}'}/versions</code>
                </div>
                <p className="text-xs text-muted-foreground">List all versions of a loan</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="font-mono text-xs">POST</Badge>
                  <code className="text-sm font-mono">/v1/loans/{'{id}'}/compare</code>
                </div>
                <p className="text-xs text-muted-foreground">Compare two loans side-by-side</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="font-mono text-xs">POST</Badge>
                  <code className="text-sm font-mono">/v1/ingest</code>
                </div>
                <p className="text-xs text-muted-foreground">Upload a new loan document for processing</p>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="enterprise-card p-4">
            <h2 className="text-sm font-semibold mb-3">Rate Limits</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Requests per minute</p>
                <p className="font-mono">1,000</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Burst limit</p>
                <p className="font-mono">100</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Max payload size</p>
                <p className="font-mono">50 MB</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
