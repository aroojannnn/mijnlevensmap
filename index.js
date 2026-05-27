require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Views map
const viewsPath = path.join(__dirname, "views");

// MongoDB URI
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Geen MongoDB URI gevonden in .env");
  console.error("Gebruik MONGODB_URI=... of MONGO_URI=...");
  process.exit(1);
}

// Database verbinden
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB verbonden!");
  })
  .catch((error) => {
    console.error("MongoDB verbindingsfout:", error.message);
    process.exit(1);
  });

// Pagina routes
app.get("/", (req, res) => {
  res.sendFile(path.join(viewsPath, "home.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(viewsPath, "contact.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(viewsPath, "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(viewsPath, "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(viewsPath, "dashboard.html"));
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

// Status route om database te checken
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
    console.log("REGISTER BODY:", req.body);

    const body = req.body || {};
    const name = body.name;
    const email = body.email;
    const password = body.password;
    const confirmPassword = body.confirmPassword;

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
    console.log("LOGIN BODY:", req.body);

    const body = req.body || {};
    const email = body.email;
    const password = body.password;

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