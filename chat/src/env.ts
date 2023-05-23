require("dotenv").config();

export default {
  corsOrigins: process.env.CORS_ORIGINS,
  messageCacheLimit: Number(process.env.MESSAGE_CACHE_LIMIT),
  ticker: Number(process.env.TICKER),
  cacheMode: Number(process.env.CACHE_MODE) || 0,
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
};
