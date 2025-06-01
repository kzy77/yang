export const runtime = 'edge';
// src/app/api/ranking/route.ts
import { NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg'; // Import PoolClient

// Define an interface for the expected row structure from the query
interface GameResultRow {
  username: string;
  score: number;
  completion_time_ms: number;
}

// --- IMPORTANT: DATABASE CONNECTION ---
// The database connection string is expected to be in an environment variable.
// Create a file named `.env.local` in the root of your project (if it doesn't exist)
// and add your PostgreSQL connection string like this:
// DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/YOUR_DATABASE
//
// Make sure the `.env.local` file is included in your .gitignore file
// to avoid committing sensitive credentials.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
  // Optionally throw an error or return a specific response during development/build time
  // For runtime, the catch block below will handle connection errors.
}

const pool = new Pool({
  connectionString: connectionString,
  // Basic SSL handling for production environments (like Vercel Postgres, Neon, etc.)
  // Adjust based on your specific hosting provider's requirements.
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function GET() {
  console.log('API route /api/ranking called');
  let client: PoolClient | null = null;

  if (!connectionString) {
    // Return an error immediately if the connection string wasn't set
    return NextResponse.json(
      { error: 'Database connection is not configured.', details: 'DATABASE_URL environment variable is missing.' },
      { status: 500 }
    );
  }

  try {
    client = await pool.connect();
    console.log('Database client connected');

    const query = `
      SELECT
        username,
        score,
        completion_time_ms
      FROM game_results -- Make sure this table exists!
      ORDER BY
        score DESC,
        completion_time_ms ASC
      LIMIT 10;
    `;

    console.log('Executing query:', query);
    const result = await client.query<GameResultRow>(query);
    console.log('Query successful, rows:', result.rows.length);

    const rankings = result.rows.map((row: GameResultRow, index: number) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
      time: row.completion_time_ms,
    }));

    return NextResponse.json(rankings);

  } catch (error) {
    console.error('Error fetching ranking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Check for specific connection errors if needed
    let status = 500;
    let errorType = 'Failed to fetch ranking data.';
    if (errorMessage.includes('connect ECONNREFUSED') || errorMessage.includes('password authentication failed')) {
        errorType = 'Database connection error.';
    } else if (errorMessage.includes('relation "game_results" does not exist')) {
        errorType = 'Database table "game_results" not found.';
        // You might want to return a different status code or message here
    }

    return NextResponse.json(
      { error: errorType, details: errorMessage },
      { status: status }
    );
  } finally {
    if (client) {
      client.release();
      console.log('Database client released');
    }
  }
}

pool.on('error', (err: Error, client: PoolClient) => {
  console.error('Unexpected error on idle client', err);
});