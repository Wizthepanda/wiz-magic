/**
 * NowPayments IPN Webhook Handler for Tips
 * Securely processes payment status updates
 */

import crypto from 'crypto';
import { doc, updateDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
    
    if (!IPN_SECRET) {
      console.error('❌ NowPayments IPN secret not configured');
      return res.status(500).json({ error: 'IPN configuration error' });
    }

    // Get the signature from headers
    const receivedSignature = req.headers['x-nowpayments-sig'];
    
    if (!receivedSignature) {
      console.error('❌ Missing IPN signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Get the raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    
    // Verify the signature
    const expectedSignature = crypto
      .createHmac('sha512', IPN_SECRET)
      .update(rawBody)
      .digest('hex');

    if (receivedSignature !== expectedSignature) {
      console.error('❌ Invalid IPN signature');
      console.error('Received:', receivedSignature);
      console.error('Expected:', expectedSignature);
      return res.status(403).json({ error: 'Invalid signature' });
    }

    console.log('✅ IPN signature verified');

    // Process the payment notification
    const {
      payment_id,
      payment_status,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      order_id,
      order_description,
      purchase_id,
      outcome_amount,
      outcome_currency,
      actually_paid,
      created_at,
      updated_at
    } = req.body;

    console.log(`🔔 IPN received for payment ${payment_id}: ${payment_status}`);

    // Update tip status in Firestore
    try {
      const tipRef = doc(db, 'tips', payment_id);
      const tipDoc = await getDoc(tipRef);

      if (!tipDoc.exists()) {
        console.error(`❌ Tip document not found: ${payment_id}`);
        return res.status(404).json({ error: 'Tip not found' });
      }

      const tipData = tipDoc.data();
      const creatorId = tipData.creatorId;

      // Update tip status
      await updateDoc(tipRef, {
        status: payment_status,
        actuallyPaid: actually_paid || pay_amount,
        outcomeAmount: outcome_amount,
        outcomeCurrency: outcome_currency,
        updatedAt: serverTimestamp(),
        // IPN tracking
        ipnReceivedAt: serverTimestamp(),
        ipnData: req.body
      });

      console.log(`✅ Tip status updated: ${payment_id} -> ${payment_status}`);

      // Handle different payment statuses
      switch (payment_status) {
        case 'finished':
        case 'confirmed':
          await handleSuccessfulTip(creatorId, tipData, actually_paid || pay_amount, pay_currency);
          break;
          
        case 'failed':
        case 'expired':
          await handleFailedTip(creatorId, tipData);
          break;
          
        case 'refunded':
          await handleRefundedTip(creatorId, tipData, actually_paid || pay_amount, pay_currency);
          break;
          
        default:
          console.log(`ℹ️ Payment status ${payment_status} - no action needed`);
      }

      // Respond to NowPayments
      res.status(200).json({ 
        success: true,
        payment_id,
        status: payment_status,
        processed_at: new Date().toISOString()
      });

    } catch (firestoreError) {
      console.error('❌ Firestore error processing IPN:', firestoreError);
      res.status(500).json({ error: 'Database error' });
    }

  } catch (error) {
    console.error('❌ Error in IPN webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Handle successful tip completion
async function handleSuccessfulTip(creatorId, tipData, actuallyPaid, currency) {
  try {
    console.log(`🎉 Processing successful tip for creator ${creatorId}: ${actuallyPaid} ${currency}`);
    
    // Update creator earnings
    const creatorRef = doc(db, 'creators', creatorId);
    const creatorDoc = await getDoc(creatorRef);
    
    if (creatorDoc.exists()) {
      await updateDoc(creatorRef, {
        'earnings.totalTips': increment(1),
        'earnings.totalTipAmount': increment(parseFloat(actuallyPaid)),
        'earnings.lastTipAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Creator earnings updated for ${creatorId}`);
    } else {
      // Create creator earnings record
      await updateDoc(creatorRef, {
        earnings: {
          totalTips: 1,
          totalTipAmount: parseFloat(actuallyPaid),
          lastTipAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Creator earnings record created for ${creatorId}`);
    }

    // Create notification for creator (optional)
    await createTipNotification(creatorId, tipData, actuallyPaid, currency);
    
  } catch (error) {
    console.error('❌ Error handling successful tip:', error);
  }
}

// Handle failed tip
async function handleFailedTip(creatorId, tipData) {
  console.log(`❌ Tip failed for creator ${creatorId}: ${tipData.paymentId}`);
  
  // Could implement retry logic or notifications here
  // For now, just log the failure
}

// Handle refunded tip
async function handleRefundedTip(creatorId, tipData, refundAmount, currency) {
  try {
    console.log(`↩️ Processing tip refund for creator ${creatorId}: ${refundAmount} ${currency}`);
    
    // Update creator earnings (subtract the refunded amount)
    const creatorRef = doc(db, 'creators', creatorId);
    await updateDoc(creatorRef, {
      'earnings.totalTips': increment(-1),
      'earnings.totalTipAmount': increment(-parseFloat(refundAmount)),
      'earnings.lastRefundAt': serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Creator earnings updated for refund: ${creatorId}`);
    
  } catch (error) {
    console.error('❌ Error handling refunded tip:', error);
  }
}

// Create notification for successful tip
async function createTipNotification(creatorId, tipData, amount, currency) {
  try {
    const notificationRef = doc(db, 'notifications', `tip_${tipData.paymentId}`);
    
    await updateDoc(notificationRef, {
      type: 'tip_received',
      creatorId,
      title: '🎉 New Tip Received!',
      message: `You received ${amount} ${currency.toUpperCase()} from ${tipData.tipperName || 'Anonymous'}${tipData.message ? `: "${tipData.message}"` : ''}`,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      tipperName: tipData.tipperName,
      tipMessage: tipData.message,
      createdAt: serverTimestamp(),
      read: false
    });
    
    console.log(`✅ Notification created for tip: ${tipData.paymentId}`);
    
  } catch (error) {
    console.error('❌ Error creating tip notification:', error);
  }
}