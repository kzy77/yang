import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema';

// 定义 Cloudflare Worker 环境可能包含的类型
interface CloudflareEnv {
  HYPERDRIVE?: { fetch: typeof fetch }; // Hyperdrive 绑定对象
  DATABASE_URL?: string; // 备用的数据库连接字符串
  [key: string]: unknown; // 使用 unknown 替代 any，更安全
}

/**
 * 创建 Drizzle ORM 数据库客户端实例。
 *
 * 此函数根据提供的环境对象初始化数据库连接。
 * 优先使用 Cloudflare Worker 环境中的 HYPERDRIVE 绑定。
 * 如果 HYPERDRIVE 绑定不可用，则回退到使用 DATABASE_URL 环境变量。
 *
 * @param env - 环境对象，例如 Cloudflare Worker 的 `env` 或 Node.js 的 `process.env` 包装器。
 * @returns 初始化后的 Drizzle 数据库实例 (`NeonHttpDatabase`)。
 * @throws 如果环境对象中既没有找到有效的 HYPERDRIVE 绑定，也没有找到 DATABASE_URL，则抛出错误。
 */
export function createDbClient(env?: CloudflareEnv): NeonHttpDatabase<typeof schema> {
  // 明确指定泛型参数
  let sql: NeonQueryFunction<boolean, boolean>;

  // 尝试从传入的 env 或 process.env 获取配置
  const hyperdriveBinding = env?.HYPERDRIVE;
  const databaseUrl = env?.DATABASE_URL || process.env.DATABASE_URL;

  // 检查是否存在 Hyperdrive 绑定
  if (hyperdriveBinding) {
    console.log('Initializing Drizzle with Cloudflare Hyperdrive binding.');
    // 定义选项，明确指定 fetch 类型
    const clientOptions: { fetch: typeof fetch } = {
        fetch: hyperdriveBinding.fetch,
    };
    // 使用 neon 函数，传递空字符串作为占位符，并在选项中提供 fetch 实现
    // @ts-expect-error - neon's exported type for options (HTTPTransactionOptions)
    // doesn't explicitly include 'fetch', but it's used internally for HTTPClientOptions.
    // This suppresses the type error, assuming functional correctness based on library behavior.
    sql = neon("", clientOptions);
  }
  // 否则，检查是否存在 DATABASE_URL
  else if (databaseUrl) {
    console.log('Initializing Drizzle with DATABASE_URL.');
    // 使用连接字符串初始化 neon 客户端
    sql = neon(databaseUrl);
  }
  // 如果两者都不可用，则抛出错误
  else {
    console.error('Error: Database connection configuration not found.');
    console.error('Please configure HYPERDRIVE binding in wrangler.toml or set the DATABASE_URL environment variable.');
    throw new Error('Required database configuration (HYPERDRIVE or DATABASE_URL) is missing.');
  }

  // 使用配置好的 sql 客户端创建并返回 Drizzle 实例
  // 断言 sql 已被赋值，因为前面的逻辑保证了这一点或抛出了错误
  const db = drizzle(sql!, { schema });
  return db;
}

// 导出 schema 以便在其他地方导入和使用
export { schema };

// 注意：不再导出默认的 `db` 实例。
// 使用此模块的代码现在需要导入 `createDbClient` 并使用适当的 `env` 对象调用它来获取数据库实例。
//
// 示例：Cloudflare Worker Handler
// ```typescript
// import { createDbClient } from './lib/drizzle';
//
// export default {
//   async fetch(request, env, ctx) {
//     const db = createDbClient(env);
//     // ... use db
//   }
// }
// ```
//
// 示例：Next.js API Route (Edge or Node.js)
// ```typescript
// import { createDbClient } from '../../../lib/drizzle';
// import { type NextRequest } from 'next/server'
//
// export async function GET(request: NextRequest) {
//   // In Edge Runtime (e.g., Vercel Edge, Cloudflare Pages Functions)
//   // 'env' might be injected specifically, or rely on process.env fallback.
//   // In Node.js Runtime, primarily relies on process.env.
//   // Cloudflare Pages Functions provide env in the handler's second argument.
//   // const env = (request as any).cf?.env || process.env; // Example: Possible ways to get env
//   const db = createDbClient(); // Relies on process.env or globally available CF env
//   // ... use db
// }
// ```
//
// 示例：本地开发/测试
// ```typescript
// import { createDbClient } from './lib/drizzle';
// // 确保 .env 文件或环境变量已设置 DATABASE_URL
// const db = createDbClient(); // Will automatically fall back to process.env.DATABASE_URL