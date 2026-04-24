# ADR

## ADR-001: Mobile Stack

- Decision: Use `Expo + React Native + TypeScript`.
- Why: Fast MVP delivery, strong ecosystem, and good fit for a solo-friendly workflow.

## ADR-002: Backend Strategy

- Decision: Use `Supabase` for auth, storage, and database-backed session persistence.
- Why: Lower operational complexity than a custom backend for the MVP.

## ADR-003: AI Strategy

- Decision: Use `Gemini 3 Flash` for script generation and `Gemini 3.1 Flash TTS Preview` for audio generation.
- Why: Shared ecosystem, prompt-driven control, and a product flow centered on generated sessions.

## ADR-004: Audio Strategy

- Decision: Use generated audio files rather than real-time conversational audio.
- Why: This product needs a complete meditation session more than a live voice assistant.

## ADR-005: Harness Strategy

- Decision: Start from a simple step executor plus a lightweight verifier.
- Why: The repo needs repeatable execution and quality checks, but not a heavyweight agent platform.
