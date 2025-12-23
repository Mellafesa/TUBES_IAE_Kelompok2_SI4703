const axios = require('axios');

const PHARMACY_SERVICE_URL =
  process.env.PHARMACY_SERVICE_URL || 'http://localhost:4004/graphql';

async function getMedicines() {
  const query = `
    query {
      medicines {
        id
        name
        stock
      }
    }
  `;

  try {
    const response = await axios.post(PHARMACY_SERVICE_URL, { query });
    return response.data.data.medicines;
  } catch (error) {
    console.error('Error fetching medicines from pharmacy:', error.message);
    return [];
  }
}

module.exports = {
  getMedicines
};
