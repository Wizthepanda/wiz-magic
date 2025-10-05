"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeYouTubeToken = void 0;
const https_1 = require("firebase-functions/v2/https");
/**
 * Cloud Function to exchange YouTube authorization code for access token
 * This is needed because Firebase Auth redirect doesn't provide OAuth tokens
 */
exports.exchangeYouTubeToken = (0, https_1.onRequest)({
    cors: true,
    region: 'us-central1',
}, async (request, response) => {
    // Handle CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    try {
        if (request.method !== 'POST') {
            response.status(405).json({ error: 'Method not allowed' });
            return;
        }
        const { code, redirectUri } = request.body;
        if (!code) {
            response.status(400).json({ error: 'Authorization code is required' });
            return;
        }
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri || 'https://wizxp.com/__/auth/handler',
                grant_type: 'authorization_code',
            }),
        });
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', errorText);
            response.status(400).json({
                error: 'Token exchange failed',
                details: errorText
            });
            return;
        }
        const tokenData = await tokenResponse.json();
        // Return only the access token (not refresh token for security)
        response.json({
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope,
        });
    }
    catch (error) {
        console.error('YouTube token exchange error:', error);
        response.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=youtube-token-exchange.js.map