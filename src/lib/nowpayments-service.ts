/**
 * NowPayments API Service for WIZ Tipping Integration
 * Handles crypto donations/tips for creators
 * 
 * Security: API key should be stored server-side only
 * This service uses Firebase Functions for secure API calls
 */

import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  network?: string;
  image?: string;
}

export interface PaymentEstimate {
  currency_from: string;
  amount_from: number;
  currency_to: string;
  estimated_amount: number;
  fee_amount?: number;
  fee_percent?: number;
}

export interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  pay_amount?: number;
  ipn_callback_url: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
  fixed_rate?: boolean;
  case?: 'success' | 'fail';
  is_fee_paid_by_user?: boolean;
}

export interface CreatePaymentResponse {
  payment_id: string;
  payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
  payment_url?: string;
  created_at: string;
  updated_at: string;
  burning_percent?: number;
  expiration_estimate_date?: string;
}

export interface PaymentStatusResponse extends CreatePaymentResponse {
  actually_paid: number;
  actually_paid_at_fiat: number;
}

export interface TipCreatorRequest {
  creatorId: string;
  creatorName: string;
  amount: number;
  currency: string;
  payCurrency: string;
  settlementCurrency?: string; // New: for multi-coin settlement
  tipperName?: string;
  message?: string;
}

export interface MinAmountResponse {
  currency_from: string;
  currency_to: string;
  min_amount: number;
}

export class NowPaymentsService {
  private static baseUrl = 'https://us-central1-wiz-magic-platform.cloudfunctions.net';
  
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (auth.currentUser) {
      try {
        const token = await getIdToken(auth.currentUser);
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
    } else {
      // In debug/testing mode without auth, add a debug header
      console.log('🔧 NowPayments: Operating without authentication (debug mode)');
      headers['X-Debug-Mode'] = 'true';
    }
    
    return headers;
  }
  
  /**
   * Get available cryptocurrencies for payments
   */
  static async getCurrencies(): Promise<Currency[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/getNowPaymentsCurrencies`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText || 'Request failed';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      const currencyStrings = data.currencies || [];
      
      // Transform currency strings into Currency objects
      return currencyStrings.map((currencyCode: string) => ({
        id: currencyCode.toLowerCase(),
        name: this.getCurrencyDisplayName(currencyCode),
        symbol: currencyCode.toUpperCase()
      }));
    } catch (error) {
      console.error('❌ Error fetching currencies:', error);
      throw error;
    }
  }

  /**
   * Get minimum payment amount for a currency pair
   */
  static async getMinAmount(
    currencyFrom: string,
    currencyTo: string
  ): Promise<MinAmountResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/getNowPaymentsMinAmount?currency_from=${currencyFrom}&currency_to=${currencyTo}`,
        {
          method: 'GET',
          headers
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText || 'Request failed';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data as MinAmountResponse;
    } catch (error) {
      console.error('❌ Error getting minimum amount:', error);
      throw error;
    }
  }

