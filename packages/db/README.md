- `pnpm db:push` | `prisma db push` Push a change made in the schema file to the DB without creating a migration
- `pnpm db:seed` | `prisma db seed` Add seeded data to the DB, If in dev env. It will also seed characters etc
- `pnpm db:migrate` | `prisma migrate dev (--name my_new_migration)` Add a new migration to the folder with a optional name, gets all changes to the DB and scheme against the prev migration
- `pnpm db:deploy` | `prisma migrate deploy` Used on production server
- `pnpm db:reset` | `prisma migrate reset` Reset your database

Je kan een lege migration file aanmaken met:
`pnpm db:migrate --create-only`