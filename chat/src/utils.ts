export const getCors = (): any[] => {
  const corsArr: string[] = process.env.CORS_ORIGINS?.split(",") || [];

  return corsArr.map((corsStr) => {
    const isRegex = corsStr.at(0) === "^";

    return isRegex ? new RegExp(corsStr) : corsStr;
  });
};
