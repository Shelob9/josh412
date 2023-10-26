import { generateLoginURL } from "@cloudflare/pages-plugin-cloudflare-access/api";

const {
    JWT_DOMAIN,
    JWT_AUD,
} = process.env;
export const onRequest = () => {
  const loginURL = generateLoginURL({
    redirectURL: `${JWT_DOMAIN}/loggedin"`,
    domain: JWT_DOMAIN as string,
    aud: JWT_AUD as string,
  });
  return new Response(null, {
    status: 302,
    headers: { Location: loginURL },
  });
};
