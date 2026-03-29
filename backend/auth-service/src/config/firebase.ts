// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Firebase Admin Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Firebase Admin Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { logger } from '../utils/logger';

console.log('🔍 [FIREBASE] PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): admin.app.App {
    if (firebaseApp) {
        return firebaseApp;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();

    const isPlaceholder = (key?: string) => {
        if (!key) return true;
        return key.includes('YOUR_') || 
               key.includes('your-') || 
               key.includes('xxxxx') ||
               key.length < 50;
    };

    const hasValidCredentials = 
        projectId && 
        clientEmail && 
        privateKey && 
        !projectId.includes('your-') &&
        !isPlaceholder(privateKey) &&
        privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
        privateKey.length > 200;

    if (!hasValidCredentials) {
        logger.warn('⚠️ Firebase credentials not configured or using placeholders for Auth service.');
        
        if (admin.apps.length === 0) {
            firebaseApp = admin.initializeApp({
                projectId: projectId || 'demo-eldernest',
            });
        } else {
            firebaseApp = admin.app();
        }
        return firebaseApp;
    }

    try {
        const serviceAccount: admin.ServiceAccount = {
            projectId,
            privateKey,
            clientEmail,
        };

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });

        logger.info('✅ Firebase Admin SDK initialized successfully in Auth Service');
        return firebaseApp;
    } catch (error) {
        logger.error('❌ Failed to initialize Firebase in Auth Service:', error);
        
        // Fallback for dev
        if (process.env.NODE_ENV !== 'production') {
            logger.warn('⚠️ Falling back to demo mode in Auth Service');
            if (admin.apps.length === 0) {
                firebaseApp = admin.initializeApp({
                    projectId: 'demo-eldernest',
                });
            } else {
                firebaseApp = admin.app();
            }
            return firebaseApp;
        }
        
        throw error;
    }
}

/**
 * Get Firestore database instance
 */
export function getDb() {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return getFirestore();
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth() {
    if (!firebaseApp) {
        initializeFirebase();
    }
    return getAuth();
}

/**
 * Firestore collections
 */
export const Collections = {
    USERS: 'users',
    OTPS: 'otps',
    OTP_RATE_LIMITS: 'otp_rate_limits',
    PENDING_CONNECTIONS: 'pending_connections',
    REFRESH_TOKENS: 'refresh_tokens',
    AUTH_LOGS: 'auth_logs',
} as const;

export default {
    initializeFirebase,
    getDb,
    getFirebaseAuth,
    Collections,
};
