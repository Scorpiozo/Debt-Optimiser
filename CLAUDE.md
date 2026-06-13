@AGENTS.md

# Project Rules & Architecture

## Tech Stack
- Next.js (App Router, no src/ directory)
- Tailwind CSS v4 (Using cream/neobrutalist theme)
- Backend: Firebase (Authentication & Firestore)

## Component Rules
- Global layout styles go in `app/layout.tsx`
- Custom UI panels use `components/DarkCard.tsx` or `components/WhiteCard.tsx`
- Do NOT change the core neobrutalist styling or palette without explicit approval.

## Next Objectives
- Integrate Firebase client SDK.
- Persist user debt data into Firestore instead of local hardcoded state.
