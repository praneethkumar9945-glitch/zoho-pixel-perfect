# University Manager migration

## Goal
Recreate the imported university management application with a clean white-and-blue business interface and make every visible menu open a useful, working screen.

## What will be built
- Preserve sign-in, role-aware navigation, dashboard, courses, batches, students, faculty/HODs, timetable, forms, submissions, approvals, notifications, reports, audit log, and user roles.
- Replace every “coming soon” screen with practical list, search, filter, create, edit, review, or status workflows appropriate to that section.
- Use Lovable Cloud for accounts, persistent records, permissions, documents, and workflow state.
- Apply a restrained white-and-blue visual system inspired by Zoho’s crisp enterprise products, without copying branding.
- Keep desktop sidebar navigation and provide a complete compact mobile menu.

## Verification
- Confirm every menu destination opens successfully.
- Test sign-in/sign-up and the first-user administrator flow.
- Test representative create, update, read, and delete actions.
- Check desktop and mobile layouts, empty states, loading states, and errors.

## Technical details
- Retain TanStack Start routing and the existing role model.
- Port the repository’s database schema, row-level permissions, triggers, and workflow functions into Lovable Cloud.
- Keep roles in the dedicated roles table and enforce permissions in the database.
- Add unique page titles and descriptions for every route.
