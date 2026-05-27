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
app.use(express.static('public'));

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'home.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
app.get('/over-ons', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'over-ons.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
app.get('/veelgestelde-vragen', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'veelgestelde-vragen.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
app.get('/privacy', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'privacy.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
app.get('/hoe-werkt-het', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'hoe-werkt-het.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
app.get('/login', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'login.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
app.get('/dashboard', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'dashboard.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});
app.get('/contact', (req, res) => {
  const filePath = path.join(__dirname, 'views', 'contact.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
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