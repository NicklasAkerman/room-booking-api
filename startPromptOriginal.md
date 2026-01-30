# Meeting Room Booking REST API - MVP Requirements

## Important: Before Implementation

**Critically review these requirements:**

- Identify ambiguities, missing details, or risky assumptions
- Highlight business logic risks and edge cases
- Suggest concrete improvements
- **Wait for confirmation before coding**

> **Note:** Do not agree blindly, challenge unclear or weak parts. Keep in mind this is an MVP for local testing only.

---

## Project Goal

Build an MVP Meeting Room Booking REST API for authenticated users to manage room reservations.

### Core User Capabilities

- Create a booking (reserve a room for a time range)
- Cancel a booking
- View bookings for a specific room
- View all meeting rooms

---

## Authentication and Users

**Authentication Method:** `userId` passed in HTTP header (no full auth system required)

### Rules

- Each booking belongs to one user
- Only the creator can cancel their booking
- A **SuperUser** (`userId: "superuser"`) can cancel any booking
- Any `userId` string is accepted (no validation against user list)

---

## Business Rules

### 1. No Overlapping Bookings

- **Overlap:** Any shared time between bookings for the same room
  - Example: `[10:00-12:00]` and `[11:00-13:00]` overlap ❌
  - Example: `[10:00-12:00]` and `[12:00-14:00]` are back-to-back ✓

### 2. No Bookings in the Past

- `startTime` must be greater than current server time

### 3. Valid Time Range

- `startTime` must be less than `endTime`
- If `startTime >= endTime` → reject

### Error Handling

All violations must return:

- Proper HTTP status codes
- JSON error response: `{ "error": "Error message here" }`

---

## Tech Stack (Mandatory)

| Technology         | Purpose                       |
| ------------------ | ----------------------------- |
| Node.js            | Runtime                       |
| Express.js         | Web framework                 |
| In-memory storage  | Data storage (arrays/objects) |
| swagger-ui-express | Swagger documentation UI      |
| swagger-jsdoc      | OpenAPI specification         |
| Jest               | Testing framework             |
| Supertest          | API testing                   |

---

## API Endpoints

**Base Path:** `/api`

| Action                 | Method   | Endpoint                       |
| ---------------------- | -------- | ------------------------------ |
| Create booking         | `POST`   | `/api/bookings`                |
| Delete booking         | `DELETE` | `/api/bookings/{id}`           |
| List bookings for room | `GET`    | `/api/rooms/{roomId}/bookings` |
| List all rooms         | `GET`    | `/api/rooms`                   |

### Required Header

All requests must include:

```
x-user-id: <userId>
```

---

## Data Models

### Booking

```json
{
  "id": "string", // UUID or timestamp-based
  "roomId": "string",
  "userId": "string",
  "startTime": "string", // ISO 8601 format
  "endTime": "string", // ISO 8601 format
  "createdAt": "string" // ISO 8601 format
}
```

### Room

```json
{
  "id": "string",
  "name": "string",
  "capacity": "number"
}
```

---

## Initial Data

The in-memory database must start with the following data on server startup:

### Users

For reference only (not validated):

- `user1`, `user2`, `user3` (normal users)
- `superuser` (SuperUser)

### Rooms

```javascript
[
  { id: "room1", name: "Conference Room A", capacity: 10 },
  { id: "room2", name: "Conference Room B", capacity: 8 },
  { id: "room3", name: "Meeting Room 1", capacity: 6 },
  { id: "room4", name: "Meeting Room 2", capacity: 4 },
  { id: "room5", name: "Board Room", capacity: 12 },
];
```

### Bookings

5 future bookings spread across rooms (all with `startTime > current time`):

**Examples:**

- Booking 1: `room1`, `user1`, any time in 2027
- Booking 2: `room2`, `user2`, any time in 2027
- Booking 3: `room3`, `user3`, any time in 2027
- Booking 4: `room3`, `user1`, any time in 2027
- Booking 5: `room4`, `user2`, any time in 2027

---

## HTTP Status Codes

| Code  | Status       | Usage                                               |
| ----- | ------------ | --------------------------------------------------- |
| `201` | Created      | Booking created successfully                        |
| `400` | Bad Request  | Invalid input (past time, `endTime <= startTime`)   |
| `401` | Unauthorized | Missing `userId` header                             |
| `403` | Forbidden    | Not allowed to cancel (not owner and not SuperUser) |
| `404` | Not Found    | Room or booking not found                           |
| `409` | Conflict     | Overlapping booking                                 |

---

## Testing Requirements

**Framework:** Jest + Supertest

### Booking Creation Tests

- ✓ Success (valid booking)
- ✓ Reject booking in the past (`startTime < current time`)
- ✓ Reject invalid time range (`endTime <= startTime`)
- ✓ Reject overlapping booking (same room, overlapping time)
- ✓ Reject booking for non-existent room
- ✓ Reject request with missing `userId` header

### Cancellation Tests

- ✓ Reject request with missing `userId` header
- ✓ Reject normal user canceling someone else's booking
- ✓ Allow SuperUser to cancel any booking
- ✓ Allow owner to cancel their own booking
- ✓ Reject deletion of non-existent booking

### Listing Tests

- ✓ List bookings for existing room
- ✓ List all rooms
- ✓ Handle listing bookings for non-existent room

---

## Swagger Documentation

Provide full OpenAPI documentation including:

- **Schemas:** Request/response models (Booking, Room, ErrorResponse)
- **Endpoints:** All endpoints with parameters documented
- **Error Responses:** All error responses documented
- **Security:** Security scheme for `x-user-id` header
- **UI Access:** Swagger UI available at `GET /api-docs`

---

## Required Files

Place in project root:

| File          | Purpose                                                            |
| ------------- | ------------------------------------------------------------------ |
| `README.md`   | Setup instructions, run commands, test instructions, curl examples |
| `PROMPTIT.md` | Empty file                                                         |
| `ANALYYSI.md` | Empty file                                                         |

---

## Project Commands

```bash
npm install    # Install dependencies
npm start      # Start the server
npm test       # Run tests
```

---

## Implementation Notes for MVP

### Simplifications

- **No database:** Use simple arrays/objects in memory
- **No persistence:** All data lost on server restart
- **No race condition handling:** Accept this limitation for MVP
- **Timezone:** Assume UTC for all times

### Development Approach

- Keep code simple and straightforward
- Focus on core functionality, not production features
