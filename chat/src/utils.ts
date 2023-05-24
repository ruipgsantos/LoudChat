import config from "./env";

export const getCors = (): any[] => {
  const corsArr: string[] = config.corsOrigins;

  const requestedCors = corsArr.map((corsStr) => {
    const isRegex = corsStr.charAt(0) === "^";

    return isRegex ? new RegExp(corsStr) : corsStr;
  });

  console.log(`requested cors: ${requestedCors}`);

  return requestedCors;
};
