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
- Update a booking (modify time range or room)
- Cancel a booking
- View bookings for a specific room
- View bookings for a specific user
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
  - Example: `[10:00-12:00]` and `[12:00-14:00]` are back-to-back ✓ (endTime equals next booking's startTime is allowed)
  - **Definition:** Overlap occurs when `newStartTime < existingEndTime` AND `newEndTime > existingStartTime`

### 2. No Bookings in the Past

- `startTime` must be greater than current server time

### 3. Valid Time Range

- `startTime` must be less than `endTime`
- If `startTime >= endTime` → reject

### 4. Booking Ownership Rules

- Only the booking creator can update or cancel their own booking
- SuperUser can update or cancel any booking
- Booking ID is generated automatically on creation (UUID or timestamp-based)

### 5. Room Validation

- `roomId` must exist in the rooms list for all booking operations (create, update)
- Booking ID must exist for update and delete operations
- When listing bookings for a room, return only future bookings (where `startTime > current time`)
- When listing bookings for a user, return all bookings for that user regardless of time

### 6. Booking Update Rules

- Only the booking creator or SuperUser can update a booking
- Updated booking must still pass all validation rules (no overlaps, future time, valid time range)
- Cannot change the booking's `userId` (owner cannot be transferred)

### 7. Listing Specifications

- **Response format:** Array of booking/room objects
- **Sorting:** Bookings sorted by `startTime` ascending (earliest first)
- **Pagination:** Not required for MVP (return all results)

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
| Update booking         | `PUT`    | `/api/bookings/{id}`           |
| Delete booking         | `DELETE` | `/api/bookings/{id}`           |
| List bookings for room | `GET`    | `/api/rooms/{roomId}/bookings` |
| List bookings for user | `GET`    | `/api/users/{userId}/bookings` |
| List all rooms         | `GET`    | `/api/rooms`                   |

### Required Header

All requests must include:

```
x-user-id: <userId>
```

**SuperUser Exception:** The SuperUser must still send `x-user-id: superuser` header for all requests, including cancellation operations.

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

**Note for Testing:** Test cases requiring past bookings should create them dynamically during test execution, not in initial data.

---

## HTTP Status Codes

| Code  | Status       | Usage                                               |
| ----- | ------------ | --------------------------------------------------- |
| `201` | Created      | Booking created successfully                        |
| `400` | Bad Request  | Invalid input (past time, `endTime <= startTime`)   |
| `401` | Unauthorized | Missing `userId` header                             |
| `403` | Forbidden    | Not allowed to update/cancel (not owner and not SuperUser) |
| `404` | Not Found    | Room or booking not found                           |
| `409` | Conflict     | Overlapping booking or validation failure           |

---

## Testing Requirements

**Framework:** Jest + Supertest

### Booking Creation Tests

- ✓ Success (valid booking)
- ✗ Reject booking in the past (`startTime < current time`)
- ✗ Reject invalid time range (`endTime <= startTime`)
- ✗ Reject overlapping booking (same room, overlapping time)
- ✗ Reject booking for non-existent room
- ✗ Reject request with missing `userId` header
- ✓ Verify booking ID is generated automatically
- ✓ Verify back-to-back bookings are allowed (endTime equals next startTime)

### Update Tests

- ✓ Allow owner to update their own booking (time range or room)
- ✓ Allow SuperUser to update any booking
- ✗ Reject normal user updating someone else's booking
- ✗ Reject request with missing `userId` header
- ✗ Reject update to non-existent booking
- ✗ Reject update that causes overlap
- ✗ Reject update with past time
- ✗ Reject update with invalid time range
- ✗ Reject update with non-existent room
- ✗ Reject update that tries to change `userId`

### Cancellation Tests

- ✗ Reject request with missing `userId` header
- ✗ Reject normal user canceling someone else's booking
- ✓ Allow SuperUser to cancel any booking
- ✓ Allow owner to cancel their own booking
- ✗ Reject deletion of non-existent booking

### Listing Tests

- ✓ List bookings for existing room (only future bookings)
- ✗ List bookings for non-existent room (returns 404)
- ✓ List bookings for existing user (all bookings, including past)
- ✓ List bookings for non-existent user (returns empty array)
- ✓ List all rooms
- ✓ Verify bookings are sorted by `startTime` ascending

---

## Swagger Documentation

Provide full OpenAPI documentation including:

- **Schemas:** Request/response models (Booking, Room, ErrorResponse, CreateBookingRequest, UpdateBookingRequest)
- **Endpoints:** All endpoints with parameters documented
- **Error Responses:** All error responses documented
- **Security:** Security scheme for `x-user-id` header
- **UI Access:** Swagger UI available at `GET /api-docs`
- **Validation:** Document all request body validation rules (e.g., time format, required fields)

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
- **roomId format:** Any string accepted (no format validation required)
- **userId format:** Any string accepted (no format validation required)

### Development Approach

- Keep code simple and straightforward
- Focus on core functionality, not production features
- Use consistent error message formats across all endpoints
- Implement proper request validation before business logic
- Generate booking IDs using UUID library or timestamp-based approach
