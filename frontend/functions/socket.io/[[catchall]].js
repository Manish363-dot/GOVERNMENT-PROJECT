export async function onRequest(context) {
  const url = new URL(context.request.url);
  const backendUrl = `http://api.zilapanchayatalmora.in${url.pathname}${url.search}`;

  const requestHeaders = new Headers(context.request.headers);
  requestHeaders.set('X-Forwarded-Host', url.host);
  requestHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

  return fetch(backendUrl, {
    method: context.request.method,
    headers: requestHeaders,
    body: (context.request.method !== 'GET' && context.request.method !== 'HEAD') ? context.request.body : undefined,
    redirect: 'follow',
  });
}
