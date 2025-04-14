# API Endpoint Implementation Plan: POST /generations

## 1. Endpoint Overview

- **Purpose:** Initiate the AI flashcard generation process.
- **Functionality:** Validate user-provided text, call an external AI service to generate flashcard proposals, store generation metadata, and return generated proposals to the user.

## 2. Request Details

- **HTTP Method:** POST
- **URL:** `/generations`
- **Request Body:**
  ```json
  {
    "source_text": "User provided text (1000 to 10000 characters)"
  }
  ```
- **Parameters:**
  - **Required:**
    - `source_text` (string, length between 1000 and 10000 characters)
  - **Optional:** None

## 3. Utilized Types

- **DTO / Command Models:**
  - `GenerateFlashcardsCommand` for incoming request.
  - `GenerationCreateResponseDto` for successful response.
- **Database Models:**
  - `generations` table for storing generation metadata.
  - `generation_error_logs` table for logging errors from the AI service.

## 4. Response Details

- **Success Response (201 Created):**
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      {
        "front": "Generated Question",
        "back": "Generated Answer",
        "source": "ai-full"
      }
    ],
    "generated_count": 5
  }
  ```
- **Error Responses:**
  - **400 Bad Request:** For invalid input (e.g., text length violations).
  - **500 Internal Server Error:** For issues with the AI service or internal processing.

## 5. Data Flow

1. **Input Validation:**
   - Validate that `source_text` exists and its length is between 1000 and 10000 characters.
2. **AI Service Call:**
   - Invoke the external AI service (e.g., via Openrouter.ai) with the `source_text`.
3. **Process AI Response:**
   - Extract flashcard proposals and count of generated flashcards.
4. **Database Operations:**
   - Insert a new record into the `generations` table with metadata (model, generation_duration, counts, etc.).
   - In the event of failure during the AI service call, log details into the `generation_error_logs` table.
5. **Return Response:**
   - Construct and return the response JSON containing the `generation_id`, `flashcards_proposals`, and `generated_count`.

## 6. Security Considerations

- **Authentication & Authorization:**
  - Secure the endpoint with Supabase Auth using JWT tokens.
  - Use Row-Level Security (RLS) on relevant tables to ensure users only access their own data.
- **Data Validation:**
  - Strictly validate the input body to prevent injection and abuse.
- **Transport Security:**
  - Ensure all communications are carried over HTTPS.

## 7. Error Handling

- **Validation Errors (400):**
  - Return if the `source_text` is missing or fails length validation.
- **AI Service Errors (500):**
  - Catch exceptions during the external AI call, log the error in `generation_error_logs`, and return a 500 error.
- **General Exception Handling:**
  - Employ a try-catch block to capture unexpected errors and return appropriate HTTP status codes.

## 8. Performance Considerations

- **Asynchronous Processing:**
  - Use asynchronous calls for the AI service to prevent blocking the main thread.
- **Timeouts & Retries:**
  - Implement timeouts and optional retry logic for the external AI service to handle transient network issues.
- **Load Handling:**
  - Monitor the endpoint for high request volume and consider rate limiting to prevent abuse.

## 9. Implementation Steps

1. **Input Validation:**
   - Implement middleware or inline validation to check `source_text` length.
2. **AI Service Integration:**
   - Create or update a service module to handle external API calls (using the appropriate HTTP client).
   - Include timeout and error handling mechanisms.
3. **Database Operations:**
   - Use an ORM or direct database queries to insert a new record into the `generations` table.
   - On error, insert details into `generation_error_logs`.
4. **Response Construction:**
   - Format the response using `GenerationCreateResponseDto` and send a 201 Created status.
5. **Security & Error Handling:**
   - Secure the endpoint with proper authentication and apply RLS policies.
   - Set up try-catch blocks to capture and log errors, and return correct status codes.
6. **Testing:**
   - Write unit and integration tests to validate input, service calls, database updates, and error handling.
   - Test edge cases, including invalid input and AI service downtime.

<!-- Note: Field names (source_text, generation_id, flashcards_proposals, generated_count) are consistent with the DTOs in types.ts -->
