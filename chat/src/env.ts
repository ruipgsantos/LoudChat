require("dotenv").config();

export default {
  corsOrigins: (() => {
    let res: string[] = [];
    const corsEnv = process.env.CORS_ORIGINS;
    if (corsEnv) {
      res = corsEnv.split(",");
    }
    return res;
  })(),
  messageCacheLimit: Number(process.env.MESSAGE_CACHE_LIMIT),
  ticker: Number(process.env.TICKER),
  cacheMode: Number(process.env.CACHE_MODE) || 0,
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    user: process.env.REDIS_USER,
    url: `rediss://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  },
};
