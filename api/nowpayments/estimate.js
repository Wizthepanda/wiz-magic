/**
 * NowPayments Estimate API Endpoint
 * Get estimated payment amount for currency conversion
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

    const { amount, currency_from, currency_to } = req.query;

    // Validate required parameters
    if (!amount || !currency_from || !currency_to) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['amount', 'currency_from', 'currency_to']
      });
    }

    // Validate amount is positive number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    console.log(`🔍 Getting estimate: ${amount} ${currency_from} -> ${currency_to}`);

    const params = new URLSearchParams({
      amount: numAmount.toString(),
      currency_from: currency_from.toUpperCase(),
      currency_to: currency_to.toUpperCase()
    });

    const response = await fetch(`https://api.nowpayments.io/v1/estimate?${params}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ NowPayments estimate API error:', response.status, response.statusText);
      
      // Handle specific error cases
      if (response.status === 400) {
        return res.status(400).json({ 
          error: 'Invalid currency pair or amount',
          details: 'Please check the currency codes and amount'
        });
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to get estimate',
        details: response.statusText 
      });
    }

    const data = await response.json();
    
    console.log(`✅ Estimate successful: ${data.estimated_amount} ${currency_to}`);

    // Add additional metadata for better UX
    const enhancedData = {
      ...data,
      formatted_amount: formatCurrencyAmount(data.estimated_amount, currency_to.toUpperCase()),
      exchange_rate: data.estimated_amount / numAmount,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(enhancedData);

  } catch (error) {
    console.error('❌ Error in estimate endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Helper function to format currency amounts
function formatCurrencyAmount(amount, currency) {
  const decimals = getCurrencyDecimals(currency);
  return parseFloat(amount).toFixed(decimals);
}

function getCurrencyDecimals(currency) {
  const lowercaseCurrency = currency.toLowerCase();
  
  // Bitcoin and similar
  if (['btc', 'ltc', 'bch'].includes(lowercaseCurrency)) return 8;
  
  // Ethereum and most ERC-20
  if (['eth', 'usdt', 'usdc', 'dai'].includes(lowercaseCurrency)) return 6;
  
  // Fiat currencies
  if (['usd', 'eur', 'gbp'].includes(lowercaseCurrency)) return 2;
  
  // Default
  return 6;
}