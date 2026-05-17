import axios from 'axios';

const API_BASE_URL = "https://btk-hackathon2026-elitedevs.onrender.com/"

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  delayMs: 300, // Minimum delay between requests in milliseconds
};

let lastRequestTime = 0;
let requestCount = 0;
let windowStart = Date.now();

const checkRateLimit = () => {
  const now = Date.now();
  
  // Reset window if time has passed
  if (now - windowStart > RATE_LIMIT.windowMs) {
    windowStart = now;
    requestCount = 0;
    console.log('🔄 Rate limit window reset');
  }
  
  // Check if exceeded max requests
  if (requestCount >= RATE_LIMIT.maxRequests) {
    const timeUntilReset = RATE_LIMIT.windowMs - (now - windowStart);
    const errorMsg = `Rate limit exceeded. Please wait ${Math.ceil(timeUntilReset / 1000)} seconds.`;
    console.error('⛔ ' + errorMsg);
    throw new Error(errorMsg);
  }
  
  // Check minimum delay between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT.delayMs) {
    const delayNeeded = RATE_LIMIT.delayMs - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${delayNeeded}ms`);
    return new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
};

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for rate limiting
client.interceptors.request.use(async (config) => {
  await checkRateLimit();
  lastRequestTime = Date.now();
  requestCount++;
  const windowTimeLeft = RATE_LIMIT.windowMs - (Date.now() - windowStart);
  console.log(`📊 Rate Limit Status: ${requestCount}/${RATE_LIMIT.maxRequests} requests | Window resets in ${Math.ceil(windowTimeLeft / 1000)}s`);
  return config;
});

// Error interceptor for better error handling
client.interceptors.response.use(
  response => response,
  error => {
    if (error.message && error.message.includes('Rate limit')) {
      console.error('🚫 Rate limit error caught:', error.message);
    }
    return Promise.reject(error);
  }
);

// Test function to verify rate limiting
export const testRateLimit = async () => {
  console.log('🧪 Starting Rate Limit Test...');
  console.log(`Max Requests: ${RATE_LIMIT.maxRequests}, Window: ${RATE_LIMIT.windowMs}ms, Delay: ${RATE_LIMIT.delayMs}ms`);
  
  try {
    // Try to make 15 rapid health check requests to trigger rate limit
    for (let i = 1; i <= 15; i++) {
      try {
        console.log(`\n📡 Test Request #${i}...`);
        const response = await client.get('/health');
        console.log(`✅ Request #${i} succeeded`);
      } catch (err) {
        console.error(`❌ Request #${i} failed: ${err.message}`);
        if (err.message.includes('Rate limit')) {
          console.log('🎯 Rate limit working correctly!');
          return { success: true, message: `Rate limit triggered at request #${i}` };
        }
      }
    }
    
    console.log('✨ Test completed');
    return { success: false, message: 'Rate limit not triggered (check settings)' };
  } catch (error) {
    console.error('Test error:', error);
    return { success: false, message: error.message };
  }
};

// Credit Lending API - New endpoint
export const assessCredit = async (applicantData) => {
  try {
    const response = await client.post('/api/assess-credit', applicantData);
    return response.data;
  } catch (error) {
    console.error('Kredi değerlendirmesi hatası:', error);
    throw error;
  }
};

// Keep legacy function for backwards compatibility if needed
export const analyzeStocks = async (symbols, period = '1y', useCrew = false) => {
  try {
    const response = await client.post('/api/analyze', {
      symbols: Array.isArray(symbols) ? symbols : [symbols],
      period,
      use_crew: useCrew,
    });
    return response.data;
  } catch (error) {
    console.error('Analiz hatası:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await client.get('/health');
    return response.data;
  } catch (error) {
    console.error('Sağlık kontrolü hatası:', error);
    throw error;
  }
};

export default client;
