# PostgreSQL Database Setup for Storefront

## Run these commands in a fresh terminal:

```bash
# 1. Create the blackforge database
sudo -u postgres createdb blackforge

# 2. Create the blackforge schema
sudo -u postgres psql -d blackforge -c "CREATE SCHEMA IF NOT EXISTS blackforge;"

# 3. Verify the database exists
sudo -u postgres psql -l | grep blackforge

# 4. Navigate to storefront directory
cd /home/mohamedws/khedmti/storefront

# 5. Apply Prisma schema to the database
npx prisma db push --skip-generate

# 6. Optionally seed the database
npm run db:seed

# 7. Start the dev server
npm run dev
```

## Environment Configuration
The `.env.local` file has been configured with:
- `NEXTAUTH_SECRET` - Already set
- `DATABASE_URL` - PostgreSQL connection to localhost:5432/blackforge
- `DATABASE_URL_UNPOOLED` - Same as above for connection pooling

## Verification
After setup, PostgreSQL should be:
- Running on port 5432
- Accessible via `sudo -u postgres psql`
- Contains the `blackforge` database with `blackforge` schema

The Next.js storefront app will connect automatically once the database is ready.
