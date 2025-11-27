const defaultApiBase = "http://localhost:8000";
const envApiBase = import.meta.env.VITE_API_BASE_URL ?? defaultApiBase;

export const apiBaseUrl = envApiBase.replace(/\/$/, "");

const deriveWsBase = (httpBase: string) => {
  try {
    const parsed = new URL(httpBase);
    const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    const pathname = parsed.pathname.replace(/\/$/, "");
    return `${protocol}//${parsed.host}${pathname}`;
  } catch {
    return httpBase;
  }
};

export const wsBaseUrl =
  import.meta.env.VITE_WS_BASE_URL ?? deriveWsBase(apiBaseUrl);
