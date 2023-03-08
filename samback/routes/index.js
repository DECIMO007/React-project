

const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();


const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const db = pgp('postgres://postgres:8943@localhost:5432/ProjectSix');

router.get('/', (req, res) => {
  res.send('Money Converter API');
});

router.post('/money-converter', async (req, res) => {
  try {
    const { value, currency1, currency2 } = req.body;
    let convertedValue;
    
    if (currency1 === 'INR' && currency2 === 'USD') {
      convertedValue = value / 82; // assuming 1 INR = 82 USD
    } else if (currency1 === 'USD' && currency2 === 'INR') {
      convertedValue = value * 82; // assuming 1 INR = 82 USD
    } else {
      return res.status(400).send('Invalid currency selection');
    }
    
    await db.none('INSERT INTO conversions (value1, currency1, currency2, value2) VALUES ($1, $2, $3, $4)', [
      value,
      currency1,
      currency2,
      convertedValue.toFixed(2),
    ]);
    
    res.status(200).json({ convertedValue: convertedValue.toFixed(2) });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/money-converter', async (req, res) => {
  try {
    const conversions = await db.any('SELECT * FROM conversions ORDER BY id DESC LIMIT 10');
    res.status(200).json(conversions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


module.exports = router;