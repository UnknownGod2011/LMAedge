// Direct REST API call to check what models are available
const API_KEY = 'AIzaSyAvGWjsw1zI1t15rda64imTpsjtj9gMB_k';

async function checkModels() {
  console.log('=== CHECKING GEMINI API ===\n');
  
  const urls = [
    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
  ];
  
  for (const url of urls) {
    console.log(`\nTrying: ${url.replace(API_KEY, 'API_KEY')}`);
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ SUCCESS! Found ${data.models?.length || 0} models`);
        if (data.models) {
          data.models.forEach(m => {
            if (m.supportedGenerationMethods?.includes('generateContent')) {
              console.log(`  - ${m.name.split('/').pop()} [${m.supportedGenerationMethods.join(', ')}]`);
            }
          });
        }
      } else {
        console.log(`❌ Error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

checkModels();
