
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Load env (simplified for script)
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
    console.error('GOOGLE_GEMINI_API_KEY is required');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Test Imagen model
// Note: 'imagen-3.0-generate-001' is the model name for Imagen 3
// Check docs for exact model string if this fails.
const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

async function testImageGen() {
    try {
        console.log('Testing Image Generation...');
        const prompt = 'A futuristic exhibition stand with green plants and neon lights, 3d render';

        // The SDK usage for Imagen might differ. 
        // If generateContent doesn't work, we might need to check standard REST behavior.
        // But let's try the standard method first as it's the 'GenerativeModel' interface.
        const result = await model.generateContent(prompt);
        const response = result.response;

        console.log('Response received.');
        // Imagen response usually contains images in 'candidates' or 'parts'.
        // We'll inspect the response structure.
        console.log(JSON.stringify(response, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

testImageGen();
