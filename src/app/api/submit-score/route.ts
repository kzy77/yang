export const runtime = 'edge';
// src/app/api/submit-score/route.ts
import { NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg';

// Reuse the pool configuration logic, ensure DATABASE_URL is set
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Basic input validation (can be expanded)
interface SubmitScorePayload {
  username?: string;
  score?: number;
  time?: number; // Expecting time in milliseconds from frontend
}

export async function POST(request: Request) {
  console.log('API route /api/submit-score called');
  let client: PoolClient | null = null;

  if (!connectionString) {
    return NextResponse.json({ error: 'Database connection is not configured.' }, { status: 500 });
  }

  try {
    const payload: SubmitScorePayload = await request.json();
    const { username, score, time } = payload;

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid username provided.' }, { status: 400 });
    }
    if (score === undefined || typeof score !== 'number' || !Number.isInteger(score)) {
      return NextResponse.json({ error: 'Invalid score provided.' }, { status: 400 });
    }
    if (time === undefined || typeof time !== 'number' || !Number.isInteger(time) || time < 0) {
      return NextResponse.json({ error: 'Invalid time provided.' }, { status: 400 });
    }

    // Limit username length (optional but recommended)
    const trimmedUsername = username.trim().substring(0, 255); // Max length based on schema

    client = await pool.connect();
    console.log('Database client connected for submit');

    const query = `
      INSERT INTO game_results (username, score, completion_time_ms)
      VALUES ($1, $2, $3)
      RETURNING id; -- Optional: return the ID of the new record
    `;
    const values = [trimmedUsername, score, time];

    console.log('Executing insert query:', query, values);
    const result = await client.query(query, values);
    console.log('Insert successful, new record ID:', result.rows[0]?.id);

    return NextResponse.json({ success: true, message: 'Score submitted successfully.', id: result.rows[0]?.id });

  } catch (error) {
    console.error('Error submitting score:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     let status = 500;
     let errorType = 'Failed to submit score.';
     // Add specific error checks if needed
     if (errorMessage.includes('connect ECONNREFUSED') || errorMessage.includes('password authentication failed')) {
         errorType = 'Database connection error.';
     } else if (errorMessage.includes('violates not-null constraint')) {
         errorType = 'Missing required data field.';
         status = 400;
     }

    return NextResponse.json(
      { error: errorType, details: errorMessage },
      { status: status }
    );
  } finally {
    if (client) {
      client.release();
      console.log('Database client released after submit');
    }
  }
}

// Pool error handling (reuse from ranking route or centralize)
pool.on('error', (err: Error, client: PoolClient) => {
  console.error('Unexpected error on idle client', err);
});