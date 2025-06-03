import { describe, it, expect, vi, beforeEach } from 'vitest';
// Removed static import: import { POST } from './route';
import { NextRequest } from 'next/server'; // Needed for creating mock request

// Define a type for the mock database object used here
type MockDb = {
  insert: ReturnType<typeof vi.fn>;
  values: ReturnType<typeof vi.fn>;
  returning: ReturnType<typeof vi.fn>;
};

// Declare mockDb variable
let mockDb: MockDb;

// Mock the schema structure used in the route and tests
const mockedSchema = {
    gameResults: {
      id: 'gameResults.id',
      username: 'gameResults.username',
      score: 'gameResults.score',
      completionTimeMs: 'gameResults.completionTimeMs',
    }
};

// Use vi.doMock - this is NOT hoisted
vi.doMock('../../../lib/drizzle', () => {
  // Initialize mockDb INSIDE the factory function
  mockDb = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(), // This will be configured in each test
  };
  return {
    db: mockDb,
    schema: mockedSchema, // Use the defined mock schema
  };
});

describe('API Route: /api/submit-score', async () => {
  // Dynamically import the POST handler AFTER mocks are set up
  const { POST } = await import('./route');

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Reset the specific mock implementation for returning
    if (mockDb && mockDb.returning) {
        mockDb.returning.mockReset();
    } else {
      console.error("mockDb not initialized in beforeEach for submit-score test");
    }
  });

  it('should submit score successfully with valid data', async () => {
    // Arrange: Mock data and request
    const mockRequestBody = { username: 'TestUser', score: 150, time: 12345 };
    const mockReturnedId = { id: 99 };
    mockDb.returning.mockResolvedValue([mockReturnedId]); // Mock successful insert returning ID

    // Create a mock Request object
    const request = new NextRequest('http://localhost/api/submit-score', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: { 'Content-Type': 'application/json' },
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const body = await response.json();

    // Assert: Check if the db methods were called correctly
    expect(mockDb.insert).toHaveBeenCalledWith(mockedSchema.gameResults);
    expect(mockDb.values).toHaveBeenCalledWith({
      username: mockRequestBody.username,
      score: mockRequestBody.score,
      completionTimeMs: mockRequestBody.time,
    });
    expect(mockDb.returning).toHaveBeenCalledWith({ id: mockedSchema.gameResults.id });

    // Assert: Check the response status and body
    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      message: 'Score submitted successfully.',
      id: mockReturnedId.id,
    });
  });

  it('should return 400 for missing username', async () => {
    // Arrange
    const mockRequestBody = { score: 150, time: 12345 }; // Missing username
    const request = new NextRequest('http://localhost/api/submit-score', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid username provided.' });
    expect(mockDb.insert).not.toHaveBeenCalled(); // Ensure DB was not called
  });

  it('should return 400 for invalid score type', async () => {
    // Arrange
    const mockRequestBody = { username: 'TestUser', score: 'not-a-number', time: 12345 };
    const request = new NextRequest('http://localhost/api/submit-score', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid score provided.' });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

   it('should return 400 for invalid time type', async () => {
    // Arrange
    const mockRequestBody = { username: 'TestUser', score: 150, time: 'not-a-time' };
    const request = new NextRequest('http://localhost/api/submit-score', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid time provided.' });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('should return 500 if database insert fails', async () => {
    // Arrange
    const mockRequestBody = { username: 'TestUser', score: 150, time: 12345 };
    const errorMessage = 'Database insert failed';
    mockDb.returning.mockRejectedValue(new Error(errorMessage)); // Mock insert failure

    const request = new NextRequest('http://localhost/api/submit-score', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: 'Failed to submit score.',
      details: errorMessage,
    });
    expect(mockDb.insert).toHaveBeenCalled(); // Ensure DB insert was attempted
    expect(mockDb.values).toHaveBeenCalled();
    expect(mockDb.returning).toHaveBeenCalled();
  });

   it('should return 500 if insert result is empty or lacks ID', async () => {
    // Arrange
    const mockRequestBody = { username: 'TestUser', score: 150, time: 12345 };
    // Mock cases where insert returns unexpected result
    mockDb.returning.mockResolvedValue([]); // Empty array
    // mockDb.returning.mockResolvedValue([{ /* no id */ }]); // Object without id - uncomment to test this case

    const request = new NextRequest('http://localhost/api/submit-score', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
        headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to save score data.' });
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalled();
    expect(mockDb.returning).toHaveBeenCalled();
  });

});