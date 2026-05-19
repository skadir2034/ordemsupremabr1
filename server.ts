import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import crypto, { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

export const app = express();
const PORT = 3000;

// Initialize Neon client
// We check if DATABASE_URL is present, otherwise we provide a fallback message
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

app.use(express.json());

// --- Database Initialization Helper ---
async function initDb() {
  if (!sql) {
    console.warn("DATABASE_URL not found. Database features will be disabled.");
    return;
  }

  try {
    console.log("Initializing database tables...");
    
    // Create Clans table
    await sql`
      CREATE TABLE IF NOT EXISTS clans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tag TEXT,
        display_id TEXT,
        level INTEGER DEFAULT 1,
        description TEXT,
        capacity INTEGER DEFAULT 50,
        owner_id TEXT,
        trophy_count INTEGER DEFAULT 0,
        logo_url TEXT,
        guide_image_post1 TEXT
      )
    `;
    console.log("Clans table checked");

    // Create Members table
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'warrior',
        trophies INTEGER DEFAULT 0,
        donations INTEGER DEFAULT 0,
        hero_power INTEGER DEFAULT 0,
        diamonds INTEGER DEFAULT 0,
        boxes INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        completed_missions JSONB DEFAULT '[]',
        visited_missions_board BOOLEAN DEFAULT FALSE,
        last_daily_bonus TEXT,
        status TEXT DEFAULT 'offline',
        avatar_url TEXT,
        joined_at TEXT,
        premium_pass BOOLEAN DEFAULT FALSE,
        app_theme TEXT DEFAULT 'dark',
        chat_theme TEXT DEFAULT 'dark',
        clan_id TEXT,
        update_reward_claimed BOOLEAN DEFAULT FALSE,
        last_celebrated_level INTEGER DEFAULT 0
      )
    `;
    console.log("Members table checked");

    // Create Theft Reports table
    await sql`
      CREATE TABLE IF NOT EXISTS theft_reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT,
        reporter_name TEXT,
        timestamp TEXT,
        clan_id TEXT
      )
    `;
    console.log("Theft reports table checked");

    // Insert default clan if it doesn't exist
    await sql`
      INSERT INTO clans (id, name, tag, display_id, description)
      VALUES ('main-clan', 'Ordem Suprema', 'OS', 'ORDEM_SUPREMA', 'Clã oficial da Ordem Suprema')
      ON CONFLICT (id) DO NOTHING
    `;

    // Migration: Add columns and constraints missing from older versions
    try {
      console.log("Running migrations...");
      // Check column existence for members.clan_id
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS clan_id TEXT`;
      await sql`ALTER TABLE theft_reports ADD COLUMN IF NOT EXISTS clan_id TEXT`;
      
      // Auth migrations
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT UNIQUE`;
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT`;
      
      // Update reward claimed column
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS update_reward_claimed BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS last_celebrated_level INTEGER DEFAULT 0`;
      
      console.log("Migrations completed successfully");
    } catch (e: any) {
      console.warn("Migration warning:", e.message);
    }

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

// --- API Routes ---

// Health check
app.get("/api/health", async (req, res) => {
  if (!sql) return res.status(503).json({ status: "error", message: "Database not configured" });
  try {
    await sql`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

// Get Clan Data
app.get("/api/clan/:id", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  try {
    const clans = await sql`SELECT * FROM clans WHERE id = ${req.params.id}`;
    if (clans.length === 0) return res.status(404).json({ error: "Clan not found" });
    
    // Convert snake_case to camelCase for frontend
    const clan = clans[0];
    res.json({
      id: clan.id,
      name: clan.name,
      tag: clan.tag,
      displayId: clan.display_id,
      level: clan.level,
      description: clan.description,
      capacity: clan.capacity,
      ownerId: clan.owner_id,
      trophyCount: clan.trophy_count,
      logoUrl: clan.logo_url,
      guideImagePost1: clan.guide_image_post1
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clan" });
  }
});

// Update Clan
app.patch("/api/clan/:id", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { logoUrl, guideImagePost1 } = req.body;
  try {
    if (logoUrl !== undefined) {
      await sql`UPDATE clans SET logo_url = ${logoUrl} WHERE id = ${req.params.id}`;
    }
    if (guideImagePost1 !== undefined) {
      await sql`UPDATE clans SET guide_image_post1 = ${guideImagePost1} WHERE id = ${req.params.id}`;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update clan" });
  }
});

// Get Members
app.get("/api/clan/:clanId/members", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  try {
    const members = await sql`SELECT * FROM members WHERE clan_id = ${req.params.clanId} ORDER BY role ASC, trophies DESC`;
    res.json(members.map(m => ({
      id: m.id,
      userId: m.user_id,
      name: m.name,
      role: m.role,
      trophies: m.trophies,
      donations: m.donations,
      heroPower: m.hero_power,
      diamonds: m.diamonds,
      boxes: m.boxes,
      coins: m.coins,
      xp: m.xp,
      level: m.level,
      completedMissions: m.completed_missions,
      visitedMissionsBoard: m.visited_missions_board,
      lastDailyBonus: m.last_daily_bonus,
      status: m.status,
      avatarUrl: m.avatar_url,
      joinedAt: m.joined_at,
      premiumPass: m.premium_pass,
      appTheme: m.app_theme,
      chatTheme: m.chat_theme,
      updateRewardClaimed: m.update_reward_claimed,
      lastCelebratedLevel: m.last_celebrated_level
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// Authentication: Check if Nickname exists
app.get("/api/auth/check-nick/:nickname", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { nickname } = req.params;
  try {
    const results = await sql`SELECT user_id FROM members WHERE LOWER(user_id) = LOWER(${nickname})`;
    res.json({ exists: results.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to check nickname" });
  }
});

// Authentication: Register Complete (Nick + Email + PW)
app.post("/api/auth/register", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    // Check if nickname exists (case-insensitive)
    const nickExists = await sql`SELECT id FROM members WHERE LOWER(user_id) = LOWER(${nickname})`;
    if (nickExists.length > 0) {
       return res.status(400).json({ error: "Nickname already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newId = randomUUID();
    const joinedAt = new Date().toISOString();
    const isLeader = email.toLowerCase().includes('ryankevyn') || nickname.toLowerCase().includes('ryankevyn') || nickname.toLowerCase() === 'skadir';
    const role = isLeader ? 'leader' : 'warrior';

    await sql`
      INSERT INTO members (id, user_id, name, email, password_hash, role, clan_id, joined_at)
      VALUES (${newId}, ${nickname}, ${nickname}, ${email}, ${passwordHash}, ${role}, 'main-clan', ${joinedAt})
    `;

    res.json({
      userId: nickname,
      name: nickname,
      role: role,
      email: email,
      id: newId
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Authentication: Login (Nickname + Password)
app.post("/api/auth/login", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: "Nickname and password required" });
  }

  try {
    const results = await sql`
      SELECT id, user_id, password_hash, name, role, email 
      FROM members 
      WHERE LOWER(user_id) = LOWER(${nickname})
    `;

    if (results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      userId: user.user_id,
      name: user.name,
      role: user.role,
      email: user.email,
      id: user.id
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Update Member
app.patch("/api/members/:userId", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { userId } = req.params;
  const updates = req.body;
  
  try {
    // Map camelCase to snake_case for Postgres
    const mapping: Record<string, string> = {
      name: 'name',
      role: 'role',
      trophies: 'trophies',
      donations: 'donations',
      heroPower: 'hero_power',
      diamonds: 'diamonds',
      boxes: 'boxes',
      coins: 'coins',
      xp: 'xp',
      level: 'level',
      completedMissions: 'completed_missions',
      visitedMissionsBoard: 'visited_missions_board',
      lastDailyBonus: 'last_daily_bonus',
      status: 'status',
      avatarUrl: 'avatar_url',
      joinedAt: 'joined_at',
      premiumPass: 'premium_pass',
      appTheme: 'app_theme',
      chatTheme: 'chat_theme',
      updateRewardClaimed: 'update_reward_claimed',
      lastCelebratedLevel: 'last_celebrated_level'
    };

    const setClauses = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (mapping[key]) {
        setClauses.push(`${mapping[key]} = $${i}`);
        values.push(value);
        i++;
      }
    }

    if (setClauses.length === 0) return res.json({ success: true });

    values.push(userId);
    const query = `UPDATE members SET ${setClauses.join(', ')} WHERE user_id = $${i}`;
    
    // Neon client doesn't support parameterized strings like this easily in basic form, 
    // so we use the sql helper if possible or a more robust way.
    // For @neondatabase/serverless 'neon' helper, it expects static strings or backticks.
    // We'll use a transaction or simple multi-step for safety here.
    
    // Use explicit updates for each allowed field to avoid dynamic column issues with Neon 'sql' helper
    for (const [key, value] of Object.entries(updates)) {
      if (mapping[key]) {
        const col = mapping[key];
        try {
          if (col === 'name') await sql`UPDATE members SET name = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'role') await sql`UPDATE members SET role = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'trophies') await sql`UPDATE members SET trophies = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'donations') await sql`UPDATE members SET donations = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'hero_power') await sql`UPDATE members SET hero_power = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'diamonds') await sql`UPDATE members SET diamonds = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'boxes') await sql`UPDATE members SET boxes = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'coins') await sql`UPDATE members SET coins = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'xp') await sql`UPDATE members SET xp = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'level') await sql`UPDATE members SET level = ${value as number} WHERE user_id = ${userId}`;
          if (col === 'completed_missions') await sql`UPDATE members SET completed_missions = ${value as any} WHERE user_id = ${userId}`;
          if (col === 'visited_missions_board') await sql`UPDATE members SET visited_missions_board = ${value as boolean} WHERE user_id = ${userId}`;
          if (col === 'last_daily_bonus') await sql`UPDATE members SET last_daily_bonus = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'status') await sql`UPDATE members SET status = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'avatar_url') await sql`UPDATE members SET avatar_url = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'joined_at') await sql`UPDATE members SET joined_at = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'premium_pass') await sql`UPDATE members SET premium_pass = ${value as boolean} WHERE user_id = ${userId}`;
          if (col === 'app_theme') await sql`UPDATE members SET app_theme = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'chat_theme') await sql`UPDATE members SET chat_theme = ${value as string} WHERE user_id = ${userId}`;
          if (col === 'update_reward_claimed') await sql`UPDATE members SET update_reward_claimed = ${value as boolean} WHERE user_id = ${userId}`;
          if (col === 'last_celebrated_level') await sql`UPDATE members SET last_celebrated_level = ${value as number} WHERE user_id = ${userId}`;
        } catch (updateErr) {
          console.error(`Failed to update ${col}:`, updateErr);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete Member
app.delete("/api/members/:userId", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  try {
    await sql`DELETE FROM members WHERE user_id = ${req.params.userId}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// Theft Reports
app.get("/api/clan/:clanId/reports", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  try {
    const reports = await sql`SELECT * FROM theft_reports WHERE clan_id = ${req.params.clanId} ORDER BY timestamp DESC`;
    res.json(reports.map(r => ({
      id: r.id,
      reporterId: r.reporter_id,
      reporterName: r.reporter_name,
      timestamp: r.timestamp
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

app.post("/api/clan/:clanId/reports", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { reporterId, reporterName } = req.body;
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  try {
    await sql`
      INSERT INTO theft_reports (id, reporter_id, reporter_name, timestamp, clan_id)
      VALUES (${id}, ${reporterId}, ${reporterName}, ${timestamp}, ${req.params.clanId})
    `;
    res.json({ id, timestamp });
  } catch (err) {
    res.status(500).json({ error: "Failed to create report" });
  }
});

app.delete("/api/reports/:id", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  try {
    await sql`DELETE FROM theft_reports WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// API Catch-all (Must be before Vite/Static)
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API Route not found: ${req.method} ${req.url}` });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message || "An unexpected error occurred",
    severity: err.severity || 'ERROR'
  });
});

// --- Vite Production / Development setup ---

async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Only start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV === 'production') {
  startServer();
}

export default app;
