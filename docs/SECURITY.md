# Security

## Baseline Rules

- Never commit secrets.
- Never place API keys in client code.
- Validate all external inputs at the server or edge boundary.
- Do not leak sensitive details in error messages.

## Product-Specific Concerns

- Check-in and reflection data may contain sensitive emotional context.
- Generated scripts must avoid clinical or diagnostic language.
- Gemini and Supabase credentials must remain server-side only.
- Audio storage URLs should follow least-privilege access patterns.

## Current Requirements

- Keep `.env` values out of version control.
- Use `.env.example` later for required keys only.
- Review prompt templates for unsafe or manipulative language before shipping.
- Treat service-role credentials as highly sensitive if introduced later.

## Future Requirements

- Add Supabase RLS review once schema work starts.
- Add endpoint-level auth and rate-limit review once edge functions exist.
- Add prompt safety regression checks once evals are introduced.
