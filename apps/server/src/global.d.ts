import "hono";

declare module "hono" {
  interface ContextVariableMap {
    t: (key: string) => string;
    lang: string;
  }
}
