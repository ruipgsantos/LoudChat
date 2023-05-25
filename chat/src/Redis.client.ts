import { createClient, RedisClientType } from "redis";

const getRedisClient = (url: string | undefined): RedisClientType => {
  if (!url) {
    throw new Error("Redis error: url must be defined");
  }

  const client: RedisClientType = createClient({
    url,
  });

  client.on("error", (err: any) => {
    console.log(`redis error: ${err}`);
  });

  return client;
};

export default getRedisClient;
