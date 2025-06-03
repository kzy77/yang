import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema';

// 检查环境变量以确定连接字符串
let connectionString: string | undefined;

if (process.env.HYPERDRIVE) {
  console.log('Using Hyperdrive binding for database connection.');
  // 注意：Hyperdrive 通常通过 fetch API 暴露，而不是直接的连接字符串。
  // 这里假设 HYPERDRIVE 环境变量 *包含* 了 Neon HTTP 兼容的 URL，
  // 或者需要根据 Hyperdrive 的具体实现调整。
  // 如果 Hyperdrive 是一个服务绑定，可能需要不同的初始化方式。
  // 暂时假设它提供了一个 URL。
  connectionString = process.env.HYPERDRIVE;
} else if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for database connection.');
  connectionString = process.env.DATABASE_URL;
} else {
  console.error('Error: Database connection string not found.');
  console.error('Please set either HYPERDRIVE or DATABASE_URL environment variable.');
  // 在生产环境中，可能希望抛出错误或采取更严格的措施
  // throw new Error('Database connection string is required.');
  // 为了开发方便，这里可能允许继续，但数据库操作会失败
}

// 如果没有连接字符串，创建一个虚拟的 neon 实例或处理错误
// 这里我们假设如果 connectionString 为 undefined，后续操作会失败
// 更健壮的处理方式可能是抛出错误或提供一个模拟/空实现
const sql = connectionString ? neon(connectionString) : (() => {
    console.warn("Database connection string is missing. Database operations will fail.");
    // 返回一个会抛出错误的代理或模拟对象
    // 或者直接在这里抛出错误
    throw new Error("Cannot initialize database connection: connection string is missing.");
    // return neon("postgresql://user:password@host:port/db"); // 避免运行时错误，但连接会失败
})();


// 创建 Drizzle 实例
const db = drizzle(sql, { schema });

// 导出 db 和 schema
export { db, schema };