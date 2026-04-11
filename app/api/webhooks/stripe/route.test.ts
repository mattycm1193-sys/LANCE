import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create firestore mock functions we can inspect
const mockSet = vi.fn();
const mockUpdate = vi.fn();
const mockCommit = vi.fn();
const mockWhere = vi.fn();

vi.mock('../../_lib/firebaseAdmin', () => {
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
  class StripeMock {
    webhooks = {
      constructEvent: mockConstructEvent,
    };
  }
  return {
    default: StripeMock,
  };
});

import { POST } from './route';
import { db } from '../../_lib/firebaseAdmin';

describe('Stripe Webhook Route Handler', () => {
  let req: Request;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(body: string, sig: string | null): Request {
    const headers = new Headers();
    if (sig) headers.set('stripe-signature', sig);
    return new Request('https://example.com/api/webhooks/stripe', {
      method: 'POST',
      headers,
      body,
    });
  }

  it('should return 400 if stripe-signature is missing', async () => {
    req = createMockRequest('mock-raw-body', null);
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toBe('Missing stripe-signature header');
  });

  it('should handle checkout.session.completed', async () => {
    req = createMockRequest('mock-raw-body', 'mock-sig');

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

    const res = await POST(req);

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(mockSet).toHaveBeenCalledWith(
      {
        stripeCustomerId: 'cus_456',
        subscriptionStatus: 'active',
        planType: 'pro',
      },
      { merge: true }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ received: true });
  });

  it('should handle customer.subscription.updated', async () => {
    req = createMockRequest('mock-raw-body', 'mock-sig');

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

    const res = await POST(req);

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(mockWhere).toHaveBeenCalledWith('stripeCustomerId', '==', 'cus_456');
    expect(mockUpdate).toHaveBeenCalledWith('doc_ref_1', {
      subscriptionStatus: 'canceled',
    });
    expect(mockCommit).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ received: true });
  });

  it('should handle invoice.payment_failed', async () => {
    req = createMockRequest('mock-raw-body', 'mock-sig');

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

    const res = await POST(req);

    expect(db.collection).toHaveBeenCalledWith('users');
    expect(mockWhere).toHaveBeenCalledWith('stripeCustomerId', '==', 'cus_456');
    expect(mockUpdate).toHaveBeenCalledWith('doc_ref_1', {
      subscriptionStatus: 'past_due',
    });
    expect(mockCommit).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ received: true });
  });

  it('should gracefully handle webhook verification errors', async () => {
    req = createMockRequest('mock-raw-body', 'mock-sig');

    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.text()).toBe('Webhook Error: Invalid signature');
  });
});
