export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Forward to Backend EC2 on port 80
  const backendUrl = `http://13.203.49.89${url.pathname}${url.search}`;

  const requestHeaders = new Headers(context.request.headers);
  requestHeaders.set('X-Forwarded-Host', url.host);
  requestHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

  const init = {
    method: context.request.method,
    headers: requestHeaders,
    redirect: 'follow',
  };

  // Only attach body for non-GET / non-HEAD requests
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body;
  }

  return fetch(backendUrl, init);
}
