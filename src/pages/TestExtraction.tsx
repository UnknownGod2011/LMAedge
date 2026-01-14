import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'sonner';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function TestExtraction() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testWithSampleText = async () => {
    setLoading(true);
    try {
      // Fetch the test file
      const fileResponse = await fetch('/test_loan_comprehensive.txt');
      const text = await fileResponse.text();
      
      console.log('Loaded test text, length:', text.length);
      
      const model = genAI.getGenerativeModel(
        { model: 'gemini-2.5-flash' }
      );
      
      const prompt = `You are analyzing a comprehensive loan agreement document with ${text.length} characters. This is a detailed legal document that likely contains MANY sections.

Your task: Extract ALL distinct sections from this document. A comprehensive loan agreement typically has 15-25+ major sections.

Return ONLY a valid JSON object with this exact structure:
{
  "sections": [
    {
      "title": "Section name",
      "summary": "2-3 sentence summary",
      "status": "ok or warning",
      "content": "Key details"
    }
  ],
  "metrics": {
    "principal": "$X,XXX,XXX",
    "interestRate": "X.XX%",
    "term": "X years",
    "covenants": 0
  }
}

CRITICAL: Extract AT LEAST 15-20 sections. Look for: Parties, Definitions, Loan Amount, Purpose, Interest Rate, Fees, Payment Schedule, Prepayment, Financial Covenants, Affirmative Covenants, Negative Covenants, Representations & Warranties, Conditions Precedent, Events of Default, Remedies, Security/Collateral, Indemnification, Governing Law, Notices, Amendments, Miscellaneous, Schedules.

Set status to "warning" for: high interest (>10%), strict covenants, severe penalties.

Document:
${text}`;

      console.log('Sending to Gemini...');
      const geminiResult = await model.generateContent(prompt);
      let responseText = geminiResult.response.text().trim();
      
      console.log('Response:', responseText);
      
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(responseText);
      console.log('Parsed result:', parsed);
      console.log('Sections found:', parsed.sections.length);
      
      setResult(parsed);
      toast.success(`Found ${parsed.sections.length} sections!`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Test failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test AI Extraction</h1>
      <p className="mb-4">This tests the AI extraction with a comprehensive loan agreement text file.</p>
      
      <Button onClick={testWithSampleText} disabled={loading}>
        {loading ? 'Testing...' : 'Test with Sample Loan Agreement'}
      </Button>
      
      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Results: {result.sections.length} Sections Found</h2>
          
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-bold mb-2">Metrics:</h3>
            <pre className="text-sm">{JSON.stringify(result.metrics, null, 2)}</pre>
          </div>
          
          <div className="space-y-4">
            {result.sections.map((section: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold">{section.title}</h3>
                  <span className={section.status === 'ok' ? 'text-green-600' : 'text-orange-500'}>
                    {section.status === 'ok' ? '✓' : '⚠'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{section.summary}</p>
                <details className="text-xs">
                  <summary className="cursor-pointer">View content</summary>
                  <p className="mt-2 p-2 bg-muted rounded">{section.content}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
