export const getCors = (): any[] => {
  const corsArr: string[] = process.env.CORS_ORIGINS?.split(",") || [];

  console.log(`found cors: ${corsArr}`);

  const requestedCors = corsArr.map((corsStr) => {
    console.log(`string: ${corsStr}`);

    const isRegex = corsStr.charAt(0) === "^";

    return isRegex ? new RegExp(corsStr) : corsStr;
  });

  console.log(`requested cors: ${requestedCors}`);

  return requestedCors;
};
