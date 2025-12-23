const express = require('express');
const router = express.Router();
const { getMedicinesFromPharmacy } = require('../services/pharmacyClient');

router.get('/medicines', async (req, res) => {
  try {
    const data = await getMedicinesFromPharmacy();
    res.json(data.medicines);
  } catch (error) {
    res.status(500).json({ message: 'Failed fetch pharmacy data' });
  }
});

module.exports = router;
