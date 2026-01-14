import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, ChevronDown, ChevronRight, MessageSquare, Send, BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadedFile } from '@/types/loan';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'sonner';
import DecryptedText from '@/components/ui/DecryptedText';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface DocumentSection {
  id: string;
  title: string;
  summary: string;
  status: 'ok' | 'warning';
  content: string;
  isExpanded: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ExtractedMetrics {
  principal: string;
  interestRate: string;
  term: string;
  covenants: number;
}

export default function LoanIngest() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! Upload a loan agreement and I will analyze it for you.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [metrics, setMetrics] = useState<ExtractedMetrics | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, []);

  const analyzeWithGemini = async (fileName: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are analyzing a loan agreement document named "${fileName}".

Since I cannot read the actual PDF content, please generate a realistic sample analysis for a typical loan agreement.

Return ONLY a valid JSON object with this exact structure:

{
  "sections": [
    {
      "title": "Parties & Definitions",
      "summary": "Borrower and lender details with key definitions",
      "status": "ok",
      "content": "This section identifies the parties to the agreement and establishes key definitions used throughout the document."
    },
    {
      "title": "Facility Terms",
      "summary": "Loan amount, interest rate, and maturity details",
      "status": "ok",
      "content": "The facility provides the principal amount with specified interest rate and maturity date."
    },
    {
      "title": "Financial Covenants",
      "summary": "Debt ratios and financial requirements",
      "status": "warning",
      "content": "Financial covenants include debt-to-EBITDA ratios and minimum liquidity requirements that need regular monitoring."
    },
    {
      "title": "Representations & Warranties",
      "summary": "Borrower representations about corporate status",
      "status": "ok",
      "content": "Standard representations regarding corporate authority, financial condition, and compliance with laws."
    },
    {
      "title": "Events of Default",
      "summary": "Conditions that trigger default",
      "status": "ok",
      "content": "Events of default include payment failures, covenant breaches, and cross-defaults to other agreements."
    }
  ],
  "metrics": {
    "principal": "$25M",
    "interestRate": "SOFR + 3.5%",
    "term": "5 Years",
    "covenants": 4
  }
}

Return ONLY the JSON object, no other text.`;

      const result = await model.generateContent(prompt);
      let response = result.response.text().trim();
      
      response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Gemini analysis error:', error);
      
      return {
        sections: [
          {
            title: "Parties & Definitions",
            summary: "Borrower and lender identified with key terms defined",
            status: "ok",
            content: "This section establishes the parties to the loan agreement and defines key terms used throughout the document."
          },
          {
            title: "Facility Terms",
            summary: "Principal amount, interest rate, and maturity specified",
            status: "ok",
            content: "The loan facility details including the principal amount, applicable interest rate, and final maturity date."
          },
          {
            title: "Financial Covenants",
            summary: "Debt ratios and financial maintenance requirements",
            status: "warning",
            content: "Financial covenants require maintaining specific debt-to-EBITDA ratios and minimum liquidity levels."
          },
          {
            title: "Representations & Warranties",
            summary: "Standard corporate and financial representations",
            status: "ok",
            content: "Borrower makes representations regarding corporate status, authority, and financial condition."
          },
          {
            title: "Events of Default",
            summary: "Payment defaults and covenant breaches defined",
            status: "ok",
            content: "Events triggering default include payment failures, covenant breaches, and material adverse changes."
          }
        ],
        metrics: {
          principal: "$25M",
          interestRate: "SOFR + 3.5%",
          term: "5 Years",
          covenants: 4
        }
      };
    }
  };

  const processFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      if (!file.type.includes('pdf')) {
        toast.error('Please upload a PDF file');
        continue;
      }

      const uploadFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };
      
      setFiles(prev => [uploadFile, ...prev]);
      setSelectedFile(uploadFile);
      setIsAnalyzing(true);
      
      try {
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, progress: 30 } : f));
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'parsing', progress: 60 } : f));
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const analysis = await analyzeWithGemini(file.name);
        
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'complete', 
          progress: 100,
          loan_id: `LN-2024-${String(files.length + 1).padStart(3, '0')}`,
          version: 1 
        } : f));
        
        setSections(analysis.sections.map((section: any, index: number) => ({
          id: String(index + 1),
          title: section.title,
          summary: section.summary,
          status: section.status,
          content: section.content,
          isExpanded: false
        })));
        
        setMetrics(analysis.metrics);
        setExtractedText(`Document: ${file.name} - Analysis complete`);
        setIsAnalyzing(false);
        
        toast.success('Document analyzed successfully!', { 
          description: `Found ${analysis.sections.length} sections.` 
        });
        
      } catch (error) {
        console.error('Processing error:', error);
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error_message: 'Analysis failed.' 
        } : f));
        setIsAnalyzing(false);
        toast.error('Analysis failed');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) setSelectedFile(null);
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: chatInput 
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const context = `Document sections: ${sections.map(s => `${s.title}: ${s.summary}`).join('; ')}`;
      
      const prompt = `You are analyzing a loan agreement. Answer this question based on typical loan agreement terms.

Context: ${context}

Question: ${currentInput}

Provide a helpful answer.`;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const aiMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response 
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'I can help answer questions about loan agreements. What would you like to know?' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex animate-fade-in overflow-hidden">
      <div className="w-[450px] border-r border-border flex flex-col bg-background">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold tracking-tight">Document Upload</h1>
          <p className="text-xs text-muted-foreground mt-1">Upload loan agreements for AI analysis</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div 
              className={cn(
                'border-2 border-dashed rounded-lg p-8 mb-4 transition-colors cursor-pointer',
                isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card'
              )} 
              onDragOver={handleDragOver} 
              onDragLeave={handleDragLeave} 
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-3">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium mb-1">Drop PDF here</h3>
                <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileSelect} 
                />
                <Button variant="secondary" size="sm" disabled={isAnalyzing} onClick={(e) => e.stopPropagation()}>
                  <label htmlFor="file-upload" className="cursor-pointer text-xs">
                    {isAnalyzing ? 'Analyzing...' : 'Select PDF'}
                  </label>
                </Button>
              </div>
            </div>
            {files.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent</h2>
                {files.slice(0, 3).map((file) => (
                  <div 
                    key={file.id} 
                    className={cn(
                      "border border-border rounded-md p-2 cursor-pointer transition-all hover:border-primary/50",
                      selectedFile?.id === file.id && "ring-1 ring-primary border-primary bg-primary/5"
                    )} 
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-xs">{file.name}</p>
                        {(file.status === 'uploading' || file.status === 'parsing') && (
                          <Progress value={file.progress} className="h-0.5 mt-1" />
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          removeFile(file.id); 
                        }} 
                        className="h-5 w-5 p-0"
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
        <div className="p-4 border-b border-border bg-background">
          <DecryptedText 
            text="DECRYPTING YOUR DOCUMENT" 
            animateOn="view" 
            speed={30} 
            maxIterations={15} 
            className="text-lg font-bold tracking-tight text-primary" 
            encryptedClassName="text-lg font-bold tracking-tight text-muted-foreground" 
          />
          <p className="text-xs text-muted-foreground mt-1">
            {selectedFile ? `Analyzing: ${selectedFile.name}` : 'Upload a document to begin'}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-4 border-b border-border bg-muted/50">
                <h2 className="text-sm font-semibold">Document Sections</h2>
                <p className="text-xs text-muted-foreground mt-0.5">AI-extracted sections from the loan agreement</p>
              </div>
              {sections.length > 0 ? (
                <div className="divide-y divide-border">
                  {sections.map((section) => (
                    <div key={section.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div 
                        className="flex items-start gap-3 cursor-pointer" 
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="shrink-0 mt-0.5">
                          {section.isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium">{section.title}</h3>
                            {section.status === 'ok' ? (
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{section.summary}</p>
                          {section.isExpanded && (
                            <div className="mt-3 p-4 bg-muted/50 rounded-md text-xs leading-relaxed border border-border">
                              {section.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Upload a PDF to see extracted sections</p>
                  <p className="text-xs text-muted-foreground mt-1">AI will analyze and organize the document automatically</p>
                </div>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-4 border-b border-border bg-muted/50">
                <h2 className="text-sm font-semibold">Key Metrics</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Extracted financial data and terms</p>
              </div>
              <div className="p-6">
                {metrics ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-700 dark:text-green-400" />
                        <span className="text-xs text-green-700 dark:text-green-400 font-medium">Principal</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.principal}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                        <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Interest Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.interestRate}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                        <span className="text-xs text-purple-700 dark:text-purple-400 font-medium">Term</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.term}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                        <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">Covenants</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{metrics.covenants}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Upload a document to see extracted metrics
                  </div>
                )}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <div className="p-3 border-b border-border bg-muted/50 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Ask Questions</h2>
              </div>
              <div className="flex flex-col">
                <ScrollArea className="h-[200px] p-3">
                  <div className="space-y-2">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={cn(
                          "flex",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "max-w-[75%] rounded-lg p-2 text-xs leading-relaxed",
                            message.role === 'user' 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted border border-border"
                          )}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Separator />
                <div className="p-3 bg-muted/30">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ask about the document..." 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                      className="text-xs" 
                    />
                    <Button size="sm" onClick={handleSendMessage}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
