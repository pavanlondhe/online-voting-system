import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('MahaVote API Suite', () => {
  let voterAccessToken = '';
  let activeElectionId = '';

  it('GET /api/health should return HEALTHY status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.mode).toBe('EDUCATIONAL_DEMO');
  });

  it('POST /api/auth/login should authenticate demo voter', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'voter1@mahavote.demo',
        password: 'Voter@12345',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('VOTER');
    expect(res.body.data.accessToken).toBeDefined();

    voterAccessToken = res.body.data.accessToken;
  });

  it('POST /api/auth/login should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'voter1@mahavote.demo',
        password: 'WrongPassword!123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/otp/request should generate demo OTP challenge', async () => {
    const res = await request(app)
      .post('/api/auth/otp/request')
      .send({
        identifier: '9876543210',
        purpose: 'LOGIN',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.simulatorOtp).toBeDefined();
    expect(res.body.data.simulatorOtp.length).toBe(6);
  });

  it('GET /api/elections should list demo elections', async () => {
    const res = await request(app).get('/api/elections');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);

    const activeElection = res.body.data.find((e: any) => e.status === 'ACTIVE');
    expect(activeElection).toBeDefined();
    activeElectionId = activeElection.id;
  });

  it('GET /api/ballot/election/:electionId should retrieve ballot for eligible voter', async () => {
    const res = await request(app)
      .get(`/api/ballot/election/${activeElectionId}`)
      .set('Authorization', `Bearer ${voterAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.candidates.length).toBeGreaterThan(0);
    expect(res.body.data.notaOption).toBeDefined();
  });

  it('POST /api/ballot/vote should cast privacy-preserving vote and return receipt', async () => {
    const res = await request(app)
      .post('/api/ballot/vote')
      .set('Authorization', `Bearer ${voterAccessToken}`)
      .send({
        electionId: activeElectionId,
        isNota: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.receiptNumber).toMatch(/^MV-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(res.body.data.verificationHash).toBeDefined();
    // Candidate choice must NOT be revealed in the receipt
    expect(res.body.data.candidateId).toBeUndefined();

    // Verify receipt endpoint
    const verifyRes = await request(app)
      .get(`/api/ballot/receipt/verify/${res.body.data.receiptNumber}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.verified).toBe(true);
  });

  it('POST /api/ballot/vote should block duplicate vote attempt with 409', async () => {
    const res = await request(app)
      .post('/api/ballot/vote')
      .set('Authorization', `Bearer ${voterAccessToken}`)
      .send({
        electionId: activeElectionId,
        isNota: true,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
