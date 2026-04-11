import Stripe from 'stripe';
import { db } from '../../_lib/firebaseAdmin';

// Do not initialize outside, so that it uses mock correctly in tests
let stripe: any;

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';

export async function POST(req: Request) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error('Error getting raw body', err);
    return new Response('Error getting raw body', { status: 400 });
  }

  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: any;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
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

    return Response.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook', error);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
