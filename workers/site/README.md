
- Create migration
    - `bunx wrangler d1 migrations create josh412-02 <tablename>`
-  Put data in based on prisma schema
    - `bunx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/<tablename>`
- Regenerate client
    - `bun run prisma`
- Migrate db
    - `bun run migrate:local`
    - `bun run migrate:prod`
