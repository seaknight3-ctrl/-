import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

async function testPDF(filePath) {
  console.log(`\n===== Testing: ${filePath} =====`);
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    console.log(`Pages: ${data.numpages}`);
    console.log(`Text length: ${data.text.length} characters`);
    console.log('\n--- First 500 characters ---');
    console.log(data.text.substring(0, 500));
    console.log('\n--- Last 500 characters ---');
    console.log(data.text.substring(Math.max(0, data.text.length - 500)));
    
    return data.text;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  const files = [
    './test_pdfs/Report.pdf',
    './test_pdfs/세부신용공여.pdf',
    './test_pdfs/담보기록.pdf'
  ];
  
  for (const file of files) {
    await testPDF(file);
  }
}

main();
