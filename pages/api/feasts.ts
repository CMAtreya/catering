/**
 * NOTE: This file is a Next.js-style API route stub.
 * This project uses Vite + React (not Next.js), so this file is never executed
 * in development. It is kept here for reference or future migration only.
 * All feast persistence in this SPA uses localStorage (see src/api/feastApi.ts).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

interface Feast {
  id: string;
  name: string;
  description: string;
  tag: string;
  itemIds: string[];
}

// Path to the JSON file that stores feasts in the project repository
const FEASTS_FILE = path.join(process.cwd(), 'src', 'data', 'feasts.json');

/** Helper to read the JSON file (creates if missing) */
async function readFeasts(): Promise<Feast[]> {
  try {
    const data = await fs.readFile(FEASTS_FILE, 'utf-8');
    return JSON.parse(data) as Feast[];
  } catch {
    return [];
  }
}

/** Helper to write the JSON file */
async function writeFeasts(feasts: Feast[]): Promise<void> {
  await fs.writeFile(FEASTS_FILE, JSON.stringify(feasts, null, 2), 'utf-8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method?.toUpperCase();
  const feasts = await readFeasts();

  switch (method) {
    case 'GET': {
      res.status(200).json(feasts);
      break;
    }
    case 'POST': {
      const newFeast: Feast = req.body;
      if (!newFeast || !newFeast.id) {
        res.status(400).json({ error: 'Invalid feast payload' });
        return;
      }
      if (feasts.some((f) => f.id === newFeast.id)) {
        res.status(409).json({ error: 'Feast with this id already exists' });
        return;
      }
      feasts.push(newFeast);
      await writeFeasts(feasts);
      res.status(201).json(newFeast);
      break;
    }
    case 'PUT': {
      const updated: Feast = req.body;
      if (!updated || !updated.id) {
        res.status(400).json({ error: 'Invalid feast payload' });
        return;
      }
      const index = feasts.findIndex((f) => f.id === updated.id);
      if (index === -1) {
        res.status(404).json({ error: 'Feast not found' });
        return;
      }
      feasts[index] = updated;
      await writeFeasts(feasts);
      res.status(200).json(updated);
      break;
    }
    case 'DELETE': {
      const { id } = req.query;
      if (typeof id !== 'string') {
        res.status(400).json({ error: 'Missing feast id' });
        return;
      }
      const filtered = feasts.filter((f) => f.id !== id);
      if (filtered.length === feasts.length) {
        res.status(404).json({ error: 'Feast not found' });
        return;
      }
      await writeFeasts(filtered);
      res.status(204).end();
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
