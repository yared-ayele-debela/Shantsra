import http from 'node:http';
import https from 'node:https';
import vm from 'node:vm';

export const config = {
  api: {
    bodyParser: false,
  },
};

const backendUrl = process.env.BACKEND_HOST || 'https://yareddebela.byethost22.com';
const targetHost = backendUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
const isHttps = !backendUrl.toLowerCase().startsWith('http://');

let cachedCookie = '';
let cookiePromise = null;

function getByethostCookie() {
  if (cachedCookie) return Promise.resolve(cachedCookie);
  if (cookiePromise) return cookiePromise;

  const transport = isHttps ? https : http;
  const port = isHttps ? 443 : 80;

  cookiePromise = new Promise((resolve) => {
    const req = transport.get({
      hostname: targetHost,
      port,
      path: '/aes.js',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let aesJs = '';
      res.on('data', d => aesJs += d);
      res.on('end', () => {
        transport.get({
          hostname: targetHost,
          port,
          path: '/',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }, (res2) => {
          let html = '';
          res2.on('data', d => html += d);
          res2.on('end', () => {
            const match = html.match(/<script>(.*?)<\/script>/s);
            if (!match) {
              cookiePromise = null;
              return resolve('');
            }
            try {
              const sandbox = { document: { cookie: '' }, location: { href: '' } };
              vm.runInNewContext(aesJs + ';' + match[1], sandbox);
              cachedCookie = sandbox.document.cookie.split(';')[0];
              cookiePromise = null;
              resolve(cachedCookie);
            } catch (err) {
              cookiePromise = null;
              resolve('');
            }
          });
        }).on('error', () => {
          cookiePromise = null;
          resolve('');
        });
      });
    });

    req.on('error', () => {
      cookiePromise = null;
      resolve('');
    });
  });

  return cookiePromise;
}

function extractXsrfToken(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function getRawBody(req) {
  if (!req.method || ['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) {
    return Buffer.alloc(0);
  }

  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') return Buffer.from(req.body);
    return Buffer.from(JSON.stringify(req.body));
  }

  if (req.readableEnded) {
    return Buffer.alloc(0);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    const timeout = setTimeout(() => {
      resolve(Buffer.concat(chunks));
    }, 5000);

    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks));
    });
    req.on('error', err => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function resolveTargetPath(req) {
  const reqUrl = req.url || '/';
  const url = new URL(reqUrl, 'http://localhost');
  let proxyPath = url.searchParams.get('proxy_path') || (req.query && req.query.proxy_path);

  if (proxyPath) {
    if (Array.isArray(proxyPath)) proxyPath = proxyPath.join('/');
    url.searchParams.delete('proxy_path');
    const qs = url.searchParams.toString();
    return '/' + proxyPath.replace(/^\/+/, '') + (qs ? '?' + qs : '');
  }

  return reqUrl;
}

async function sendRequestToBackend(targetPath, method, clientHeaders, bodyBuffer, retryCount = 0) {
  const cookie = await getByethostCookie();

  return new Promise((resolve, reject) => {
    const clientCookie = clientHeaders['cookie'] || '';
    const combinedCookie = clientCookie
      ? (cookie ? `${clientCookie}; ${cookie}` : clientCookie)
      : cookie;

    // Use a stateful origin recognized by Laravel Sanctum so sessions and CSRF cookies are created and validated
    const statefulOrigin = process.env.SANCTUM_ORIGIN || 'http://localhost:5173';

    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Host': targetHost,
      'Accept': clientHeaders['accept'] || 'application/json, text/plain, */*',
      'X-Requested-With': clientHeaders['x-requested-with'] || 'XMLHttpRequest',
      'Origin': statefulOrigin,
      'Referer': `${statefulOrigin}/`,
    };

    if (combinedCookie) reqHeaders['Cookie'] = combinedCookie;
    if (clientHeaders['content-type']) reqHeaders['Content-Type'] = clientHeaders['content-type'];
    if (clientHeaders['authorization']) reqHeaders['Authorization'] = clientHeaders['authorization'];

    // Forward client's X-XSRF-TOKEN or extract from Cookie if missing
    const xsrfToken = clientHeaders['x-xsrf-token'] || extractXsrfToken(clientCookie);
    if (xsrfToken) {
      reqHeaders['X-XSRF-TOKEN'] = xsrfToken;
    }

    if (bodyBuffer && bodyBuffer.length > 0) {
      reqHeaders['Content-Length'] = bodyBuffer.length;
    }

    const transport = isHttps ? https : http;
    const port = isHttps ? 443 : 80;

    const req = transport.request({
      hostname: targetHost,
      port,
      path: targetPath,
      method: method || 'GET',
      headers: reqHeaders
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', async () => {
        const resBody = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';

        // If ByetHost responded with an aes.js challenge, reset cookie and retry once
        if (contentType.includes('text/html') && resBody.toString('utf8').includes('aes.js') && retryCount < 2) {
          cachedCookie = '';
          try {
            const retryRes = await sendRequestToBackend(targetPath, method, clientHeaders, bodyBuffer, retryCount + 1);
            return resolve(retryRes);
          } catch (retryErr) {
            return reject(retryErr);
          }
        }

        resolve({
          statusCode: res.statusCode || 200,
          headers: res.headers,
          body: resBody
        });
      });
    });

    req.on('error', reject);
    if (bodyBuffer && bodyBuffer.length > 0) {
      req.write(bodyBuffer);
    }
    req.end();
  });
}

export default async function handler(req, res) {
  // CORS configuration allowing credentials
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const targetPath = resolveTargetPath(req);

  if (!targetPath || targetPath === '/' || targetPath === '/api/proxy') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', message: 'PeerBridge Vercel API Proxy is operational' }));
  }

  try {
    const bodyBuffer = await getRawBody(req);
    const backendRes = await sendRequestToBackend(targetPath, req.method, req.headers, bodyBuffer);

    // Forward Set-Cookie headers properly to client without backend host domain restrictions
    if (backendRes.headers['set-cookie']) {
      const cookies = Array.isArray(backendRes.headers['set-cookie'])
        ? backendRes.headers['set-cookie']
        : [backendRes.headers['set-cookie']];

      const sanitizedCookies = cookies.map(c =>
        c.replace(/;\s*domain=[^;]+/gi, '')
      );
      res.setHeader('Set-Cookie', sanitizedCookies);
    }

    const outHeaders = {};
    if (backendRes.headers['content-type']) {
      outHeaders['Content-Type'] = backendRes.headers['content-type'];
    }
    if (backendRes.headers['cache-control']) {
      outHeaders['Cache-Control'] = backendRes.headers['cache-control'];
    }

    res.writeHead(backendRes.statusCode, outHeaders);
    res.end(backendRes.body);
  } catch (err) {
    console.error('API Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bad Gateway',
      message: 'Failed to proxy request to backend',
      details: err.message
    }));
  }
}
