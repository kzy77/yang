export const runtime = 'edge'; // Keep edge runtime
// src/app/api/submit-score/route.ts
import { NextResponse } from 'next/server';
// Import the factory function and schema
import { createDbClient, schema } from '../../../lib/drizzle';

// Basic input validation interface (remains the same)
interface SubmitScorePayload {
  username?: string;
  score?: number;
  time?: number; // Expecting time in milliseconds from frontend
}

export async function POST(request: Request) {
  console.log('API route /api/submit-score called');

  try {
    // Create the db client instance inside the handler
    // Similar to the ranking route, this relies on env vars being available
    const db = createDbClient();

    const payload: SubmitScorePayload = await request.json();
    const { username, score, time } = payload;

    // Validate input (remains the same)
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid username provided.' }, { status: 400 });
    }
    if (score === undefined || typeof score !== 'number' || !Number.isInteger(score)) {
      return NextResponse.json({ error: 'Invalid score provided.' }, { status: 400 });
    }
    if (time === undefined || typeof time !== 'number' || !Number.isInteger(time) || time < 0) {
      return NextResponse.json({ error: 'Invalid time provided.' }, { status: 400 });
    }

    // Limit username length (remains the same)
    const trimmedUsername = username.trim().substring(0, 255); // Max length based on schema

    console.log('Submitting score using Drizzle ORM...');
    console.log(`Executing insert with params: ${trimmedUsername}, ${score}, ${time}`);

    // Use Drizzle insert
    const result = await db.insert(schema.gameResults).values({
      username: trimmedUsername,
      score: score,
      completionTimeMs: time, // Ensure this matches the column name in schema.ts
    }).returning({ id: schema.gameResults.id }); // Return the ID of the new record

    // Check if insert was successful and get the ID
    if (!result || result.length === 0 || !result[0]?.id) {
        console.error('Insert failed or did not return an ID.');
        return NextResponse.json({ error: 'Failed to save score data.' }, { status: 500 });
    }

    const newId = result[0].id;
    console.log('Insert successful via Drizzle, new record ID:', newId);

    return NextResponse.json({ success: true, message: 'Score submitted successfully.', id: newId });

  } catch (error) {
    console.error('Error submitting score via Drizzle:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     let status = 500;
     let errorType = 'Failed to submit score.';
     // Add check for the configuration error from createDbClient
     if (errorMessage.includes('Required database configuration')) {
         errorType = 'Database configuration error.';
         console.error("Database configuration missing (HYPERDRIVE or DATABASE_URL)");
     } else if (errorMessage.includes('connect') || errorMessage.includes('authentication failed') || errorMessage.includes('failed to connect')) {
         errorType = 'Database connection error.';
     } else if (errorMessage.includes('violates not-null constraint')) {
         errorType = 'Missing required data field.';
         status = 400;
     } else if (errorMessage.includes('relation "game_results" does not exist')) {
         errorType = 'Database table "game_results" not found.';
     } else if (errorMessage.includes('value too long for type character varying')) {
         errorType = 'Username is too long.';
         status = 400;
     }

    return NextResponse.json(
      { error: errorType, details: errorMessage },
      { status: status }
    );
  }
}