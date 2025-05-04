import { teardownTestDatabase } from './utils/db-clean';

async function globalTeardown() {
  await teardownTestDatabase();
}

export default globalTeardown;
