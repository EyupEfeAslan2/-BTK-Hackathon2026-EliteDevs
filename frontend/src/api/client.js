import axios from 'axios';

const API_BASE_URL = "https://btk-hackathon2026-elitedevs.onrender.com/"

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
