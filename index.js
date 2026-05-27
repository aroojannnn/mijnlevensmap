const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Hiermee kan Render style.css uit de hoofdmap laden
app.use(express.static(__dirname));

function sendHtml(res, fileName) {
  const filePath = path.join(__dirname, fileName);
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

app.get('/', (req, res) => {
  sendHtml(res, 'home.html');
});

app.get('/over-ons', (req, res) => {
  sendHtml(res, 'over-ons.html');
});

app.get('/hoe-werkt-het', (req, res) => {
  sendHtml(res, 'hoe-werkt-het.html');
});

app.get('/veelgestelde-vragen', (req, res) => {
  sendHtml(res, 'veelgestelde-vragen.html');
});

app.get('/privacy', (req, res) => {
  sendHtml(res, 'privacy.html');
});

app.get('/login', (req, res) => {
  sendHtml(res, 'login.html');
});

app.get('/dashboard', (req, res) => {
  sendHtml(res, 'dashboard.html');
});

app.get('/contact', (req, res) => {
  sendHtml(res, 'contact.html');
});

app.get('/api/status', (req, res) => {
  res.json({
    message: 'Nalatenschap.nl API werkt',
    status: 'Server draait',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log('Server draait op http://localhost:' + PORT);
});
