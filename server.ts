import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

export interface ServerLeaderboardEntry {
  id: string;
  playerName: string;
  playerNameDv: string;
  atollTag: string;
  mode: 'daily' | 'campaign';
  levelId: string;
  dateKey: string;
  score: number;
  timeSeconds: number;
  wordsFound: number;
  hintsUsed: number;
  streak: number;
  timestamp: number;
}

function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createInitialSeedEntries(): ServerLeaderboardEntry[] {
  const today = getTodayDateKey();
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      playerName: 'Aishath Nizma',
      playerNameDv: 'ޢާއިޝަތު ނިޒްމާ',
      atollTag: 'ސ. އައްޑޫ (S. Addu)',
      mode: 'daily',
      levelId: `daily-${today}`,
      dateKey: today,
      score: 1840,
      timeSeconds: 42,
      wordsFound: 6,
      hintsUsed: 0,
      streak: 14,
      timestamp: now - 3600 * 1000 * 3,
    },
    {
      id: 'seed-2',
      playerName: 'Ibrahim Zayan',
      playerNameDv: 'އިބްރާހީމް ޒަޔާން',
      atollTag: 'ކ. މާލެ (K. Malé)',
      mode: 'daily',
      levelId: `daily-${today}`,
      dateKey: today,
      score: 1710,
      timeSeconds: 51,
      wordsFound: 6,
      hintsUsed: 0,
      streak: 9,
      timestamp: now - 3600 * 1000 * 5,
    },
    {
      id: 'seed-3',
      playerName: 'Mariyam Shifana',
      playerNameDv: 'މަރިޔަމް ޝިފާނާ',
      atollTag: 'ބ. އޭދަފުށި (B. Eydhafushi)',
      mode: 'daily',
      levelId: `daily-${today}`,
      dateKey: today,
      score: 1625,
      timeSeconds: 58,
      wordsFound: 6,
      hintsUsed: 0,
      streak: 21,
      timestamp: now - 3600 * 1000 * 2,
    },
    {
      id: 'seed-4',
      playerName: 'Hassan Raaidh',
      playerNameDv: 'ޙަސަން ރާއިދު',
      atollTag: 'ޏ. ފުވައްމުލައް (Gn. Fuvahmulah)',
      mode: 'daily',
      levelId: `daily-${today}`,
      dateKey: today,
      score: 1540,
      timeSeconds: 67,
      wordsFound: 6,
      hintsUsed: 1,
      streak: 7,
      timestamp: now - 3600 * 1000 * 6,
    },
    {
      id: 'seed-5',
      playerName: 'Fathimath Leena',
      playerNameDv: 'ފާޠިމަތު ލީނާ',
      atollTag: 'ހދ. ކުޅުދުއްފުށި (HDh. Kulhudhuffushi)',
      mode: 'daily',
      levelId: `daily-${today}`,
      dateKey: today,
      score: 1460,
      timeSeconds: 74,
      wordsFound: 6,
      hintsUsed: 0,
      streak: 12,
      timestamp: now - 3600 * 1000 * 4,
    },
    {
      id: 'seed-6',
      playerName: 'Mohamed Jinan',
      playerNameDv: 'މުޙައްމަދު ޖިނާން',
      atollTag: 'ގދ. ތިނަދޫ (GDh. Thinadhoo)',
      mode: 'daily',
      levelId: `daily-${today}`,
      dateKey: today,
      score: 1380,
      timeSeconds: 83,
      wordsFound: 6,
      hintsUsed: 1,
      streak: 5,
      timestamp: now - 3600 * 1000 * 7,
    },
    {
      id: 'seed-7',
      playerName: 'AliHaisham',
      playerNameDv: 'ޢަލީ ހައިޝަމް',
      atollTag: 'ޅ. ނައިފަރު (Lh. Naifaru)',
      mode: 'campaign',
      levelId: 'classic-ref',
      dateKey: today,
      score: 2120,
      timeSeconds: 36,
      wordsFound: 6,
      hintsUsed: 0,
      streak: 18,
      timestamp: now - 3600 * 1000 * 8,
    },
    {
      id: 'seed-8',
      playerName: 'Hawwa Yumna',
      playerNameDv: 'ޙައްވާ ޔުމްނާ',
      atollTag: 'ލ. ގަން (L. Gan)',
      mode: 'daily',
      levelId: `daily-${today}`,
      dateKey: today,
      score: 1295,
      timeSeconds: 92,
      wordsFound: 6,
      hintsUsed: 2,
      streak: 4,
      timestamp: now - 3600 * 1000 * 9,
    },
  ];
}

