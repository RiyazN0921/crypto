const express = require('express');
const app = express();
const axios = require('axios');
const { Client } = require('pg');
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/prices', (req, res) => {
    
    res.send('Price information will be displayed here.');
});


const client = new Client({
  user: 'Riyaz',
  host: 'localhost',
  database: 'crypto_data',
  password: 'Riyazn@0921',
  port: 5432,
});
client.connect();


async function fetchDataAndStore() {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    
    const top10 = Object.keys(data).slice(0, 10);

    for (const symbol of top10) {
      const currencyData = data[symbol];
      const { name, last, buy, sell, volume, base_unit } = currencyData;

      const query = `
        INSERT INTO cryptocurrencies (name, last, buy, sell, volume, base_unit)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO NOTHING;
      `;

      await Client.query(query, [name, last, buy, sell, volume, base_unit]);
    }

    console.log('Data stored successfully.');
  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}


fetchDataAndStore();


app.get('/cryptoData', async (req, res) => {
  try {
    const query = 'SELECT * FROM cryptocurrencies';
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving data from database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
