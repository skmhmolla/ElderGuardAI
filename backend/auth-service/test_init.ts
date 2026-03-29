import dotenv from 'dotenv';
dotenv.config();
import { initializeFirebase } from './src/config/firebase';

console.log('Script started');
try {
    const app = initializeFirebase();
    console.log('Firebase initialized:', app.name);
} catch (e) {
    console.error('FAILED:', e);
}
