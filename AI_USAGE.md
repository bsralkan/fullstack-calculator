# AI Usage

I used GitHub Copilot as a development assistant on this project for architecture suggestions, implementation help, writing tests and refining the UI. I reviewed, tested and adjusted the generated code before keeping it.

The prompts I used are listed below, grouped by area.

## Architecture

### Initial project structure

> I'm building a full-stack calculator application with React + TypeScript for the frontend and Go for the backend.
>
> The frontend will call a REST API for calculator operations.
>
> I want the project structure to follow idiomatic practices for both Go and React, with clear separation of concerns and good testability, but without unnecessary abstraction or overengineering.
>
> Can you suggest a clean folder structure for both the frontend and backend? Don't generate the implementation yet. Briefly explain the responsibility of each main folder/package.

## Backend

### Calculator domain

> Let's start with the backend calculator package.
>
> Implement internal/calculator/calculator.go for the basic operations:
> - addition
> - subtraction
> - multiplication
> - division
>
> Keep the calculation logic independent from HTTP.
>
> Use an Operation type with constants for the supported operations and expose a Calculate(operation, a, b) function.
>
> Handle division by zero and unsupported operations with clear errors.
>
> Also add table-driven unit tests in calculator_test.go covering the main cases and edge cases.

### Simplifying calculator tests

> The calculator implementation looks good.
>
> Can you simplify calculator_test.go a bit? Keep table-driven tests, but focus on the main behavior instead of testing every variation.
>
> Please keep coverage for:
> - each supported operation
> - decimal numbers
> - negative numbers
> - division by zero
> - unsupported operation
>
> Use errors.Is for error assertions. We don't need a separate test for the exact unsupported-operation error message.

### HTTP API

> Now let's add the HTTP API layer.
>
> Create the files under internal/httpapi for a POST /api/v1/calculate endpoint using Go's standard net/http package.
>
> The endpoint should:
> - accept JSON with operation, a and b
> - call the existing calculator.Calculate function
> - return the result as JSON
> - return a consistent JSON error response for invalid requests
> - handle malformed JSON, unsupported operations and division by zero
> - use appropriate HTTP status codes
>
> Keep the HTTP-specific request/response types in dto.go and route registration in router.go.
>
> Please keep the handler focused on HTTP concerns and don't duplicate calculation logic there.
>
> Also add table-driven handler tests using httptest for the main success and error cases.

### HTTP validation refinement

> The HTTP layer looks good. I'd like to make a few small changes before moving on.
>
> - Return 400 Bad Request for division by zero instead of 422.
> - Make sure the request contains only one JSON object and reject trailing JSON/data.
> - Keep the existing unknown-field validation and missing operand validation.
> - Treat any non-finite calculation result as an out-of-range error before JSON encoding.
>
> Please update the handler and tests accordingly. Keep the implementation straightforward.

### Server and configuration

> Let's wire up the backend server now.
>
> Add a small config package that reads the server port from an environment variable and uses a sensible default when it isn't set.
>
> Then implement cmd/server/main.go to:
> - load the config
> - create the httpapi router
> - start an http.Server
> - configure reasonable read, write and idle timeouts
> - handle graceful shutdown on SIGINT/SIGTERM
>
> Keep main.go focused on application startup and wiring. Don't add frameworks or extra dependencies unless they're actually needed.

### Configuration tests

> The server setup looks good.
>
> Before moving to the frontend, add a small table-driven test for config.Load covering:
> - default port when PORT is not set
> - a valid custom port
> - invalid PORT values
>
> Use t.Setenv so the tests don't depend on the machine environment.
>
> Don't change the server implementation unless needed.

## Frontend

### Frontend API layer

> Let's start the React frontend using TypeScript and Vite.
>
> Set up the frontend project and implement the API layer first.
>
> Create:
> - shared calculator types for the API request, response and supported operations
> - a small API client using fetch for JSON requests and consistent error handling
> - a calculator API function that calls POST /api/v1/calculate
>
> Configure the Vite dev server to proxy /api requests to the Go backend running on localhost:8080.
>
> Keep the API layer independent from React components so it can be tested separately. Don't build the calculator UI yet.

### Calculator state

> Now let's implement the calculator state and behavior.
>
> Create a useCalculator hook under features/calculator.
>
> It should support a normal calculator flow:
> - entering digits and decimal numbers
> - selecting add, subtract, multiply or divide
> - pressing equals to call the existing calculate API
> - clear/reset
> - showing loading and API errors
> - continuing calculations from the previous result
>
> Keep the calculation itself on the backend. The hook should only manage UI state and call the API.
>
> Please keep the state logic easy to follow and don't add a state management library.
>
> Add focused unit tests for the main calculator flows and error handling.

### Calculator UI

> Now build the calculator UI using the existing useCalculator hook.
>
> Create:
> - Calculator.tsx as the main calculator component
> - Display.tsx for the current value, loading state and errors
> - Keypad.tsx for digits, decimal, clear, the four operations and equals
>
> Use semantic buttons and make the active operation visually clear.
>
> I want a polished but simple calculator design:
> - centered calculator card
> - clear display area
> - familiar calculator keypad layout
> - good spacing and readable typography
> - responsive on mobile
> - visible hover, active and keyboard focus states
> - error messages should be noticeable without breaking the layout
>
> Use regular CSS, no UI framework.
>
> Replace the default Vite App content with the calculator and remove unused Vite template assets/styles.
>
> Don't add the optional calculator operations yet.

### UI polish

> The calculator works well. Let's do a small UI polish pass without changing the component structure or behavior.
>
> Please:
> - make the calculator more compact on desktop while keeping it responsive on mobile
> - reduce unnecessary vertical spacing between the display and keypad
> - keep the display readable for longer numbers
> - keep operator buttons visually distinct from number buttons
> - make the selected operator state clear, but visually different from the keyboard focus state
> - keep the error message compact and prevent it from shifting the keypad significantly
> - make sure buttons have good hover, active and focus-visible states
> - keep the current dark calculator style and avoid adding gradients or unnecessary visual effects
>
> Don't change the calculator logic or API behavior.

## Testing and Refinement

### Keyboard support and component tests

> The calculator is working end-to-end now.
>
> Add keyboard support for:
> - 0-9 for digits
> - . for decimal
> - +, -, *, / for operations
> - Enter or = for equals
> - Escape for clear
>
> Reuse the existing calculator actions instead of duplicating the logic.
>
> Also add focused React Testing Library tests for the Calculator component covering:
> - entering a calculation with buttons and showing the API result
> - displaying an API error
> - clearing the calculator
> - one keyboard-driven calculation
>
> Keep the tests focused. We don't need to test every button individually.

### API client tests

> The frontend tests are passing, but coverage for src/api/client.ts is quite low because the API layer is mocked in the calculator tests.
>
> Add focused unit tests for the API client.
>
> Please cover the main behaviors:
> - successful JSON response
> - backend error response with an { error } message
> - network/fetch failure
> - an unsuccessful response that does not contain valid JSON
>
> Keep the tests small and mock fetch directly. Don't try to cover every defensive branch just for the sake of 100% coverage.