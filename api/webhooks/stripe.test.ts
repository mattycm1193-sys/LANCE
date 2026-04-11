import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

// Create firestore mock functions we can inspect
const mockSet = vi.fn();
const mockUpdate = vi.fn();
const mockCommit = vi.fn();
const mockWhere = vi.fn();

vi.mock('../_lib/firebaseAdmin', () => {
  return {
    db: {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          set: mockSet,
        })),
        where: mockWhere,
      })),
      batch: vi.fn(() => ({
        update: mockUpdate,
        commit: mockCommit,
      })),
    },
  };
});

const mockConstructEvent = vi.fn();

vi.mock('stripe', () => {
  const Stripe = vi.fn();
  Stripe.prototype.webhooks = {
    constructEvent: (...args: any[]) => mockConstructEvent(...args),
  };
  return { default: Stripe };
});

import handler from './stripe';
import { db } from '../_lib/firebaseAdmin';

describe('Stripe Webhook Handler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      method: 'POST',
      headers: {
        'stripe-signature': 'mock-sig',
      },
      body: 'mock-raw-body',
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
      end: vi.fn(),
      setHeader: vi.fn(),
    };
  });

  it('should return 405 if method is not POST', async () => {
    req.method = 'GET';
    await handler(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.end).toHaveBeenCalledWith('Method Not Allowed');
  });

  it('should handle checkout.session.completed', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'user_123',
          customer: 'cus_456',
        },
      },
    };

    mockConstructEvent.mockReturnValueOnce(mockEvent);

    await handler(req as Request, res as Response);

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(mockSet).toHaveBeenCalledWith(
      {
        stripeCustomerId: 'cus_456',
        subscriptionStatus: 'active',
        planType: 'pro',
      },
      { merge: true }
    );
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('should handle customer.subscription.updated', async () => {
    const mockEvent = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          customer: 'cus_456',
          status: 'canceled',
        },
      },
    };

    mockConstructEvent.mockReturnValueOnce(mockEvent);

    const mockDocs = [{ ref: 'doc_ref_1' }];
    mockWhere.mockReturnValueOnce({
      get: vi.fn().mockResolvedValue({
        empty: false,
        forEach: (cb: any) => mockDocs.forEach(cb),
      }),
    });

    await handler(req as Request, res as Response);

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(mockWhere).toHaveBeenCalledWith('stripeCustomerId', '==', 'cus_456');
    expect(mockUpdate).toHaveBeenCalledWith('doc_ref_1', {
      subscriptionStatus: 'canceled',
    });
    expect(mockCommit).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('should handle invoice.payment_failed', async () => {
    const mockEvent = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          customer: 'cus_456',
        },
      },
    };

    mockConstructEvent.mockReturnValueOnce(mockEvent);

    const mockDocs = [{ ref: 'doc_ref_1' }];
    mockWhere.mockReturnValueOnce({
      get: vi.fn().mockResolvedValue({
        empty: false,
        forEach: (cb: any) => mockDocs.forEach(cb),
      }),
    });

    await handler(req as Request, res as Response);

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(mockWhere).toHaveBeenCalledWith('stripeCustomerId', '==', 'cus_456');
    expect(mockUpdate).toHaveBeenCalledWith('doc_ref_1', {
      subscriptionStatus: 'past_due',
    });
    expect(mockCommit).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });

  it('should gracefully handle webhook verification errors', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });

    await handler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Webhook Error: Invalid signature');
  });
});
