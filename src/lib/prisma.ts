import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const requestClientMap = new WeakMap<object, PrismaClient>();

function sanitizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.delete('sslmode');
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function getPrismaClient(): PrismaClient {
  // 1. Check Cloudflare context (Hyperdrive)
  try {
    const cf = getCloudflareContext();
    const hyperdrive = (cf?.env as any)?.HYPERDRIVE;
    if (hyperdrive?.connectionString) {
      const ctxObj = (cf?.ctx as object) || (cf as object);
      if (ctxObj && requestClientMap.has(ctxObj)) {
        return requestClientMap.get(ctxObj)!;
      }

      const isLocal = hyperdrive.connectionString.includes('pooler.supabase.com');
      const connectionString = isLocal
        ? sanitizeUrl(hyperdrive.connectionString)
        : hyperdrive.connectionString;

      const pool = new Pool({
        connectionString,
        ...(isLocal ? { ssl: { rejectUnauthorized: false } } : {}),
        max: 2,
      });

      pool.on('error', (err) => {
        console.error('Hyperdrive pool error:', err.message);
      });

      const adapter = new PrismaPg(pool);
      const client = new PrismaClient({ adapter, log: ['error', 'warn'] });

      if (ctxObj) {
        requestClientMap.set(ctxObj, client);
      }

      return client;
    }
  } catch (err: any) {
    // Cloudflare context unavailable (e.g. running in Node.js, Next build, or seed)
  }

  // 2. Fallback to process.env.DATABASE_URL (Local Node.js)
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return new PrismaClient();
  }

  const pool = new Pool({
    connectionString: sanitizeUrl(connectionString),
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
