# Architecture rules
- Keep authenticated university-management pages under the existing `_authenticated` TanStack layout so one gate protects all private screens.
- Keep role authorization in the dedicated `user_roles` table and database policies to prevent client-side privilege escalation.
- Use the shared `ResourcePage` for simple academic CRUD lists so search, dialogs, and mutations stay consistent.
