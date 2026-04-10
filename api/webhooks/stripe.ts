import { Request, Response } from 'express';
import * as Stripe from 'stripe';
import { db } from '../_lib/firebaseAdmin';

const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-02-24.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let rawBody: string;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error('Error getting raw body', err);
    return res.status(400).send('Error getting raw body');
  }

  const sig = req.headers['stripe-signature'];

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const uid = session.client_reference_id;
        const stripeCustomerId = session.customer as string;

        if (uid) {
          await db.collection('users').doc(uid).set(
            {
              stripeCustomerId,
              subscriptionStatus: 'active',
              planType: 'pro',
            },
            { merge: true }
          );
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const stripeCustomerId = subscription.customer as string;
        const status = subscription.status;

        const snapshot = await db.collection('users').where('stripeCustomerId', '==', stripeCustomerId).get();
        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.forEach((doc) => {
            batch.update(doc.ref, {
              subscriptionStatus: status,
            });
          });
          await batch.commit();
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const stripeCustomerId = invoice.customer as string;

        const snapshot = await db.collection('users').where('stripeCustomerId', '==', stripeCustomerId).get();
        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.forEach((doc) => {
            batch.update(doc.ref, {
              subscriptionStatus: 'past_due',
            });
          });
          await batch.commit();
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function getRawBody(req: Request): Promise<string> {
  if (typeof req.body === 'string') {
    return req.body;
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString('utf8');
  }

  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', err => {
      reject(err);
    });
  });
}