function loadLeaderboard(): ServerLeaderboardEntry[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADERBOARD_FILE)) {
      const initial = createInitialSeedEntries();
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as ServerLeaderboardEntry[];
    const today = getTodayDateKey();
    // Ensure today's daily board always has active competitive entries
    const hasTodaySeeds = parsed.some((e) => e.dateKey === today && e.id.startsWith('seed-'));
    if (!hasTodaySeeds) {
      const seeds = createInitialSeedEntries();
      const merged = [...parsed.filter((e) => !e.id.startsWith('seed-')), ...seeds];
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(merged, null, 2), 'utf-8');
      return merged;
    }
    return parsed;
  } catch {
    return createInitialSeedEntries();
  }
}

function saveLeaderboard(entries: ServerLeaderboardEntry[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist leaderboard:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/leaderboard', (req, res) => {
    const dateKey = (req.query.dateKey as string) || getTodayDateKey();
    const allEntries = loadLeaderboard();

    const dailyEntries = allEntries
      .filter((e) => e.mode === 'daily' && e.dateKey === dateKey)
      .sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds)
      .slice(0, 50);

    const allTimeEntries = [...allEntries]
      .sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds)
      .slice(0, 50);

    // Deduplicate streak leaders by playerName
    const streakMap = new Map<string, ServerLeaderboardEntry>();
    for (const entry of allEntries) {
      const existing = streakMap.get(entry.playerName);
      if (!existing || entry.streak > existing.streak || (entry.streak === existing.streak && entry.score > existing.score)) {
        streakMap.set(entry.playerName, entry);
      }
    }
    const streakEntries = Array.from(streakMap.values())
      .sort((a, b) => b.streak - a.streak || b.score - a.score)
      .slice(0, 50);

    res.json({
      dateKey,
      daily: dailyEntries,
      allTime: allTimeEntries,
      streaks: streakEntries,
      serverTimestamp: Date.now(),
    });
  });

  app.post('/api/leaderboard/submit', (req, res) => {
    const body = req.body;
    const incomingList: ServerLeaderboardEntry[] = Array.isArray(body?.entries)
      ? body.entries
      : body?.entry
      ? [body.entry]
      : [];

    if (incomingList.length === 0) {
      res.status(400).json({ error: 'No score entries provided' });
      return;
    }

    const current = loadLeaderboard();
    const byId = new Map<string, ServerLeaderboardEntry>();
    for (const item of current) {
      byId.set(item.id, item);
    }

    const syncedIds: string[] = [];
    for (const rawEntry of incomingList) {
      if (!rawEntry || !rawEntry.id || typeof rawEntry.score !== 'number') continue;
      const sanitized: ServerLeaderboardEntry = {
        id: String(rawEntry.id).slice(0, 64),
        playerName: String(rawEntry.playerName || 'Player').slice(0, 40),
        playerNameDv: String(rawEntry.playerNameDv || rawEntry.playerName || 'ކުޅުންތެރިޔާ').slice(0, 50),
        atollTag: String(rawEntry.atollTag || 'ކ. މާލެ (K. Malé)').slice(0, 50),
        mode: rawEntry.mode === 'campaign' ? 'campaign' : 'daily',
        levelId: String(rawEntry.levelId || 'daily').slice(0, 50),
        dateKey: String(rawEntry.dateKey || getTodayDateKey()).slice(0, 16),
        score: Math.max(0, Math.min(25000, Math.round(rawEntry.score))),
        timeSeconds: Math.max(1, Math.min(7200, Math.round(rawEntry.timeSeconds || 60))),
        wordsFound: Math.max(1, Math.min(30, Math.round(rawEntry.wordsFound || 5))),
        hintsUsed: Math.max(0, Math.min(50, Math.round(rawEntry.hintsUsed || 0))),
        streak: Math.max(1, Math.min(3650, Math.round(rawEntry.streak || 1))),
        timestamp: Number(rawEntry.timestamp) || Date.now(),
      };
      byId.set(sanitized.id, sanitized);
      syncedIds.push(sanitized.id);
    }

    const updated = Array.from(byId.values());
    saveLeaderboard(updated);

    const today = getTodayDateKey();
    const dailyEntries = updated
      .filter((e) => e.mode === 'daily' && e.dateKey === today)
      .sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds);

    res.json({
      ok: true,
      syncedIds,
      dailyCount: dailyEntries.length,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BasHoadha server listening on http://localhost:${PORT}`);
  });
}

startServer();
