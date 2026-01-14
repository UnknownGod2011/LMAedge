import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAvGWjsw1zI1t15rda64imTpsjtj9gMB_k';
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  console.log('=== LISTING AVAILABLE GEMINI MODELS ===\n');
  
  try {
    const models = await genAI.listModels();
    console.log(`Found ${models.length} models:\n`);
    
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
    
    console.log('\n✅ Use one of these model names in your code!');
    
  } catch (error) {
    console.error('❌ Error listing models:');
    console.error(error.message);
    console.error('\nThis might mean your API key is invalid or has restrictions.');
  }
}

listModels();
