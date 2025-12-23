import axios from 'axios';

export const pharmacyApi = axios.create({
  baseURL: 'http://localhost:4000'
});
