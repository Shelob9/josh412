import { generateLogoutURL } from "@cloudflare/pages-plugin-cloudflare-access/api";
const {
    JWT_DOMAIN,
} = process.env;
export const onRequest = () =>
  new Response(null, {
    status: 302,
    headers: {
      Location: generateLogoutURL({
        domain: JWT_DOMAIN as string,
      }),
    },
  });
