# KAN-33 — VleisGPT → VleisAI™ Rename Checklist

## Files to update (search & replace 'vleisgpt' → 'vleisai', 'VleisGPT' → 'VleisAI™'):
- src/vleisgpt/vleisgpt.module.ts → rename to vleisai.module.ts
- src/vleisgpt/vleisgpt.controller.ts → rename to vleisai.controller.ts
- src/vleisgpt/vleisgpt.service.ts → rename to vleisai.service.ts
- app.module.ts — update import
- Swagger tag: @ApiTags('vleisgpt') → @ApiTags('VleisAI')
- Frontend: screen title 'VleisGPT' → 'VleisAI™'
- All string literals, comments, and log messages

## Reason: OpenAI trademark risk — 'GPT' suffix conflicts with OpenAI branding.
## Assigned: DEV-1 | Ticket: KAN-33 | Due: May 26, 2026
