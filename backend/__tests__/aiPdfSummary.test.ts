import request from 'supertest';
import app from '../app';
import path from 'path';

describe('POST /api/ai/summarize-pdf', () => {
  it('should return a summary for a valid PDF', async () => {
    const pdfPath = path.join(__dirname, 'test_resume.pdf');
    const res = await request(app).post('/api/ai/summarize-pdf').attach('file', pdfPath);
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(typeof res.body.summary).toBe('string');
    expect(res.body.summary.length).toBeGreaterThan(0);
  });

  it('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/api/ai/summarize-pdf');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no file/i);
  });

  it('should return 400 for a non-PDF file', async () => {
    const txtPath = path.join(__dirname, 'test.txt');
    const res = await request(app).post('/api/ai/summarize-pdf').attach('file', txtPath);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/extract text/i);
  });
});
