/**
 * NowPayments Payment Status API Endpoint
 * Get payment status by payment ID
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ NowPayments API key not configured');
      return res.status(500).json({ error: 'API configuration error' });
    }

    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    console.log(`🔍 Getting payment status for: ${paymentId}`);

    const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ NowPayments payment status API error:', response.status, response.statusText);
      
      if (response.status === 404) {
        return res.status(404).json({ 
          error: 'Payment not found',
          payment_id: paymentId
        });
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to get payment status',
        details: response.statusText 
      });
    }

    const data = await response.json();
    
    console.log(`✅ Payment status retrieved: ${paymentId} -> ${data.payment_status}`);

    // Add helper fields for better UX
    const enhancedData = {
      ...data,
      formatted_pay_amount: formatCurrencyAmount(data.pay_amount || data.actually_paid, data.pay_currency),
      formatted_price_amount: formatCurrencyAmount(data.price_amount, data.price_currency),
      is_completed: ['finished', 'confirmed'].includes(data.payment_status),
      is_failed: ['failed', 'expired'].includes(data.payment_status),
      is_pending: ['waiting', 'confirming', 'sending'].includes(data.payment_status),
      expires_in_minutes: data.expiration_estimate_date ? 
        Math.max(0, Math.round((new Date(data.expiration_estimate_date) - new Date()) / (1000 * 60))) : null,
      status_display: getStatusDisplay(data.payment_status)
    };

    res.status(200).json(enhancedData);

  } catch (error) {
    console.error('❌ Error in payment status endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Helper functions
function formatCurrencyAmount(amount, currency) {
  if (!amount) return '0';
  
  const decimals = getCurrencyDecimals(currency);
  return parseFloat(amount).toFixed(decimals);
}

function getCurrencyDecimals(currency) {
  if (!currency) return 6;
  
  const lowercaseCurrency = currency.toLowerCase();
  
  if (['btc', 'ltc', 'bch'].includes(lowercaseCurrency)) return 8;
  if (['eth', 'usdt', 'usdc', 'dai'].includes(lowercaseCurrency)) return 6;
  if (['usd', 'eur', 'gbp'].includes(lowercaseCurrency)) return 2;
  
  return 6;
}

function getStatusDisplay(status) {
  const statusDisplays = {
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