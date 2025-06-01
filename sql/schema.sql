-- Database schema for the ranking feature
-- File: sql/schema.sql

-- Drop table if it exists (optional, use with caution in production)
-- DROP TABLE IF EXISTS game_results;

-- Create the table to store game results
CREATE TABLE IF NOT EXISTS game_results (
    id SERIAL PRIMARY KEY,                      -- Auto-incrementing unique ID for each result
    username VARCHAR(255) NOT NULL,             -- Name of the user/player
    score INTEGER NOT NULL,                     -- Score achieved in the game
    completion_time_ms INTEGER NOT NULL,        -- Time taken to complete the game in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Timestamp when the result was recorded
);

-- Add an index to optimize queries for fetching rankings
-- Orders by score descending (higher is better) and then by time ascending (lower is better)
CREATE INDEX IF NOT EXISTS idx_ranking ON game_results (score DESC, completion_time_ms ASC);

-- Optional: Add comments on table and columns for clarity
COMMENT ON TABLE game_results IS 'Stores results of completed games for ranking.';
COMMENT ON COLUMN game_results.username IS 'Identifier for the player.';
COMMENT ON COLUMN game_results.score IS 'Final score achieved.';
COMMENT ON COLUMN game_results.completion_time_ms IS 'Total time spent in the game in milliseconds.';
COMMENT ON COLUMN game_results.created_at IS 'Timestamp when the game result was saved.';

-- You can execute this file using psql:
-- psql -U YOUR_USER -d YOUR_DATABASE -h YOUR_HOST -f sql/schema.sql