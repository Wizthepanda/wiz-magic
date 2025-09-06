/**
 * NowPayments Payment Creation API Endpoint
 * Creates payment requests for crypto tips
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/lib/firebase.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
    
    if (!API_KEY) {
      console.error('❌ NowPayments API key not configured');
      return res.status(500).json({ error: 'API configuration error' });
    }

    const {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
      purchase_id,
      ipn_callback_url,
      creatorId,
      tipperName,
      message
    } = req.body;

    // Validate required parameters
    if (!price_amount || !price_currency || !pay_currency || !creatorId) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['price_amount', 'price_currency', 'pay_currency', 'creatorId']
      });
    }

    // Validate amount
    const numAmount = parseFloat(price_amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    console.log(`🔍 Creating payment: ${price_amount} ${price_currency} -> ${pay_currency} for creator ${creatorId}`);

    // Create payment request
    const paymentData = {
      price_amount: numAmount,
      price_currency: price_currency.toUpperCase(),
      pay_currency: pay_currency.toUpperCase(),
      order_id: order_id || `tip_${creatorId}_${Date.now()}`,
      order_description: order_description || `Tip for Creator`,
      purchase_id: purchase_id || `${creatorId}_${Date.now()}`,
      ipn_callback_url: ipn_callback_url || `${req.headers.origin || 'https://wiz-magic-platform.web.app'}/api/webhooks/nowpayments/tips`,
      is_fee_paid_by_user: true,
      case: 'success'
    };

    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      console.error('❌ NowPayments payment API error:', response.status, response.statusText);
      
      const errorData = await response.text();
      console.error('Error details:', errorData);
      
      return res.status(response.status).json({ 
        error: 'Failed to create payment',
        details: response.statusText
      });
    }

    const paymentResponse = await response.json();
    
    console.log(`✅ Payment created: ${paymentResponse.payment_id}`);

    // Store tip metadata in Firestore for tracking
    try {
      const tipRef = doc(db, 'tips', paymentResponse.payment_id);
      await setDoc(tipRef, {
        paymentId: paymentResponse.payment_id,
        creatorId,
        amount: numAmount,
        currency: price_currency.toUpperCase(),
        payCurrency: pay_currency.toUpperCase(),
        payAmount: paymentResponse.pay_amount,
        payAddress: paymentResponse.pay_address,
        status: paymentResponse.payment_status,
        tipperName: tipperName || null,
        message: message || null,
        orderId: paymentData.order_id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Payment tracking
        paymentUrl: paymentResponse.payment_url,
        expiresAt: paymentResponse.expiration_estimate_date ? new Date(paymentResponse.expiration_estimate_date) : null
      });
      
      console.log(`✅ Tip metadata saved to Firestore: ${paymentResponse.payment_id}`);
    } catch (firestoreError) {
      console.error('⚠️ Failed to save tip metadata to Firestore:', firestoreError);
      // Don't fail the payment creation if Firestore fails
    }

    // Return enhanced payment response
    res.status(200).json({
      ...paymentResponse,
      // Add helper fields
      formatted_pay_amount: formatCurrencyAmount(paymentResponse.pay_amount, pay_currency),
      qr_data: generateQRData(paymentResponse.pay_address, paymentResponse.pay_amount, pay_currency),
      expires_in_minutes: paymentResponse.expiration_estimate_date ? 
        Math.round((new Date(paymentResponse.expiration_estimate_date) - new Date()) / (1000 * 60)) : null
    });

  } catch (error) {
    console.error('❌ Error in payment endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Helper functions
function formatCurrencyAmount(amount, currency) {
  const decimals = getCurrencyDecimals(currency);
  return parseFloat(amount).toFixed(decimals);
}

function getCurrencyDecimals(currency) {
  const lowercaseCurrency = currency.toLowerCase();
  
  if (['btc', 'ltc', 'bch'].includes(lowercaseCurrency)) return 8;
  if (['eth', 'usdt', 'usdc', 'dai'].includes(lowercaseCurrency)) return 6;
  if (['usd', 'eur', 'gbp'].includes(lowercaseCurrency)) return 2;
  
  return 6;
}

function generateQRData(address, amount, currency) {
  const lowerCurrency = currency.toLowerCase();
  
  if (lowerCurrency === 'btc') {
    return `bitcoin:${address}?amount=${amount}`;
  }
  
  if (lowerCurrency === 'eth' || lowerCurrency.includes('eth')) {
    return `ethereum:${address}?value=${amount}`;
  }
  
  return `${lowerCurrency}:${address}?amount=${amount}`;
}