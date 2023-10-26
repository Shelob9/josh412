import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";
import { PagesFunction } from "@cloudflare/wrangler-types";

const {
    JWT_DOMAIN,
    JWT_AUD,
} = process.env;
export const onRequest: PagesFunction = cloudflareAccessPlugin({
  aud: JWT_AUD as string,
  domain: JWT_DOMAIN as string,
});
