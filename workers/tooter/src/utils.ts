export function jsonResponse(obj:any, headers? : Record<string,string>) {
  let response = new Response(JSON.stringify(obj));
  response.headers.set("Content-Type", "application/json");
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
  }
  return response;
}
