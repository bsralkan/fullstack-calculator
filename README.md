# Full-Stack Calculator

A simple calculator web app. The React + TypeScript frontend handles input and display, and sends each calculation to a Go REST API, which does the arithmetic.

Supported operations are addition, subtraction, multiplication and division. You can use the on-screen keypad or the keyboard.

## Tech Stack

- **Backend:** Go 1.22+, standard library only (`net/http`, `encoding/json`)
- **Frontend:** React 19, TypeScript, Vite
- **Testing:** Go `testing` + `httptest`; Vitest, React Testing Library, jsdom

## Project Structure

```
.
├── backend/
│   ├── cmd/server/          # Entry point: config, router, HTTP server, graceful shutdown
│   └── internal/
│       ├── calculator/      # Domain logic: Operation type, Calculate(), domain errors
│       ├── httpapi/         # HTTP layer: handler, request/response DTOs, routes
│       └── config/          # Reads PORT from the environment
└── frontend/
    └── src/
        ├── api/             # fetch-based JSON client and calculate() API function
        ├── types/           # Types shared with the API contract
        └── features/
            └── calculator/  # useCalculator hook and the Calculator, Display, Keypad components
```

## Prerequisites

- Go 1.22 or newer
- Node.js 20.19+ or 22.12+, with npm

## Running Locally

Start the backend first. In development, the frontend forwards its API requests to it.

### Backend

```bash
cd backend
go run ./cmd/server
```

The server listens on port `8080` by default. To use another port, set `PORT`:

```bash
PORT=9090 go run ./cmd/server          # macOS/Linux
$env:PORT=9090; go run ./cmd/server    # Windows PowerShell
```

Press `Ctrl+C` to stop it. The server lets in-flight requests finish before it exits.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server forwards requests under `/api` to `http://localhost:8080`. If you change the backend port, update the proxy target in `vite.config.ts` as well.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `0`–`9` | Enter digit |
| `.` | Decimal point |
| `+` `-` `*` `/` | Add, subtract, multiply, divide |
| `Enter` or `=` | Calculate |
| `Escape` | Clear |

## Running Tests

```bash
# Backend
cd backend
go test ./...

# Frontend
cd frontend
npm test -- --run    # without --run, Vitest stays in watch mode
```

## Coverage

### Backend

```bash
cd backend
go test -cover ./...

# HTML report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Frontend

```bash
cd frontend
npm test -- --run --coverage
```

This prints a summary in the terminal and writes an HTML report to `frontend/coverage/`.

### Current Coverage

#### Backend

| Package | Coverage |
|---|---|
| `calculator` | 100% |
| `config` | 100% |
| `httpapi` | 94.3% |

#### Frontend

| Metric | Coverage |
|---|---|
| Statements | 90.42% |
| Branches | 85.71% |
| Functions | 100% |
| Lines | 96.38% |

## API

### `POST /api/v1/calculate`

Runs one arithmetic operation.

**Request body**

| Field | Type | Description |
|---|---|---|
| `operation` | string | One of `add`, `subtract`, `multiply`, `divide` |
| `a` | number | First operand |
| `b` | number | Second operand |

All three fields are required. The server rejects unknown fields, anything after the JSON object, and bodies larger than 1 KB.

**Example**

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":4}'
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"result":2.5}
```

### Error Responses

Every error response has the same JSON shape:

```json
{ "error": "division by zero" }
```

| Status | Cause | Example `error` |
|---|---|---|
| 400 | Malformed JSON or an unknown field | `invalid JSON request body` |
| 400 | More than one JSON value in the body | `request body must contain a single JSON object` |
| 400 | `a` or `b` is missing | `a and b are required` |
| 400 | Unsupported operation | `unsupported operation: "modulo"` |
| 400 | Division by zero | `division by zero` |
| 422 | Result can't be represented in JSON, e.g. overflow to infinity | `result is out of range` |
| 500 | Unexpected server error | `internal server error` |

**Example**

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"modulo","a":1,"b":2}'
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error":"unsupported operation: \"modulo\""}
```

## Design Decisions

- **Calculations happen in the Go backend.** The frontend only collects input and shows results, so the arithmetic lives in one place and is covered by Go unit tests.
- **The calculator package knows nothing about HTTP.** `internal/calculator` is plain functions and error values. The `httpapi` package decodes and validates requests and turns the calculator's errors into status codes.
- **The frontend API layer doesn't depend on React.** `src/api` wraps `fetch` and turns every failure into an `ApiError` with a message and status. Components never call `fetch` directly, so the layer can be tested or mocked on its own.
- **`useCalculator` holds the calculator state.** It uses `useReducer`: the reducer handles input, and the hook calls the API for equals and for chained operations. Components only render the state and call the hook's actions. No state-management library is needed.
- **Vite proxies API requests in development.** The dev server forwards `/api/...` requests to the Go backend. This avoids CORS configuration during local development and keeps the frontend's API URLs relative.
- **Plain `net/http` instead of a web framework.** Go 1.22's router handles method-and-path patterns such as `POST /api/v1/calculate`, which covers everything this API needs without extra dependencies.
- **Only the four required operations.** Features such as percent, sign toggle, backspace or history were left out to keep the solution focused. The `Operation` type makes it straightforward to add more.

## AI Usage

GitHub Copilot was used during development for implementation assistance, test generation and UI refinement. The prompts used during the assignment are documented in [AI_USAGE.md](./AI_USAGE.md).