  /**
   * Get estimated payment amount
   */
  static async getEstimate(
    amount: number,
    currencyFrom: string,
    currencyTo: string
  ): Promise<PaymentEstimate> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/getNowPaymentsEstimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`,
        {
          method: 'GET',
          headers
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText || 'Request failed';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data as PaymentEstimate;
    } catch (error) {
      console.error('❌ Error getting estimate:', error);
      throw error;
    }
  }

  /**
   * Create a tip payment for a creator
   */
  static async createTipPayment(request: TipCreatorRequest): Promise<CreatePaymentResponse> {
    try {
      // Currency-aware minimum amount validation (based on NOWPayments API requirements)
      const getMinimumAmount = (currency: string): number => {
        const curr = currency.toLowerCase();
        if (curr === 'btc') return 0.0003; // NOWPayments minimum ~0.0002625
        if (curr === 'doge') return 10; // Reasonable DOGE minimum
        if (curr === 'usdc') return 1.5; // Match USDT minimum
        if (curr === 'usdtbsc' || curr === 'usdt') return 1.5; // NOWPayments minimum for USDT BSC
        if (curr === 'usd') return 1.5; // USD tips use USDT BSC, so same minimum
        return 1.5; // Default for other currencies
      };

      const minimumAmount = getMinimumAmount(request.payCurrency);
      if (request.amount < minimumAmount) {
        const displayCurrency = request.payCurrency === 'usdtbsc' ? 'USDT (BSC)' : request.payCurrency.toUpperCase();
        throw new Error(`Invalid tip amount. Minimum ${minimumAmount} ${displayCurrency}`);
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/createNowPaymentsPayment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          price_amount: request.amount,
          price_currency: request.currency,
          pay_currency: request.payCurrency,
          settlement_currency: request.settlementCurrency, // New: settlement preference
          order_id: `tip-${Date.now()}`,
          order_description: 'Creator Tip via WIZ',
          creator_id: request.creatorId,
          creator_name: request.creatorName,
          tipper_name: request.tipperName,
          message: request.message
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText || 'Request failed';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // If invoice_url is provided, open it
      if (data.payment_url || data.invoice_url) {
        const url = data.payment_url || data.invoice_url;
        window.open(url, '_blank');
      }
      
      return data as CreatePaymentResponse;
    } catch (error) {
      console.error('❌ Error creating tip payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/getNowPaymentsStatus?paymentId=${paymentId}`,
        {
          method: 'GET',
          headers
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText || 'Request failed';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data as PaymentStatusResponse;
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Generate QR code data for USDT (BSC) payment
   */
  static generateQRData(address: string, amount: number, currency: string): string {
    // For USDT on BSC
    if (currency.toLowerCase() === 'usdtbsc') {
      return `binancesmartchain:${address}?amount=${amount}&token=USDT`;
    }
    
    // For Bitcoin
    if (currency.toLowerCase() === 'btc') {
      return `bitcoin:${address}?amount=${amount}`;
    }
    
    // For Ethereum and ERC-20 tokens
    if (currency.toLowerCase() === 'eth' || currency.toLowerCase().includes('eth')) {
      return `ethereum:${address}?value=${amount}`;
    }
    
    // Generic format
    return `${currency.toLowerCase()}:${address}?amount=${amount}`;
  }

  /**
   * Format currency amount for display
   */
  static formatCurrencyAmount(amount: number, currency: string): string {
    const decimals = this.getCurrencyDecimals(currency);
    return amount.toFixed(decimals);
  }

  /**
   * Get display name for currency code
   */
  private static getCurrencyDisplayName(currencyCode: string): string {
    const names: { [key: string]: string } = {
      'btc': 'Bitcoin',
      'eth': 'Ethereum', 
      'usdt': 'Tether USD',
      'usdtbsc': 'Tether USD (BSC)',
      'usdc': 'USD Coin',
      'ltc': 'Litecoin',
      'bch': 'Bitcoin Cash',
      'dot': 'Polkadot',
      'ada': 'Cardano',
      'matic': 'Polygon',
      'avax': 'Avalanche',
      'sol': 'Solana',
      'atom': 'Cosmos',
      'link': 'Chainlink',
      'xrp': 'Ripple',
      'doge': 'Dogecoin',
      'shib': 'Shiba Inu',
      'trx': 'TRON',
      'ton': 'Toncoin',
      'near': 'NEAR Protocol'
    };
    
    return names[currencyCode.toLowerCase()] || currencyCode.toUpperCase();
  }

  /**
   * Get appropriate decimal places for currency
   */
  private static getCurrencyDecimals(currency: string): number {
    const lowercaseCurrency = currency.toLowerCase();
    
    // Bitcoin and similar
    if (['btc', 'ltc', 'bch'].includes(lowercaseCurrency)) return 8;
    
    // Ethereum and most ERC-20
    if (['eth', 'usdt', 'usdtbsc', 'usdc', 'dai'].includes(lowercaseCurrency)) return 6;
    
    // Fiat currencies
    if (['usd', 'eur', 'gbp'].includes(lowercaseCurrency)) return 2;
    
    // Default
    return 6;
  }
}

// Types for component props
export interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
}

export interface TipButtonProps {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}