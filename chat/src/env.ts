require("dotenv").config();

export default {
  corsOrigins: process.env.CORS_ORIGINS,
  messageCacheLimit: Number(process.env.MESSAGE_CACHE_LIMIT),
  ticker: Number(process.env.TICKER),
};
