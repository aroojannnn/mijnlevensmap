require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Sessie instellen
app.use(session({
  secret: process.env.SESSION_SECRET || "nalatenschap-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Views map
const viewsPath = path.join(__dirname, "views");

// MongoDB verbinden
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Geen MongoDB URI gevonden in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("MongoDB verbonden!"))
  .catch((error) => {
    console.error("MongoDB verbindingsfout:", error.message);
    process.exit(1);
  });

// Middleware: controleer of gebruiker is ingelogd
function requireLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.redirect("/login");
}

// Publieke pagina routes
app.get("/", (req, res) => {
  res.sendFile(path.join(viewsPath, "home.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(viewsPath, "contact.html"));
});

app.get("/over-ons", (req, res) => {
  res.sendFile(path.join(viewsPath, "over-ons.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(viewsPath, "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(viewsPath, "login.html"));
});

app.get("/hoe-werkt-het", (req, res) => {
  res.sendFile(path.join(viewsPath, "hoe-werkt-het.html"));
});

app.get("/veelgestelde-vragen", (req, res) => {
  res.sendFile(path.join(viewsPath, "veelgestelde-vragen.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(viewsPath, "privacy.html"));
});

app.get("/voorwaarden", (req, res) => {
  res.sendFile(path.join(viewsPath, "voorwaarden.html"));
});

// Beveiligde pagina routes (alleen voor ingelogde gebruikers)
app.get("/dashboard", requireLogin, (req, res) => {
  res.sendFile(path.join(viewsPath, "dashboard.html"));
});

app.get("/persoonlijke-gegevens", requireLogin, (req, res) => {
  res.sendFile(path.join(viewsPath, "persoonlijke-gegevens.html"));
});

// Status route
app.get("/status", (req, res) => {
  const states = {
    0: "Niet verbonden",
    1: "Verbonden",
    2: "Verbinden...",
    3: "Verbinding verbreken...",
  };
  res.json({
    server: "Online",
    database: states[mongoose.connection.readyState] || "Onbekend",
    readyState: mongoose.connection.readyState,
  });
});

// Registratie verwerken
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).send(`
        <h1>Registratie mislukt</h1>
        <p>Vul alle velden in.</p>
        <a href="/register">Terug naar registreren</a>
      `);
    }

    if (password.length < 8) {
      return res.status(400).send(`
        <h1>Registratie mislukt</h1>
        <p>Het wachtwoord moet minimaal 8 tekens bevatten.</p>
        <a href="/register">Terug naar registreren</a>
      `);
    }

    if (password !== confirmPassword) {
      return res.status(400).send(`
        <h1>Registratie mislukt</h1>
        <p>De wachtwoorden komen niet overeen.</p>
        <a href="/register">Terug naar registreren</a>
      `);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).send(`
        <h1>Account bestaat al</h1>
        <p>Er bestaat al een account met dit e-mailadres.</p>
        <a href="/register">Terug naar registreren</a>
      `);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    await newUser.save();
    return res.redirect("/login");
  } catch (error) {
    console.error("Registratiefout:", error);
    return res.status(500).send(`
      <h1>Serverfout</h1>
      <p>Er ging iets mis bij het registreren.</p>
      <pre>${error.message}</pre>
      <a href="/register">Probeer opnieuw</a>
    `);
  }
});

// Login verwerken
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).send(`
        <h1>Inloggen mislukt</h1>
        <p>Vul e-mail en wachtwoord in.</p>
        <a href="/login">Terug naar inloggen</a>
      `);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).send(`
        <h1>Inloggen mislukt</h1>
        <p>Onjuiste e-mail of wachtwoord.</p>
        <a href="/login">Terug naar inloggen</a>
      `);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).send(`
        <h1>Inloggen mislukt</h1>
        <p>Onjuiste e-mail of wachtwoord.</p>
        <a href="/login">Terug naar inloggen</a>
      `);
    }

    req.session.userId = user._id;
    req.session.userName = user.name;

    return res.redirect("/dashboard");
  } catch (error) {
    console.error("Loginfout:", error);
    return res.status(500).send(`
      <h1>Serverfout</h1>
      <p>Er ging iets mis bij het inloggen.</p>
      <pre>${error.message}</pre>
      <a href="/login">Probeer opnieuw</a>
    `);
  }
});

// Uitloggen
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send(`
    <h1>Pagina niet gevonden</h1>
    <p>De pagina die u zoekt bestaat niet.</p>
    <a href="/">Terug naar home</a>
  `);
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});