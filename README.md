# Meeting Room Booking API

A REST API for managing meeting room reservations with user authentication and validation.

## Features

- Create, update, and cancel room bookings
- View bookings by room or user
- Overlap prevention and time validation
- User authentication via `x-user-id` header
- SuperUser capabilities
- Interactive API documentation (Swagger UI)
- API endpoints overview at root path

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### API Documentation

Visit `http://localhost:3000/` to see a list of all available API endpoints.

Access Swagger UI at: `http://localhost:3000/api-docs`

Swagger documentation includes:
- All endpoints with HTTP methods
- Request parameters and body schemas with examples
- Response schemas with examples
- Error response examples for each status code

## Testing

Run the test suite:

```bash
npm test
```

## API Usage

All requests must include the `x-user-id` header:

```
x-user-id: <userId>
```

### Authentication

- Regular users can only manage their own bookings
- **SuperUser** (`userId: "superuser"`) can manage any booking

**SuperUser Example:**
```bash
# SuperUser canceling someone else's booking
curl -X DELETE http://localhost:3000/api/bookings/{bookingId} \
  -H "x-user-id: superuser"
```

## Endpoints

### Create Booking

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "x-user-id: user1" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room1",
    "startTime": "2030-01-01T10:00:00.000Z",
    "endTime": "2030-01-01T12:00:00.000Z"
  }'
```

### Update Booking

```bash
curl -X PUT http://localhost:3000/api/bookings/{bookingId} \
  -H "x-user-id: user1" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2030-01-01T14:00:00.000Z",
    "endTime": "2030-01-01T16:00:00.000Z"
  }'
```

### Cancel Booking

```bash
curl -X DELETE http://localhost:3000/api/bookings/{bookingId} \
  -H "x-user-id: user1"
```

### List All Bookings

```bash
curl http://localhost:3000/api/bookings \
  -H "x-user-id: superuser"
```

**Returns:** All bookings in the system (only accessible by SuperUser)
**Note:** Results are sorted by `startTime` chronologically.

### Back-to-Back Bookings Example

```bash
# First booking: 10:00-12:00
curl -X POST http://localhost:3000/api/bookings \
  -H "x-user-id: user1" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room1",
    "startTime": "2030-01-01T10:00:00.000Z",
    "endTime": "2030-01-01T12:00:00.000Z"
  }'

# Back-to-back booking: 12:00-14:00 (allowed!)
curl -X POST http://localhost:3000/api/bookings \
  -H "x-user-id: user2" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "room1",
    "startTime": "2030-01-01T12:00:00.000Z",
    "endTime": "2030-01-01T14:00:00.000Z"
  }'
```

### List Bookings for a Room

```bash
curl http://localhost:3000/api/rooms/room1/bookings
```

**Note:** Returns only future bookings (where `startTime > current time`).

### List Bookings for a User

```bash
curl http://localhost:3000/api/users/user1/bookings
```

**Note:** Returns all bookings for the user (sorted by start time).

### List All Rooms

```bash
curl http://localhost:3000/api/rooms
```

## Validation Rules

- Bookings cannot be in the past
- `startTime` must be less than `endTime`
- Bookings cannot overlap in the same room
- **Back-to-back bookings are allowed** (endTime equals next startTime)
- Room must exist
- Regular users can only manage their own bookings
- SuperUser can manage any booking

## HTTP Status Codes

| Code  | Status       | Usage                                               |
| ----- | ------------ | --------------------------------------------------- |
| `201` | Created      | Booking created successfully                        |
| `400` | Bad Request  | Invalid input (past time, `endTime <= startTime`)   |
| `401` | Unauthorized | Missing `userId` header                             |
| `403` | Forbidden    | Not allowed to access resource (not SuperUser for all bookings) |
| `404` | Not Found    | Room or booking not found                           |
| `409` | Conflict     | Overlapping booking                                 |

## Initial Data

### Rooms

- `room1` - Conference Room A (capacity: 10)
- `room2` - Conference Room B (capacity: 8)
- `room3` - Meeting Room 1 (capacity: 6)
- `room4` - Meeting Room 2 (capacity: 4)
- `room5` - Board Room (capacity: 12)

### Sample Users

- `user1`, `user2`, `user3` (normal users)
- `superuser` (can manage any booking)

## Tech Stack

- Node.js (Runtime)
- Express.js (Web framework)
- In-memory storage (Data storage)
- uuid (ID generation)
- swagger-ui-express (Swagger documentation UI)
- swagger-jsdoc (OpenAPI specification)
- Jest (Testing framework)
- Supertest (API testing)
