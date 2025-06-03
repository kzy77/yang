export const runtime = 'edge';
// src/app/api/ranking/route.ts
import { NextResponse } from 'next/server';
// Removed: import { neon } from '@neondatabase/serverless';
import { db, schema } from '../../../lib/drizzle'; // Import Drizzle db and schema
import { asc, desc } from 'drizzle-orm'; // Import ordering functions

// Removed GameResultRow interface, Drizzle infers types

// Removed connectionString logic and check

export async function GET() {
  console.log('API route /api/ranking called');

  // Removed connectionString check

  try {
    console.log('Fetching ranking using Drizzle ORM...');

    // Replace neon tagged template with Drizzle select query
    const resultRows = await db.select({
        // Select specific columns, renaming completion_time_ms if needed by schema
        id: schema.gameResults.id, // Include id if needed later, otherwise optional
        username: schema.gameResults.username,
        score: schema.gameResults.score,
        completionTimeMs: schema.gameResults.completionTimeMs, // Use the name defined in schema.ts
        createdAt: schema.gameResults.createdAt, // Include if needed
      })
      .from(schema.gameResults)
      .orderBy(
        desc(schema.gameResults.score), // Order by score descending
        asc(schema.gameResults.completionTimeMs) // Then by time ascending
      )
      .limit(10); // Limit to top 10 results

    console.log('Query successful via Drizzle, rows:', resultRows.length);

    // Map results to the desired format (remains similar)
    const rankings = resultRows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
      time: row.completionTimeMs, // Use the selected column name
    }));

    return NextResponse.json(rankings);

  } catch (error) {
    console.error('Error fetching ranking via Drizzle:', error);
    // Keep existing error handling structure
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