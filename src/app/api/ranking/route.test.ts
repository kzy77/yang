import { describe, it, expect, vi, beforeEach } from 'vitest';
// Removed static import: import { GET } from './route';

// Define a type for the mock database object
type MockDb = {
  select: ReturnType<typeof vi.fn>;
  from: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
};

// Declare mockDb variable - it will be initialized within vi.doMock's factory
let mockDb: MockDb;

// Mock the schema structure used in the route and tests
const mockedSchema = {
    gameResults: {
      id: 'gameResults.id',
      username: 'gameResults.username',
      score: 'gameResults.score',
      completionTimeMs: 'gameResults.completionTimeMs',
      createdAt: 'gameResults.createdAt',
    }
};

// Use vi.doMock - this is NOT hoisted
vi.doMock('../../../lib/drizzle', () => {
  // Initialize mockDb INSIDE the factory function
  mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn(), // This will be configured in each test
  };
  return {
    db: mockDb,
    schema: mockedSchema, // Use the defined mock schema
    asc: vi.fn((col) => `ASC(${col})`), // Mock implementation for asc
    desc: vi.fn((col) => `DESC(${col})`), // Mock implementation for desc
  };
});

describe('API Route: /api/ranking', async () => {
  // Dynamically import the GET handler AFTER mocks are set up
  const { GET } = await import('./route');

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Reset the specific mock implementation for limit
    // Ensure mockDb is defined before accessing its properties
    if (mockDb && mockDb.limit) {
        mockDb.limit.mockReset();
    } else {
      // This case might happen if vi.doMock didn't run as expected, add a log or error
      console.error("mockDb not initialized in beforeEach for ranking test");
    }
  });

  it('should return top 10 rankings on successful fetch', async () => {
    // Arrange: Mock data returned by the database query
    const mockData = [
      { id: 1, username: 'Player1', score: 100, completionTimeMs: 5000, createdAt: new Date() },
      { id: 2, username: 'Player2', score: 90, completionTimeMs: 6000, createdAt: new Date() },
    ];
    // Configure the final step of the mock chain to resolve with mockData
    mockDb.limit.mockResolvedValue(mockData);

    // Act: Call the GET handler
    const response = await GET();
    const body = await response.json();

    // Assert: Check if the db methods were called correctly
    expect(mockDb.select).toHaveBeenCalledWith({
      id: mockedSchema.gameResults.id,
      username: mockedSchema.gameResults.username,
      score: mockedSchema.gameResults.score,
      completionTimeMs: mockedSchema.gameResults.completionTimeMs,
      createdAt: mockedSchema.gameResults.createdAt,
    });
    expect(mockDb.from).toHaveBeenCalledWith(mockedSchema.gameResults);
    // Use expect.any(String) because asc/desc mocks return strings
    expect(mockDb.orderBy).toHaveBeenCalledWith(
        expect.anything(), // Match the Drizzle SQL object for desc
        expect.anything()  // Match the Drizzle SQL object for asc
    );
    expect(mockDb.limit).toHaveBeenCalledWith(10);

    // Assert: Check the response status and body
    expect(response.status).toBe(200);
    expect(body).toEqual([
      { rank: 1, username: 'Player1', score: 100, time: 5000 },
      { rank: 2, username: 'Player2', score: 90, time: 6000 },
    ]);
  });

  it('should return 500 error if database query fails', async () => {
    // Arrange: Configure the mock to reject with an error
    const errorMessage = 'Database query failed';
    mockDb.limit.mockRejectedValue(new Error(errorMessage));

    // Act: Call the GET handler
    const response = await GET();
    const body = await response.json();

    // Assert: Check the response status and error message
    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: 'Failed to fetch ranking data.',
      details: errorMessage,
    });
    // Ensure db methods were still called up to the point of failure
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalled();
    expect(mockDb.orderBy).toHaveBeenCalled();
    expect(mockDb.limit).toHaveBeenCalledWith(10);
  });
});