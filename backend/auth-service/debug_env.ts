import dotenv from 'dotenv';
import path from 'path';

const dotEnvPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', dotEnvPath);
const result = dotenv.config({ path: dotEnvPath });
if (result.error) {
    console.error('Dotenv Error:', result.error);
}

const key = process.env.FIREBASE_PRIVATE_KEY;
console.log('Key length:', key?.length);
if (key) {
    console.log('Starts with Header:', key.startsWith('-----BEGIN PRIVATE KEY-----'));
    console.log('Contains literal newline:', key.includes('\n'));
    console.log('Contains backslash-n:', key.includes('\\n'));
    console.log('First 40 chars:', key.substring(0, 40));
} else {
    console.log('Key NOT found in process.env');
}
