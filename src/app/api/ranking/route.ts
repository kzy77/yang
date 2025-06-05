export const runtime = 'edge';
// src/app/api/ranking/route.ts
import { NextResponse } from 'next/server';
// Import the factory function and schema
import { createDbClient, schema } from '../../../lib/drizzle';
import { asc, desc } from 'drizzle-orm'; // Import ordering functions

// Define the expected shape of a row returned by the query
// Adjust createdAt to string to match driver's return type
type RankingRow = {
    id: number;
    username: string | null;
    score: number | null;
    completionTimeMs: number | null;
    createdAt: string | null; // Changed from Date | null to string | null
};

export async function GET() {
  console.log('API route /api/ranking called');

  try {
    // Create the db client instance
    const db = createDbClient();
    console.log('Fetching ranking using Drizzle ORM...');

    const resultRows = await db.select({
        id: schema.gameResults.id,
        username: schema.gameResults.username,
        score: schema.gameResults.score,
        completionTimeMs: schema.gameResults.completionTimeMs,
        createdAt: schema.gameResults.createdAt,
      })
      .from(schema.gameResults)
      .orderBy(
        desc(schema.gameResults.score),
        asc(schema.gameResults.completionTimeMs)
      )
      .limit(10);

    console.log('Query successful via Drizzle, rows:', resultRows.length);

    // Map results, explicitly typing map parameters
    // The type error should now be resolved
    const rankings = resultRows.map((row: RankingRow, index: number) => ({
      rank: index + 1,
      username: row.username ?? 'Anonymous', // Provide default for null username
      score: row.score ?? 0, // Provide default for null score
      time: row.completionTimeMs ?? 0, // Provide default for null time
      // We don't need createdAt in the final ranking output, so no change needed here
    }));

    return NextResponse.json(rankings);

  } catch (error) {
    console.error('Error fetching ranking via Drizzle:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = 500;
    let errorType = 'Failed to fetch ranking data.';
    if (errorMessage.includes('connect') || errorMessage.includes('authentication failed') || errorMessage.includes('failed to connect')) {
        errorType = 'Database connection error.';
    } else if (errorMessage.includes('relation "game_results" does not exist')) {
        errorType = 'Database table "game_results" not found.';
    } else if (errorMessage.includes('Required database configuration')) {
        errorType = 'Database configuration error.'; // Catch the error from createDbClient
        console.error("Database configuration missing (HYPERDRIVE or DATABASE_URL)");
    }

    return NextResponse.json(
      { error: errorType, details: errorMessage },
      { status: status }
    );
  }
}