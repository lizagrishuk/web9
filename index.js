const express = require('express');
const app = express();

app.get('/login', (req, res) => {
  res.send('lizagrishuk');
});

app.get('/id/:n', async (req, res) => {
  const n = req.params.n;
  try {
    const response = await fetch(`https://nd.kodaktor.ru/users/${n}`, {
      method: 'GET'
    });
    const data = await response.json();
    res.send(data.login);
  } catch (e) {
    res.status(500).send('error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
