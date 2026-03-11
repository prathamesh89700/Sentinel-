import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("threat_intel.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS threat_actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    aliases TEXT,
    origin TEXT,
    motivation TEXT,
    techniques TEXT,
    target_industries TEXT,
    description TEXT,
    last_seen DATE
  );

  CREATE TABLE IF NOT EXISTS ioc_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'ip', 'domain', 'hash'
    value TEXT NOT NULL,
    risk_score INTEGER,
    threat_type TEXT,
    last_checked DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attack_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attack_type TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE
  );
`);

// Seed data if empty
const actorCount = db.prepare("SELECT COUNT(*) as count FROM threat_actors").get() as { count: number };
if (actorCount.count === 0) {
  const insertActor = db.prepare(`
    INSERT INTO threat_actors (name, aliases, origin, motivation, techniques, target_industries, description, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertActor.run("Lazarus Group", "Hidden Cobra, APT38", "North Korea", "Financial gain, Espionage", "Spear-phishing, Malware, Crypto-jacking", "Banking, Government, Crypto", "A sophisticated state-sponsored group known for high-profile financial attacks.", "2024-03-01");
  insertActor.run("Fancy Bear", "APT28, Sofacy", "Russia", "Espionage", "Zero-day exploits, Phishing", "Government, Military, Energy", "Highly active group targeting political and military organizations globally.", "2024-02-15");
  insertActor.run("Wizard Spider", "Conti, Ryuk", "Eastern Europe", "Financial gain", "Ransomware-as-a-Service", "Healthcare, Education, Corporate", "Criminal group behind major ransomware campaigns.", "2024-03-10");

  const insertTrend = db.prepare("INSERT INTO attack_trends (attack_type, count, date) VALUES (?, ?, ?)");
  const types = ["Ransomware", "Phishing", "Malware", "DDoS", "Credential Stuffing"];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    types.forEach(type => {
      insertTrend.run(type, Math.floor(Math.random() * 50) + 10, dateStr);
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/actors", (req, res) => {
    const actors = db.prepare("SELECT * FROM threat_actors ORDER BY last_seen DESC").all();
    res.json(actors);
  });

  app.get("/api/trends", (req, res) => {
    const trends = db.prepare(`
      SELECT attack_type, SUM(count) as total 
      FROM attack_trends 
      GROUP BY attack_type
    `).all();
    res.json(trends);
  });

  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM ioc_history ORDER BY last_checked DESC LIMIT 10").all();
    res.json(history);
  });

  app.post("/api/analyze", async (req, res) => {
    const { type, value } = req.body;
    
    // In a real app, we'd call VirusTotal or AbuseIPDB here.
    // For this project, we'll simulate the response but provide the structure for real calls.
    
    let riskScore = Math.floor(Math.random() * 100);
    let threatType = "Clean";
    
    if (riskScore > 70) threatType = "Malicious";
    else if (riskScore > 30) threatType = "Suspicious";

    // Save to history
    db.prepare("INSERT INTO ioc_history (type, value, risk_score, threat_type) VALUES (?, ?, ?, ?)")
      .run(type, value, riskScore, threatType);

    res.json({
      value,
      type,
      riskScore,
      threatType,
      details: `Analysis completed for ${value}. Found ${riskScore}% risk matching known ${threatType.toLowerCase()} patterns.`,
      sources: ["VirusTotal (Simulated)", "AbuseIPDB (Simulated)"]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
