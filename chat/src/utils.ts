export const getCors = (): any[] => {
  const corsArr: string[] = process.env.CORS_ORIGINS?.split(",") || [];

  const requestedCors = corsArr.map((corsStr) => {
    const isRegex = corsStr.at(0) === "^";

    return isRegex ? new RegExp(corsStr) : corsStr;
  });

  console.log(`requested cors: ${requestedCors}`);

  return requestedCors;
};
