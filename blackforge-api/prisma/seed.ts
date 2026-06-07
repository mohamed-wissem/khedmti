/**
 * Database seed. No-op in Sprint 0 (no models exist yet).
 *
 * From Sprint 1 this will seed RBAC roles/permissions and a default admin user.
 * Run with: `npm run prisma:seed`.
 */
async function main(): Promise<void> {
  // Intentionally empty until business models land in Sprint 1.
  // eslint-disable-next-line no-console
  console.log("[seed] nothing to seed yet (Sprint 0 foundation).");
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });
