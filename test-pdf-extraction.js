// Test PDF text extraction with PDF.js
import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = join(__dirname, 'public', 'pdf.worker.min.mjs');

async function testPDFExtraction() {
  console.log('=== TESTING PDF TEXT EXTRACTION ===\n');
  
  const pdfPath = join(__dirname, 'demo_loan_doc.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ demo_loan_doc.pdf not found!');
    return;
  }
  
  console.log('✅ Found demo_loan_doc.pdf');
  const fileSize = fs.statSync(pdfPath).size;
  console.log(`   File size: ${(fileSize / 1024).toFixed(2)} KB\n`);
  
  try {
    console.log('Loading PDF...');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    
    console.log(`✅ PDF loaded successfully!`);
    console.log(`   Total pages: ${pdf.numPages}\n`);
    
    console.log('Extracting text from all pages...\n');
    let fullText = '';
    
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      console.log(`Processing page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n\n';
      
      console.log(`   Page ${i} text length: ${pageText.length} characters`);
      if (i === 1) {
        console.log(`   First 200 chars: "${pageText.substring(0, 200)}..."`);
      }
    }
    
    console.log(`\n✅ TEXT EXTRACTION COMPLETE!`);
    console.log(`   Total extracted text: ${fullText.length} characters`);
    console.log(`\nFirst 500 characters of extracted text:`);
    console.log('---');
    console.log(fullText.substring(0, 500));
    console.log('---');
    
    if (fullText.length < 100) {
      console.log('\n⚠️  WARNING: Very little text extracted!');
      console.log('   The PDF might be image-based (scanned) or encrypted.');
    } else {
      console.log('\n✅ PDF text extraction is working!');
      console.log('   The issue is likely with browser caching or Gemini API calls.');
    }
    
  } catch (error) {
    console.error('\n❌ PDF EXTRACTION FAILED!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
  }
}

testPDFExtraction();
