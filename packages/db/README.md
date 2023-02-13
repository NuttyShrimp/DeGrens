- `yarn db:push` | `prisma db push` Push a change made in the schema file to the DB without creating a migration
- `yarn db:seed` | `prisma db seed` Add seeded data to the DB, If in dev env. It will also seed characters etc
- `yarn db:migrate` | `prisma migrate dev (--name my_new_migration)` Add a new migration to the folder with a optional name, gets all changes to the DB and scheme against the prev migration
- `yarn db:deploy` | `prisma migrate deploy` Used on production server
- `yarn db:reset` | `prisma migrate reset` Reset your database

Je kan een lege migration file aanmaken met:
`yarn db:migrate --create-only`