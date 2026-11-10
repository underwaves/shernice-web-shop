import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let cachedClient: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (cachedClient) {
    return cachedClient;
  }

  // 1. Check Cloudflare context (Hyperdrive)
  try {
    const cf = getCloudflareContext();
    const hyperdrive = (cf?.env as any)?.HYPERDRIVE;
    if (hyperdrive?.connectionString) {
      console.log('Connecting to database via Cloudflare Hyperdrive...');
      const pool = new Pool({
        connectionString: hyperdrive.connectionString,
        max: 5,
      });
      pool.on('error', (err) => {
        console.error('Hyperdrive pool error:', err.message);
      });
      const adapter = new PrismaPg(pool);
      cachedClient = new PrismaClient({ adapter, log: ['error', 'warn'] });
      return cachedClient;
    }
  } catch (err: any) {
    // Cloudflare context unavailable (e.g. running in Node.js, Next build, or seed)
  }

  // 2. Fallback to process.env.DATABASE_URL
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return new PrismaClient();
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
  pool.on('error', (err) => {
    console.error('Direct pool error:', err.message);
  });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter, log: ['error', 'warn'] });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  } else {
    cachedClient = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === 'then') return undefined;
    const client = getPrismaClient();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

export default prisma;
