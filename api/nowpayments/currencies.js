/**
 * NowPayments Currencies API Endpoint
 * Proxies requests to NowPayments API with API key security
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

    console.log('🔍 Fetching currencies from NowPayments...');

    const response = await fetch('https://api.nowpayments.io/v1/currencies', {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ NowPayments API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch currencies',
        details: response.statusText 
      });
    }

    const data = await response.json();
    
    // Transform and filter currencies for better UX
    const currencies = data.currencies?.map(currency => ({
      id: currency.toLowerCase(),
      name: getCurrencyName(currency),
      symbol: currency.toUpperCase(),
      network: getCurrencyNetwork(currency)
    })) || [];

    // Filter to popular/supported currencies for better UX
    const popularCurrencies = currencies.filter(currency => 
      ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BCH', 'XRP', 'ADA', 'DOT', 'MATIC'].includes(currency.symbol)
    );

    console.log(`✅ Successfully fetched ${currencies.length} currencies (${popularCurrencies.length} popular)`);

    res.status(200).json({
      currencies: popularCurrencies.length > 0 ? popularCurrencies : currencies,
      total: currencies.length
    });

  } catch (error) {
    console.error('❌ Error in currencies endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Helper functions
function getCurrencyName(symbol) {
  const names = {
    'btc': 'Bitcoin',
    'eth': 'Ethereum', 
    'usdt': 'Tether',
    'usdc': 'USD Coin',
    'ltc': 'Litecoin',
    'bch': 'Bitcoin Cash',
    'xrp': 'XRP',
    'ada': 'Cardano',
    'dot': 'Polkadot',
    'matic': 'Polygon'
  };
  
  return names[symbol.toLowerCase()] || symbol.toUpperCase();
}

function getCurrencyNetwork(symbol) {
  const networks = {
    'usdt': 'ERC-20',
    'usdc': 'ERC-20',
    'matic': 'Polygon',
    'eth': 'Ethereum'
  };
  
  return networks[symbol.toLowerCase()];
}