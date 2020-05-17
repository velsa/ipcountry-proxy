import supertest from 'supertest';
import app from './app';
import env from './env';

const request = supertest(app);

const TEST_REMOTE_IPS = [
  { addr: '185.184.246.157', country: 'Israel' },
  { addr: '61.221.48.1', country: 'Taiwan' },
  { addr: '195.2.27.103', country: 'Ireland' },
  { addr: '61.220.48.2', country: 'Taiwan' },
  { addr: '195.3.27.104', country: 'France' },
  { addr: '64.37.2.11', country: 'United States' },
];

const EXTRA_IP = '83.228.128.34';

describe('LAUNCH SERVER AND BASIC TEST', () => {
  it('should receive the help message', async (done) => {
    const res = await request.get('/');
    expect(res.status).toEqual(200);
    done();
  });
});
describe('TEST LOCALHOST', () => {
  it('should receive localhost', async (done) => {
    const res = await request.get('/getIPCountry');
    expect(res.status).toEqual(200);
    expect(res.body.ip).toEqual('127.0.0.1');
    expect(res.body.countryName).toEqual('Localhost');
    done();
  });
});
describe('TEST TWO VENDORS', () => {
  it('should receive from two vendors', async (done) => {
    for (let ip of TEST_REMOTE_IPS) {
      const res = await request
        .get('/getIPCountry')
        .set({ 'x-forwarded-for': ip.addr });
      expect(res.status).toEqual(200);
      expect(res.body.ip).toEqual(ip.addr);
      expect(res.body.countryName).toEqual(ip.country);
    }
    done();
  });
});
describe('GO OVER LIMIT', () => {
  it('should fail', async (done) => {
    const res = await request
      .get('/getIPCountry')
      .set({ 'x-forwarded-for': EXTRA_IP });
    expect(res.status).toEqual(500);
    done();
  });
});
describe('NAIVE CACHE', () => {
  it('should receive from cache', async (done) => {
    const ip = TEST_REMOTE_IPS[0];
    const res = await request
      .get('/getIPCountry')
      .set({ 'x-forwarded-for': ip.addr });
    expect(res.status).toEqual(200);
    expect(res.body.ip).toEqual(ip.addr);
    expect(res.body.countryName).toEqual(ip.country);
    expect(res.body.vendor).toEqual('cache');
    done();
  });
});
