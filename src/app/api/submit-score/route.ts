export const runtime = 'edge'; // Changed from 'nodejs'
// src/app/api/submit-score/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless'; // ONLY import neon

// Removed pg Pool initialization

// Basic input validation (can be expanded)
interface SubmitScorePayload {
  username?: string;
  score?: number;
  time?: number; // Expecting time in milliseconds from frontend
}

// Reuse the connection string logic, ensure DATABASE_URL is set
const connectionString = process.env.DATABASE_URL;

export async function POST(request: Request) {
  console.log('API route /api/submit-score called');
  // Removed client variable declaration

  if (!connectionString) {
    return NextResponse.json({ error: 'Database connection is not configured.' }, { status: 500 });
  }

  try {
    const payload: SubmitScorePayload = await request.json();
    const { username, score, time } = payload;

    // Validate input (kept existing validation)
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid username provided.' }, { status: 400 });
    }
    if (score === undefined || typeof score !== 'number' || !Number.isInteger(score)) {
      return NextResponse.json({ error: 'Invalid score provided.' }, { status: 400 });
    }
    if (time === undefined || typeof time !== 'number' || !Number.isInteger(time) || time < 0) {
      return NextResponse.json({ error: 'Invalid time provided.' }, { status: 400 });
    }

    // Limit username length (kept existing logic)
    const trimmedUsername = username.trim().substring(0, 255); // Max length based on schema

    // Removed pool.connect()
    console.log('Connecting to database via Neon serverless driver for submit...');

    // Execute query using neon function directly as a tagged template
    // Parameters are embedded using ${} syntax
    console.log(`Executing insert query with params: ${trimmedUsername}, ${score}, ${time}`);
    const result = await neon(connectionString)`
      INSERT INTO game_results (username, score, completion_time_ms)
      VALUES (${trimmedUsername}, ${score}, ${time})
      RETURNING id; -- Optional: return the ID of the new record
    ` as [{ id: number }]; // Asserting the expected return type

    const newId = result[0]?.id;
    console.log('Insert successful, new record ID:', newId);

    return NextResponse.json({ success: true, message: 'Score submitted successfully.', id: newId });

  } catch (error) {
    console.error('Error submitting score:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     let status = 500;
     let errorType = 'Failed to submit score.';
     // Add specific error checks if needed (kept existing checks)
     if (errorMessage.includes('connect') || errorMessage.includes('authentication failed') || errorMessage.includes('failed to connect')) {
         errorType = 'Database connection error.';
     } else if (errorMessage.includes('violates not-null constraint')) {
         errorType = 'Missing required data field.';
         status = 400;
     } else if (errorMessage.includes('relation "game_results" does not exist')) {
         errorType = 'Database table "game_results" not found.';
     }

    return NextResponse.json(
      { error: errorType, details: errorMessage },
      { status: status }
    );
  }
  // Removed finally block with client.release()
}

// Removed pool.on('error') handler