const axios = require('axios');

const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:4003/graphql';

/**
 * Fetch patient data from admin service
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object|null>} Patient data or null if not found
 */
async function getPatientById(patientId) {
  try {
    const query = `
      query {
        patient(id: "${patientId}") {
          id
          name
          age
          gender
          address
          phone
          disease
        }
      }
    `;

    const response = await axios.post(ADMIN_SERVICE_URL, {
      query: query
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      console.error('Error fetching patient:', response.data.errors);
      return null;
    }

    return response.data.data.patient;
  } catch (error) {
    console.error('Failed to fetch patient from admin service:', error.message);
    return null;
  }
}

/**
 * Fetch multiple patients from admin service
 * @param {Array<string>} patientIds - Array of patient IDs
 * @returns {Promise<Array<Object>>} Array of patient data
 */
async function getPatientsByIds(patientIds) {
  try {
    // Build query for multiple patients
    const queries = patientIds.map((id, index) => `
      patient${index}: patient(id: "${id}") {
        id
        name
        age
        gender
        address
        phone
        disease
      }
    `).join('\n');

    const query = `
      query {
        ${queries}
      }
    `;

    const response = await axios.post(ADMIN_SERVICE_URL, {
      query: query
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      console.error('Error fetching patients:', response.data.errors);
      return [];
    }

    // Convert object to array
    const patients = Object.values(response.data.data);
    return patients.filter(p => p !== null);
  } catch (error) {
    console.error('Failed to fetch patients from admin service:', error.message);
    return [];
  }
}

module.exports = {
  getPatientById,
  getPatientsByIds
};

