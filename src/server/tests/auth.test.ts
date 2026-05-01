import { describe, it, expect, vi } from 'vitest';
import { requireAuth } from '../middleware/auth.js';
import { auth as firebaseAuth } from '../services/firebase.js';

vi.mock('../services/firebase.js', () => ({
  auth: {
    verifyIdToken: vi.fn()
  }
}));

describe('Authentication Middleware', () => {
  it('should return 401 if no authorization header is provided', async () => {
    const req = { headers: {} } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    await requireAuth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized: No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if valid token is provided', async () => {
    const req = { headers: { authorization: 'Bearer valid_token' } } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const next = vi.fn();

    (firebaseAuth.verifyIdToken as any).mockResolvedValue({ uid: 'user123', email: 'test@test.com' });

    await requireAuth(req, res, next);

    expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith('valid_token');
    expect(req.user.uid).toBe('user123');
    expect(next).toHaveBeenCalled();
  });
});
