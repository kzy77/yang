export const runtime = 'edge';
// src/app/api/ranking/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless'; // ONLY import neon

interface GameResultRow {
  username: string;
  score: number;
  completion_time_ms: number;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
}

// Removed query object definition

export async function GET() {
  console.log('API route /api/ranking called');

  if (!connectionString) {
    return NextResponse.json(
      { error: 'Database connection is not configured.', details: 'DATABASE_URL environment variable is missing.' },
      { status: 500 }
    );
  }

  try {
    console.log('Connecting to database via Neon serverless driver...');

    // Execute query using neon function directly as a tagged template
    // No parameters needed for this query
    console.log('Executing ranking query...');
    const resultRows = await neon(connectionString)`
      SELECT
        username,
        score,
        completion_time_ms
      FROM game_results
      ORDER BY
        score DESC,
        completion_time_ms ASC
      LIMIT 10;
    ` as GameResultRow[]; // Assert the result type

    console.log('Query successful, rows:', resultRows.length);

    const rankings = resultRows.map((row: GameResultRow, index: number) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
      time: row.completion_time_ms,
    }));

    return NextResponse.json(rankings);

  } catch (error) {
    console.error('Error fetching ranking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = 500;
    let errorType = 'Failed to fetch ranking data.';
    if (errorMessage.includes('connect') || errorMessage.includes('authentication failed') || errorMessage.includes('failed to connect')) {
        errorType = 'Database connection error.';
    } else if (errorMessage.includes('relation "game_results" does not exist')) {
        errorType = 'Database table "game_results" not found.';
    }

    return NextResponse.json(
      { error: errorType, details: errorMessage },
      { status: status }
    );
  }
}