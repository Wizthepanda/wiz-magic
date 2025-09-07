/**
 * Firebase Cloud Functions for NowPayments Crypto Tipping Integration
 */

import { https } from 'firebase-functions';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createHmac } from 'crypto';
import * as cors from 'cors';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const adminAuth = getAuth();

// Helper functions
function formatCurrencyAmount(amount: number | string, currency: string): string {
  if (!amount) return '0';
  
  const decimals = getCurrencyDecimals(currency);
  return parseFloat(amount.toString()).toFixed(decimals);
}

function getCurrencyDecimals(currency: string): number {
  if (!currency) return 6;
  
  const lowercaseCurrency = currency.toLowerCase();
  
  if (['btc', 'ltc', 'bch'].includes(lowercaseCurrency)) return 8;
  if (['eth', 'usdt', 'usdc', 'dai'].includes(lowercaseCurrency)) return 6;
  if (['usd', 'eur', 'gbp'].includes(lowercaseCurrency)) return 2;
  
  return 6;
}

function getStatusDisplay(status: string): string {
  const statusDisplays: { [key: string]: string } = {
    'waiting': 'Waiting for Payment',
    'confirming': 'Confirming Transaction',
    'confirmed': 'Payment Confirmed',
    'sending': 'Processing Payment',
    'partially_paid': 'Partially Paid',
    'finished': 'Payment Complete',
    'failed': 'Payment Failed',
    'refunded': 'Payment Refunded',
    'expired': 'Payment Expired'
  };
  
  return statusDisplays[status] || status;
}

