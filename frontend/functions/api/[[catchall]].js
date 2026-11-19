export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Forward to Backend EC2 via api subdomain (domain name required by Cloudflare Workers)
  const backendUrl = `http://api.zilapanchayatalmora.in${url.pathname}${url.search}`;

  const requestHeaders = new Headers(context.request.headers);
  requestHeaders.set('X-Forwarded-Host', url.host);
  requestHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

  const init = {
    method: context.request.method,
    headers: requestHeaders,
    redirect: 'follow',
  };

  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body;
  }

  return fetch(backendUrl, init);
}
