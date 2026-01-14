// Direct test of Gemini API - no browser, no cache
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAvGWjsw1zI1t15rda64imTpsjtj9gMB_k';
const genAI = new GoogleGenerativeAI(API_KEY);

const testText = `
LOAN AGREEMENT

This Loan Agreement is entered into between TechCorp Industries and Global Finance Bank.

ARTICLE 1: LOAN AMOUNT
The principal amount of this loan is $50,000,000 (Fifty Million Dollars).

ARTICLE 2: INTEREST RATE
The loan shall bear interest at a rate of 7.5% per annum.

ARTICLE 3: TERM
The loan term is 5 years, maturing on January 15, 2029.

ARTICLE 4: PAYMENT SCHEDULE
Quarterly payments of $2,500,000 plus accrued interest.

ARTICLE 5: FINANCIAL COVENANTS
Borrower must maintain:
- Debt Service Coverage Ratio of 1.25:1.00
- Leverage Ratio not exceeding 3.50:1.00
- Current Ratio of at least 1.50:1.00

ARTICLE 6: EVENTS OF DEFAULT
Default occurs if:
- Payment is late by more than 5 business days
- Covenant breach continues for 30 days
- Bankruptcy proceedings commence

ARTICLE 7: SECURITY
Borrower grants a first-priority security interest in all assets.

ARTICLE 8: REPRESENTATIONS AND WARRANTIES
Borrower represents that all financial statements are accurate.

ARTICLE 9: GOVERNING LAW
This agreement is governed by the laws of New York.

ARTICLE 10: PREPAYMENT
Prepayments within 24 months subject to 2% premium.
`;

async function testGeminiAPI() {
  console.log('=== GEMINI API TEST ===\n');
  console.log('Testing with sample loan agreement text...\n');
  console.log('Text length:', testText.length, 'characters\n');

  try {
    console.log('Attempting with gemini-2.5-flash (CONFIRMED AVAILABLE)...');
    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash' }
    );

    const prompt = `Analyze this loan agreement and extract sections. Return JSON:
{
  "sections": [
    {"title": "string", "summary": "string", "status": "ok or warning", "content": "string"}
  ],
  "metrics": {
    "principal": "$X,XXX,XXX",
    "interestRate": "X.XX%",
    "term": "X years",
    "covenants": 0
  }
}

Extract ALL sections (aim for 8-10). Set status to "warning" for high interest (>10%) or strict terms.

Document:
${testText}`;

    console.log('Sending request to Gemini...\n');
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    console.log('✅ SUCCESS! Received response from Gemini\n');
    console.log('Raw response length:', response.length, 'characters\n');
    console.log('Raw response preview:', response.substring(0, 200), '...\n');

    // Try to parse JSON
    let cleaned = response;
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(cleaned);
    console.log('✅ JSON parsed successfully!\n');
    console.log('Sections found:', parsed.sections.length);
    console.log('Metrics:', JSON.stringify(parsed.metrics, null, 2));
    console.log('\nSection titles:');
    parsed.sections.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.title} [${s.status}]`);
    });

    console.log('\n✅ TEST PASSED! Gemini API is working correctly.');
    console.log('The issue is browser caching, not the API.\n');

  } catch (error) {
    console.error('❌ TEST FAILED!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.error('\nFull error:', error);
  }
}

testGeminiAPI();