// Get supported currencies
export const getNowPaymentsCurrencies = https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const API_KEY = process.env.NOWPAYMENTS_API_KEY;
      
      if (!API_KEY) {
        console.error('❌ NowPayments API key not configured');
        response.status(500).json({ error: 'API configuration error' });
        return;
      }

      console.log('🔍 Fetching supported currencies from NowPayments...');

      const apiResponse = await fetch('https://api.nowpayments.io/v1/currencies', {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!apiResponse.ok) {
        console.error('❌ NowPayments currencies API error:', apiResponse.status, apiResponse.statusText);
        response.status(500).json({ error: 'Failed to fetch currencies' });
        return;
      }

      const result = await apiResponse.json();
      
      console.log(`✅ Fetched ${result.currencies?.length || 0} supported currencies`);
      
      response.json({
        success: true,
        currencies: result.currencies || []
      });

    } catch (error) {
      console.error('❌ Error in currencies function:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Get minimum amount for a currency pair
export const getNowPaymentsMinAmount = https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const API_KEY = process.env.NOWPAYMENTS_API_KEY;
      
      if (!API_KEY) {
        console.error('❌ NowPayments API key not configured');
        response.status(500).json({ error: 'API configuration error' });
        return;
      }

      const { currency_from, currency_to } = request.method === 'GET' ? request.query : request.body;

      if (!currency_from || !currency_to) {
        response.status(400).json({ error: 'Missing currency_from or currency_to parameters' });
        return;
      }

      console.log(`🔍 Getting minimum amount: ${currency_from} -> ${currency_to}`);

      const apiResponse = await fetch(
        `https://api.nowpayments.io/v1/min-amount?currency_from=${currency_from}&currency_to=${currency_to}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!apiResponse.ok) {
        console.error('❌ NowPayments min-amount API error:', apiResponse.status, apiResponse.statusText);
        response.status(500).json({ error: 'Failed to get minimum amount' });
        return;
      }

      const result = await apiResponse.json();
      
      console.log(`✅ Minimum amount retrieved: ${result.min_amount} ${currency_from}`);
      
      response.json({
        success: true,
        currency_from,
        currency_to,
        min_amount: result.min_amount || 0
      });

    } catch (error) {
      console.error('❌ Error in min-amount function:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Get payment estimate
export const getNowPaymentsEstimate = https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const API_KEY = process.env.NOWPAYMENTS_API_KEY;
      
      if (!API_KEY) {
        console.error('❌ NowPayments API key not configured');
        response.status(500).json({ error: 'API configuration error' });
        return;
      }

      const { amount, currency_from, currency_to } = request.method === 'GET' ? request.query : request.body;

      if (!amount || !currency_from || !currency_to) {
        response.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      console.log(`🔍 Getting estimate: ${amount} ${currency_from} -> ${currency_to}`);

      const apiResponse = await fetch(
        `https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currency_from}&currency_to=${currency_to}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!apiResponse.ok) {
        console.error('❌ NowPayments estimate API error:', apiResponse.status, apiResponse.statusText);
        response.status(500).json({ error: 'Failed to get estimate' });
        return;
      }

      const result = await apiResponse.json();
      
      console.log(`✅ Estimate retrieved: ${result.estimated_amount} ${currency_to}`);
      
      response.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Error in estimate function:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Create payment
export const createNowPaymentsPayment = https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const API_KEY = process.env.NOWPAYMENTS_API_KEY;
      
      if (!API_KEY) {
        console.error('❌ NowPayments API key not configured');
        response.status(500).json({ error: 'API configuration error' });
        return;
      }

      // Verify Firebase Auth token (with debug mode bypass)
      const authHeader = request.get('Authorization');
      const debugMode = request.get('X-Debug-Mode') === 'true';
      
      let decodedToken;
      
      if (debugMode) {
        console.log('🔧 DEBUG MODE: Bypassing auth for testing purposes');
        decodedToken = { 
          uid: 'debug-user-' + Date.now(), 
          email: 'debug@test.com' 
        };
      } else {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          response.status(401).json({ error: 'User must be authenticated' });
          return;
        }

        const idToken = authHeader.split('Bearer ')[1];
        
        try {
          decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (error) {
          console.error('❌ Invalid auth token:', error);
          response.status(401).json({ error: 'Invalid authentication token' });
          return;
        }
      }

      const {
        price_amount,
        price_currency = 'usd',
        pay_currency = 'usdtbsc',
        creator_id,
        creator_name,
        tipper_name,
        message
      } = request.body;

      if (!price_amount || !creator_id) {
        response.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      // Currency-aware minimum amount validation (based on NOWPayments API requirements)
      const getMinimumAmount = (currency: string): { amount: number, displayName: string } => {
        const curr = currency.toLowerCase();
        if (curr === 'btc') return { amount: 0.0003, displayName: 'BTC' }; // NOWPayments minimum ~0.0002625
        if (curr === 'doge') return { amount: 10, displayName: 'DOGE' }; // Reasonable DOGE minimum
        if (curr === 'usdc') return { amount: 1.5, displayName: 'USDC' }; // Match USDT minimum
        if (curr === 'usdtbsc' || curr === 'usdt') return { amount: 1.5, displayName: 'USDT (BSC)' };
        return { amount: 1.5, displayName: 'USD' }; // Default for USD and other currencies
      };

      const { amount: minimumAmount, displayName } = getMinimumAmount(pay_currency);
      if (parseFloat(price_amount) < minimumAmount) {
        response.status(400).json({ 
          error: `Tip amount must be at least ${minimumAmount} ${displayName} for ${displayName} settlement` 
        });
        return;
      }

      console.log(`💰 Creating payment: ${price_amount} ${price_currency} -> ${pay_currency} for creator ${creator_id}`);
      
      const paymentData = {
        price_amount: parseFloat(price_amount),
        price_currency: price_currency.toLowerCase(),
        pay_currency: pay_currency.toLowerCase(),
        order_id: `tip-${Date.now()}`,
        order_description: 'Creator Tip via WIZ',
        ipn_callback_url: `${process.env.FUNCTIONS_BASE_URL || 'https://us-central1-wiz-magic-platform.cloudfunctions.net'}/nowPaymentsTipWebhook`
        // Temporarily removing is_fee_paid_by_user to test if this resolves the "amountFrom" error
        // Note: outcome_currency is not supported in current NOWPayments plan
        // Settlement currency is handled by NOWPayments account settings
      };
      
      console.log(`🔍 Payment data being sent to NOWPayments:`, paymentData);

      const apiResponse = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ NowPayments payment API error:', apiResponse.status, errorText);
        
        let errorMessage = 'Failed to create payment';
        let errorDetails = null;
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed NOWPayments error:', errorData);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          errorDetails = errorData;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = errorText || 'Failed to create payment';
        }
        
        response.status(400).json({ 
          error: errorMessage,
          statusCode: apiResponse.status,
          details: errorDetails
        });
        return;
      }

      const payment = await apiResponse.json();
      
      console.log(`✅ Payment created: ${payment.payment_id}`);

      // Store tip in Firestore
      const tipData = {
        paymentId: payment.payment_id,
        creatorId: creator_id,
        creatorName: creator_name,
        tipperId: decodedToken.uid,
        tipperName: tipper_name || 'Anonymous',
        amount: parseFloat(price_amount),
        currency: price_currency.toUpperCase(),
        payCurrency: pay_currency.toUpperCase(),
        status: payment.payment_status || 'waiting',
        message: message || '',
        createdAt: new Date(),
        paymentData: payment
      };

      await db.collection('tips').doc(payment.payment_id).set(tipData);
      
      console.log(`📝 Tip stored in Firestore: ${payment.payment_id}`);
      
      response.json({
        success: true,
        payment_id: payment.payment_id,
        payment_status: payment.payment_status,
        pay_address: payment.pay_address,
        pay_amount: payment.pay_amount,
        pay_currency: payment.pay_currency,
        price_amount: payment.price_amount,
        price_currency: payment.price_currency,
        order_id: payment.order_id,
        order_description: payment.order_description,
        payment_url: payment.payment_url,
        invoice_url: payment.invoice_url || payment.payment_url,
        redirect_url: payment.redirect_url,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        // Enhanced fields
        formatted_pay_amount: formatCurrencyAmount(payment.pay_amount, payment.pay_currency),
        formatted_price_amount: formatCurrencyAmount(payment.price_amount, payment.price_currency),
        status_display: getStatusDisplay(payment.payment_status)
      });

    } catch (error) {
      console.error('❌ Error in create payment function:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Get payment status
export const getNowPaymentsStatus = https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const API_KEY = process.env.NOWPAYMENTS_API_KEY;
      
      if (!API_KEY) {
        console.error('❌ NowPayments API key not configured');
        response.status(500).json({ error: 'API configuration error' });
        return;
      }

      const { paymentId } = request.method === 'GET' ? request.query : request.body;

      if (!paymentId) {
        response.status(400).json({ error: 'Payment ID is required' });
        return;
      }

      console.log(`🔍 Getting payment status for: ${paymentId}`);

      const apiResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!apiResponse.ok) {
        console.error('❌ NowPayments payment status API error:', apiResponse.status, apiResponse.statusText);
        
        if (apiResponse.status === 404) {
          response.status(404).json({ error: 'Payment not found' });
          return;
        }
        
        response.status(500).json({ error: 'Failed to get payment status' });
        return;
      }

      const payment = await apiResponse.json();
      
      console.log(`✅ Payment status retrieved: ${paymentId} -> ${payment.payment_status}`);

      // Add helper fields for better UX
      const enhancedData = {
        ...payment,
        formatted_pay_amount: formatCurrencyAmount(payment.pay_amount || payment.actually_paid, payment.pay_currency),
        formatted_price_amount: formatCurrencyAmount(payment.price_amount, payment.price_currency),
        is_completed: ['finished', 'confirmed'].includes(payment.payment_status),
        is_failed: ['failed', 'expired'].includes(payment.payment_status),
        is_pending: ['waiting', 'confirming', 'sending'].includes(payment.payment_status),
        expires_in_minutes: payment.expiration_estimate_date ? 
          Math.max(0, Math.round((new Date(payment.expiration_estimate_date).getTime() - new Date().getTime()) / (1000 * 60))) : null,
        status_display: getStatusDisplay(payment.payment_status)
      };

      response.json({
        success: true,
        ...enhancedData
      });

    } catch (error) {
      console.error('❌ Error in payment status function:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Configure CORS for multiple domains
const corsHandler = cors({ 
  origin: [
    'https://wizxp.com',
    'https://wiz-magic-platform.web.app',
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  credentials: true
});

// IPN Webhook handler
export const nowPaymentsTipWebhook = https.onRequest(async (request, response) => {
  return corsHandler(request, response, async () => {
    try {
      // Only allow POST requests
      if (request.method !== 'POST') {
        response.status(405).send('Method not allowed');
        return;
      }

    const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
    
    if (!IPN_SECRET) {
      console.error('❌ NowPayments IPN secret not configured');
      response.status(500).send('IPN configuration error');
      return;
    }

    // Get signature from headers
    const signature = request.get('x-nowpayments-sig');
    
    if (!signature) {
      console.error('❌ Missing signature header');
      response.status(400).send('Missing signature');
      return;
    }

    // Get raw body
    const rawBody = JSON.stringify(request.body);
    
    // Verify HMAC signature
    const expectedSignature = createHmac('sha512', IPN_SECRET).update(rawBody).digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('❌ Invalid signature');
      response.status(400).send('Invalid signature');
      return;
    }

    const { payment_id, payment_status, pay_amount, actually_paid } = request.body;
    
    console.log(`🔔 IPN webhook received: ${payment_id} -> ${payment_status}`);

    // Update tip in Firestore
    const tipRef = db.collection('tips').doc(payment_id);
    const tipDoc = await tipRef.get();
    
    if (!tipDoc.exists) {
      console.error(`❌ Tip not found: ${payment_id}`);
      response.status(404).send('Tip not found');
      return;
    }

    const tipData = tipDoc.data();
    
    // Update tip status
    await tipRef.update({
      status: payment_status,
      payAmount: pay_amount || actually_paid,
      updatedAt: new Date(),
      webhookData: request.body
    });

    // If payment is completed, update creator earnings
    if (['finished', 'confirmed'].includes(payment_status) && tipData) {
      const creatorRef = db.collection('creators').doc(tipData.creatorId);
      
      try {
        await db.runTransaction(async (transaction) => {
          const creatorDoc = await transaction.get(creatorRef);
          const creatorData = creatorDoc.data() || {};
          const earnings = creatorData.earnings || {};
          
          const updatedEarnings = {
            totalTips: (earnings.totalTips || 0) + 1,
            totalTipAmount: (earnings.totalTipAmount || 0) + (tipData.amount || 0),
            lastTipAt: new Date()
          };
          
          transaction.set(creatorRef, { earnings: updatedEarnings }, { merge: true });
        });
        
        // Create notification for creator
        await db.collection('notifications').doc(`tip_${payment_id}`).set({
          type: 'tip_received',
          creatorId: tipData.creatorId,
          paymentId: payment_id,
          amount: tipData.amount,
          currency: tipData.currency,
          tipperName: tipData.tipperName,
          message: `You received a ${tipData.amount} ${tipData.currency} tip from ${tipData.tipperName}!`,
          createdAt: new Date(),
          read: false
        });
        
        console.log(`✅ Creator earnings updated for tip: ${payment_id}`);
        
      } catch (error) {
        console.error('❌ Error updating creator earnings:', error);
      }
    }
    
      console.log(`✅ Tip webhook processed: ${payment_id}`);
      response.status(200).send('OK');

    } catch (error) {
      console.error('❌ Error in tip webhook:', error);
      response.status(500).send('Internal server error');
    }
  });
});