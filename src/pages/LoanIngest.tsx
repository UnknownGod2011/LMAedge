import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, ChevronDown, ChevronRight, MessageSquare, Send, BarChart3, TrendingUp, DollarSign, Calendar, Download, Eye, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { UploadedFile, Loan } from '@/types/loan';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import DecryptedText from '@/components/ui/DecryptedText';
import ClickSpark from '@/components/ui/ClickSpark';
import Orb from '@/components/ui/Orb';
import ShinyText from '@/components/ui/ShinyText';
import TextType from '@/components/ui/TextType';
import { motion, AnimatePresence } from 'framer-motion';
import { loanService } from '@/services/loanService';

// Use local worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
  graphData?: { name: string; value: number; color: string }[];
}

interface DocumentData {
  sections: DocumentSection[];
  metrics: ExtractedMetrics | null;
  extractedText: string;
  riskScore: number | null;
  chatMessages: ChatMessage[];
}

export default function LoanIngest() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [documentDataMap, setDocumentDataMap] = useState<Map<string, DocumentData>>(new Map());
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Get current document data
  const currentDocData = selectedFile ? documentDataMap.get(selectedFile.id) : null;
  const sections = currentDocData?.sections || [];
  const metrics = currentDocData?.metrics || null;
  const extractedText = currentDocData?.extractedText || '';
  const riskScore = currentDocData?.riskScore || null;
  const chatMessages = currentDocData?.chatMessages || [
    { id: '1', role: 'assistant', content: 'Hello! Upload a loan agreement and I can help you understand its terms.' }
  ];

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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('Starting PDF extraction for:', file.name, 'Size:', file.size);
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer loaded, size:', arrayBuffer.byteLength);

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded, total pages:', pdf.numPages);

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';

        // Log progress every 10 pages
        if (i % 10 === 0 || i === pdf.numPages) {
          console.log(`Extracted ${i}/${pdf.numPages} pages, current text length: ${fullText.length} chars`);
        }
      }

      console.log('PDF extraction complete! Total text length:', fullText.length, 'characters');
      console.log('First 500 chars:', fullText.substring(0, 500));
      console.log('Last 500 chars:', fullText.substring(fullText.length - 500));

      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw error;
    }
  };

  const analyzeWithGemini = async (text: string) => {
    try {
      console.log('Starting Gemini analysis...');
      console.log('Input text length:', text.length, 'characters');

      const model = genAI.getGenerativeModel(
        { model: 'gemini-2.5-flash' }
      );

      // Use more text for better analysis (Gemini 1.5 Flash can handle much more)
      const limitedText = text.substring(0, 200000); // Increased from 50k to 200k
      console.log('Sending to Gemini:', limitedText.length, 'characters');
      console.log('Text preview (first 1000 chars):', limitedText.substring(0, 1000));

      const prompt = `You are analyzing a comprehensive loan agreement document with ${text.length} characters. This is a detailed legal document that likely contains MANY sections.

Your task: Extract ALL distinct sections from this document. A 300-page loan agreement typically has 15-25+ major sections.

Return ONLY a valid JSON object with this exact structure:
{
  "sections": [
    {
      "title": "Section name (e.g., 'Parties & Definitions', 'Loan Amount & Purpose', 'Interest Rate & Fees')",
      "summary": "2-3 sentence summary of what this section covers",
      "status": "ok or warning",
      "content": "Key excerpts or details from this section (2-3 paragraphs)"
    }
  ],
  "metrics": {
    "principal": "$X,XXX,XXX or amount found",
    "interestRate": "X.XX% or rate found",
    "term": "X years or term found",
    "covenants": 0,
    "graphData": [
      { "name": "Interest Rate", "value": 5.5, "color": "#3b82f6" },
      { "name": "Market Avg", "value": 7.0, "color": "#94a3b8" },
      { "name": "Term (Yrs)", "value": 5, "color": "#a855f7" }
    ]
  }
}

CRITICAL INSTRUCTIONS:
- Extract AT LEAST 12-20 sections for a large document
- Look for ALL of these common sections: Parties, Definitions, Loan Amount, Purpose, Interest Rate, Fees, Payment Schedule, Prepayment, Security/Collateral, Representations & Warranties, Covenants (Financial), Covenants (Affirmative), Covenants (Negative), Events of Default, Remedies, Conditions Precedent, Indemnification, Governing Law, Notices, Amendments, Miscellaneous, Schedules/Exhibits
- Set status to "warning" for: high interest rates (>10%), strict financial covenants, severe default penalties, unusual restrictions, cross-default clauses
- Set status to "ok" for standard terms
- Extract REAL numbers from the document for metrics
- For 'graphData', create a comparison:
    1. The extracted Interest Rate (value) vs a typical Market Average of 7.0 (value).
    2. The Term length in years.
    3. Ensure 'value' is a NUMBER (strip % or $).
- If you find multiple subsections under a category, create separate entries (e.g., "Financial Covenants - Debt Ratio", "Financial Covenants - Cash Flow")

Document text (first ${limitedText.length} characters of ${text.length} total):
${limitedText}`;

      console.log('Sending request to Gemini with enhanced prompt...');
      const result = await model.generateContent(prompt);
      let response = result.response.text().trim();

      console.log('Gemini response received, length:', response.length);
      console.log('Raw response:', response.substring(0, 500));

      // Clean up markdown code blocks if present
      if (response.startsWith('```json')) {
        response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (response.startsWith('```')) {
        response = response.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(response);
      console.log('Parsed JSON successfully!');
      console.log('Sections found:', parsed.sections?.length || 0);
      console.log('Metrics:', parsed.metrics);

      return parsed;
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw error;
    }
  };

  const processFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      // Create preview URL for PDF
      if (file.type === 'application/pdf') {
        const pdfUrl = URL.createObjectURL(file);
        setUploadedPdfUrl(pdfUrl);
        setUploadedFileName(file.name);
      }

      const uploadFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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
        console.log('=== STARTING FILE PROCESSING ===');
        console.log('File:', file.name, 'Type:', file.type, 'Size:', file.size);

        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, progress: 30 } : f));
        toast.info('Extracting text...', { description: 'This may take a moment for large files' });

        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'parsing', progress: 50 } : f));

        let extractedPdfText = '';

        // Handle text files directly
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          extractedPdfText = await file.text();
          console.log('📄 Text file loaded directly');
        } else {
          // Try PDF extraction
          extractedPdfText = await extractTextFromPDF(file);
        }

        console.log("🔍 EXTRACTED TEXT LENGTH:", extractedPdfText.length);
        console.log("🔍 FIRST 5000 CHARS:", extractedPdfText.substring(0, 5000));
        console.log("🔍 LAST 1000 CHARS:", extractedPdfText.substring(extractedPdfText.length - 1000));

        if (extractedPdfText.length < 1000) {
          console.error("⚠️ WARNING: Very little text extracted! PDF might be scanned/image-based");
          toast.error('Very little text extracted', {
            description: `Only ${extractedPdfText.length} characters. PDF may be scanned. Try a text file or digital PDF.`
          });
          setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'error', error_message: 'Scanned PDF - no text' } : f));
          setIsAnalyzing(false);
          continue;
        }

        // Re-enable Gemini analysis
        toast.info('Analyzing with AI...', { description: `Processing ${extractedPdfText.length} characters` });

        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, progress: 70 } : f));
        const analysis = await analyzeWithGemini(extractedPdfText);

        console.log('Analysis complete:', analysis);

        // Calculate Risk Score
        const warningCount = analysis.sections.filter((s: any) => s.status === 'warning').length;
        const calculatedScore = Math.max(0, 100 - (warningCount * 10));

        // Create and save loan object
        const newLoan: Loan = {
          id: `LN-${Date.now()}`,
          status: 'complete',
          borrower: { value: 'Unknown Borrower', confidence: 80 }, // Placeholder
          lenders: { value: ['Lender Name'], confidence: 80 }, // Placeholder
          facility_type: { value: 'Term Loan', confidence: 90 },
          principal: { value: analysis.metrics.principal, confidence: 95 },
          currency: { value: 'USD', confidence: 90 },
          interest_margin: { value: analysis.metrics.interestRate, confidence: 95 },
          maturity_date: { value: new Date().toISOString(), confidence: 80 }, // Placeholder
          repayment_schedule: { value: 'Quarterly', confidence: 85 },
          arrangement_fee: { value: '1.0%', confidence: 80 },
          commitment_fee: { value: '0.5%', confidence: 80 },
          prepayment_terms: { value: 'Standard', confidence: 80 },
          covenants: { value: [], confidence: 80 },
          reporting_obligations: { value: [], confidence: 80 },
          esg_linked: { value: false, confidence: 90 },
          esg_terms: { value: [], confidence: 90 },
          versions: [{
            version: 1,
            uploaded_at: new Date().toISOString(),
            uploaded_by: 'User',
            file_name: file.name
          }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        loanService.saveLoan(newLoan);
        console.log('Loan saved to local storage:', newLoan.id);

        // Save document data to map
        const newDocData: DocumentData = {
          sections: analysis.sections.map((section: any, index: number) => ({
            id: String(index + 1),
            title: section.title,
            summary: section.summary,
            status: section.status,
            content: section.content,
            isExpanded: false
          })),
          metrics: analysis.metrics,
          extractedText: extractedPdfText,
          riskScore: calculatedScore,
          chatMessages: [
            { id: '1', role: 'assistant', content: 'Hello! I can help you understand this loan agreement. What would you like to know?' }
          ]
        };

        setDocumentDataMap(prev => new Map(prev).set(uploadFile.id, newDocData));
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'complete', progress: 100, loan_id: newLoan.id, version: 1 } : f));
        setIsAnalyzing(false);
        toast.success('Document analyzed and saved!', { description: `Found ${analysis.sections.length} sections. Risk Score: ${calculatedScore}/100` });
      } catch (error) {
        console.error('Processing error:', error);
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? { ...f, status: 'error', error_message: 'Analysis failed.' } : f));
        setIsAnalyzing(false);
        toast.error('Analysis failed', { description: 'Please try again.' });
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
    if (!selectedFile) return;
    setDocumentDataMap(prev => {
      const newMap = new Map(prev);
      const docData = newMap.get(selectedFile.id);
      if (docData) {
        newMap.set(selectedFile.id, {
          ...docData,
          sections: docData.sections.map(section => 
            section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
          )
        });
      }
      return newMap;
    });
  };

  const suggestedQuestions = [
    "What is the interest rate?",
    "Are there prepayment penalties?",
    "What are the financial covenants?",
    "Is there a change of control clause?",
    "What is the maturity date?"
  ];

  const handleExport = () => {
    if (!metrics || sections.length === 0) return;

    const content = `
LOAN ANALYSIS REPORT
-------------------
File: ${selectedFile?.name}
Date: ${new Date().toLocaleDateString()}
Risk Score: ${riskScore}/100

KEY METRICS
-----------
Principal: ${metrics.principal}
Interest Rate: ${metrics.interestRate}
Term: ${metrics.term}
Covenants: ${metrics.covenants}

SECTIONS
--------
${sections.map(s => `[${s.status.toUpperCase()}] ${s.title}\n${s.summary}\n`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${selectedFile?.name || 'loan'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const handleSendMessage = async (text?: string) => {
    if (!selectedFile) return;
    const inputToSend = typeof text === 'string' ? text : chatInput;
    if (!inputToSend.trim()) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputToSend };
    
    // Update chat messages in document map
    setDocumentDataMap(prev => {
      const newMap = new Map(prev);
      const docData = newMap.get(selectedFile.id);
      if (docData) {
        newMap.set(selectedFile.id, {
          ...docData,
          chatMessages: [...docData.chatMessages, userMessage]
        });
      }
      return newMap;
    });
    
    if (typeof text !== 'string') setChatInput('');
    const currentInput = inputToSend;
    
    try {
      const model = genAI.getGenerativeModel(
        { model: 'gemini-2.5-flash' }
      );
      const context = `Document Sections: ${sections.map(s => `${s.title}: ${s.summary}`).join('; ')}

Full Document Text (excerpt):
${extractedText.substring(0, 20000)}`;

      const prompt = `You are analyzing a loan agreement document. Use the following context to answer the user's question accurately and concisely.

${context}

User Question: ${currentInput}

Provide a clear, concise answer based on the document content:`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      
      // Update with AI response
      setDocumentDataMap(prev => {
        const newMap = new Map(prev);
        const docData = newMap.get(selectedFile.id);
        if (docData) {
          newMap.set(selectedFile.id, {
            ...docData,
            chatMessages: [...docData.chatMessages, aiMessage]
          });
        }
        return newMap;
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, an error occurred while processing your question.' };
      
      setDocumentDataMap(prev => {
        const newMap = new Map(prev);
        const docData = newMap.get(selectedFile.id);
        if (docData) {
          newMap.set(selectedFile.id, {
            ...docData,
            chatMessages: [...docData.chatMessages, errorMessage]
          });
        }
        return newMap;
      });
    }
  };

  return (
    <ClickSpark
      sparkColor="#3b82f6"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    >
      <div className="h-[calc(100vh-5rem)] flex animate-fade-in overflow-hidden">
        <div className="w-[380px] border-r border-border flex flex-col bg-background shrink-0">
          <div className="p-4 border-b border-border">
            <h1 className="text-lg font-semibold tracking-tight">Upload Document</h1>
            <p className="text-xs text-muted-foreground mt-1">Drop your loan agreement here for instant AI analysis</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className={cn('border-2 border-dashed rounded-lg transition-colors overflow-hidden', isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card', uploadedPdfUrl ? 'p-0 min-h-[320px]' : 'p-12 mb-4 min-h-[280px] flex items-center justify-center')} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                {uploadedPdfUrl ? (
                  <div className="h-[320px] flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium truncate">{uploadedFileName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedPdfUrl(null);
                          setUploadedFileName('');
                        }}
                        className="h-7 text-xs shrink-0"
                      >
                        Change
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden bg-muted/20">
                      <iframe
                        src={uploadedPdfUrl}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary mb-4">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">Drop PDF here</h3>
                    <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
                    <input type="file" id="file-upload" className="hidden" accept=".pdf,.txt" onChange={handleFileSelect} />
                    <Button variant="secondary" size="sm" asChild disabled={isAnalyzing}>
                      <label htmlFor="file-upload" className="cursor-pointer text-xs">{isAnalyzing ? 'Analyzing...' : 'Select PDF'}</label>
                    </Button>
                  </div>
                )}
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent</h2>
                  <AnimatePresence mode="popLayout">
                    {files.slice(0, 3).map((file) => (
                      <motion.div
                        key={file.id}
                        className={cn("border border-border rounded-md p-2 cursor-pointer transition-all hover:border-primary/50", selectedFile?.id === file.id && "ring-1 ring-primary border-primary bg-primary/5")}
                        onClick={() => setSelectedFile(file)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-xs">{file.name}</p>
                            {(file.status === 'uploading' || file.status === 'parsing') && <Progress value={file.progress} className="h-0.5 mt-1" />}
                          </div>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} className="h-5 w-5 p-0">
                            <X className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col bg-muted/30 relative overflow-hidden">
          <div className="p-4 border-b border-border bg-background relative z-10 flex items-center justify-between shrink-0">
            <div className="min-w-0 flex-1 pr-4">
              <DecryptedText 
                text="DECRYPTING DOCUMENTS" 
                animateOn="view" 
                speed={150} 
                maxIterations={30}
                sequential={true}
                revealDirection="start"
                className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent uppercase" 
                encryptedClassName="text-2xl font-black tracking-tight text-muted-foreground/60 uppercase" 
              />
              <p className="text-sm text-muted-foreground mt-1 font-medium truncate">{selectedFile ? `Analyzing: ${selectedFile.name}` : 'Upload a loan agreement to begin AI-powered analysis'}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs font-medium">Analyzing...</span>
                </div>
              )}
              {metrics && (
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <motion.div
                className="bg-card border border-border rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">
                      <ShinyText 
                        text="Document Sections" 
                        speed={3}
                        color="#0f172a"
                        shineColor="#3b82f6"
                        spread={120}
                      />
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">AI-extracted sections</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {riskScore !== null && (
                      <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                        <span className="text-xs font-medium text-muted-foreground">Risk Score:</span>
                        <span className={cn(
                          "text-sm font-bold",
                          riskScore > 80 ? "text-green-600" : riskScore > 50 ? "text-orange-500" : "text-red-500"
                        )}>
                          {riskScore}/100
                        </span>
                      </div>
                    )}
                    <div className="flex bg-background rounded-lg border border-border p-0.5">
                      <Button
                        variant={!showDocument ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => setShowDocument(false)}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        Analysis
                      </Button>
                      <Button
                        variant={showDocument ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => setShowDocument(true)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View Doc
                      </Button>
                    </div>
                  </div>
                </div>

                {showDocument ? (
                  <ScrollArea className="h-[600px]">
                    <div className="bg-white dark:bg-slate-900 text-black dark:text-white p-8 font-serif text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                      {extractedText || <div className="text-center text-gray-400 italic mt-20">No document text available</div>}
                    </div>
                  </ScrollArea>
                ) : (
                  sections.length > 0 ? (
                    <motion.div
                      className="divide-y divide-border"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.05
                          }
                        }
                      }}
                    >
                      {sections.map((section) => (
                        <motion.div
                          key={section.id}
                          className="p-4 hover:bg-muted/30 transition-colors"
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0 }
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                        >
                          <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleSection(section.id)}>
                            <div className="shrink-0 mt-0.5">
                              {section.isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium">{section.title}</h3>
                                {section.status === 'ok' ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{section.summary}</p>
                              <AnimatePresence>
                                {section.isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 p-4 bg-muted/50 rounded-md text-xs leading-relaxed border border-border">{section.content}</div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Upload a PDF to see sections</p>
                    </div>
                  ))}
              </motion.div>

              <motion.div
                className="bg-card border border-border rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="p-4 border-b border-border bg-muted/50">
                  <h2 className="text-sm font-semibold">
                    <ShinyText 
                      text="Key Metrics" 
                      speed={3}
                      color="#0f172a"
                      shineColor="#10b981"
                      spread={120}
                    />
                  </h2>
                </div>
                <div className="p-6">
                  {metrics ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <motion.div
                        className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-700 dark:text-green-400" />
                          <span className="text-xs text-green-700 dark:text-green-400 font-medium">Principal</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.principal}</p>
                      </motion.div>
                      <motion.div
                        className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                          <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Interest Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.interestRate}</p>
                      </motion.div>
                      <motion.div
                        className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                          <span className="text-xs text-purple-700 dark:text-purple-400 font-medium">Term</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.term}</p>
                      </motion.div>
                      <motion.div
                        className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                          <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">Covenants</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{metrics.covenants}</p>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">Upload a document to see metrics</div>
                  )}
                </div>
                {metrics?.graphData && (
                  <div className="px-6 pb-6 h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.graphData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                        <RechartsTooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {metrics.graphData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </motion.div>
              <motion.div
                className="bg-card border border-border rounded-lg shadow-sm overflow-hidden relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="p-3 border-b border-border bg-muted/50 flex items-center gap-2 relative z-10">
                  <MessageSquare className="h-4 w-4" />
                  <h2 className="text-sm font-semibold">
                    <ShinyText 
                      text="Ask Questions" 
                      speed={3}
                      color="#64748b"
                      shineColor="#ffffff"
                      spread={120}
                    />
                  </h2>
                </div>
                <div className="flex flex-col relative z-10">
                  <ScrollArea className="h-[200px] p-3">
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {chatMessages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            className={cn("flex gap-2 items-start", message.role === 'user' ? "justify-end" : "justify-start")}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden border border-border">
                                <Orb
                                  hue={220}
                                  hoverIntensity={0.5}
                                  rotateOnHover={true}
                                  forceHoverState={false}
                                  backgroundColor="transparent"
                                />
                              </div>
                            )}
                            <div className={cn("max-w-[75%] rounded-lg p-2 text-xs leading-relaxed", message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted border border-border")}>
                              {message.role === 'assistant' && index === chatMessages.length - 1 ? (
                                <TextType
                                  text={message.content}
                                  typingSpeed={30}
                                  showCursor={false}
                                  loop={false}
                                  className="text-xs"
                                />
                              ) : (
                                message.content
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                  <Separator />
                  <div className="p-3 bg-muted/30">
                    <div className="flex gap-2">
                      <Input placeholder="Ask about the document..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="text-xs" />
                      <Button 
                        size="sm" 
                        onClick={() => handleSendMessage()} 
                        className="relative w-10 h-10 p-0 rounded-full overflow-hidden"
                      >
                        <div className="absolute inset-0">
                          <Orb
                            hue={220}
                            hoverIntensity={0.8}
                            rotateOnHover={true}
                            forceHoverState={false}
                            backgroundColor="#ffffff"
                          />
                        </div>
                        <Send className="h-4 w-4 relative z-10 text-white" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(q)}
                          className="shrink-0 text-[10px] bg-background border border-border px-2 py-1 rounded-full hover:bg-primary/5 hover:border-primary/30 transition-colors text-muted-foreground whitespace-nowrap"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollArea>
        </div>
      </div >
    </ClickSpark >
  );
}
