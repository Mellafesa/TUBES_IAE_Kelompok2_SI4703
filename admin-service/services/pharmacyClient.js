const axios = require('axios');

const PHARMACY_SERVICE_URL =
  process.env.PHARMACY_SERVICE_URL || 'http://localhost:4004/graphql';

async function getMedicinesFromPharmacy() {
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

    if (response.data.errors) {
      console.error('Pharmacy GraphQL errors:', response.data.errors);
      return [];
    }

    return response.data.data.medicines;
  } catch (error) {
    console.error('Error contacting pharmacy service:', error.message);
    return [];
  }
}

module.exports = {
  getMedicinesFromPharmacy
};
