import http from 'node:http';
import vm from 'node:vm';

export const config = {
  api: {
    bodyParser: false,
  },
};

const targetDomain = process.env.BACKEND_HOST || 'yareddebela.byethost22.com';
let cachedCookie = '';
let cookiePromise = null;

function getByethostCookie() {
  if (cachedCookie) return Promise.resolve(cachedCookie);
  if (cookiePromise) return cookiePromise;

  cookiePromise = new Promise((resolve, reject) => {
    const req = http.get('http://' + targetDomain + '/aes.js', (res) => {
      let aesJs = '';
      res.on('data', d => aesJs += d);
      res.on('end', () => {
        http.get({
          hostname: targetDomain,
          port: 80,
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
              return reject(new Error('ByetHost challenge script not found'));
            }
            try {
              const sandbox = { document: { cookie: '' }, location: { href: '' } };
              vm.runInNewContext(aesJs + ';' + match[1], sandbox);
              cachedCookie = sandbox.document.cookie.split(';')[0];
              cookiePromise = null;
              resolve(cachedCookie);
            } catch (err) {
              cookiePromise = null;
              reject(err);
            }
          });
        }).on('error', (err) => {
          cookiePromise = null;
          reject(err);
        });
      });
    });
    req.on('error', (err) => {
      cookiePromise = null;
      reject(err);
    });
  });

  return cookiePromise;
}

async function getRawBody(req) {
  if (req.body) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') return Buffer.from(req.body);
    return Buffer.from(JSON.stringify(req.body));
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function resolveTargetPath(reqUrl) {
  const url = new URL(reqUrl, 'http://localhost');
  if (url.searchParams.has('proxy_path')) {
    const proxyPath = url.searchParams.get('proxy_path') || '';
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
    const combinedCookie = clientCookie ? `${clientCookie}; ${cookie}` : cookie;

    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Host': targetDomain,
      'Cookie': combinedCookie,
      'Accept': clientHeaders['accept'] || 'application/json, text/plain, */*',
      'X-Requested-With': clientHeaders['x-requested-with'] || 'XMLHttpRequest'
    };

    if (clientHeaders['content-type']) reqHeaders['content-type'] = clientHeaders['content-type'];
    if (clientHeaders['authorization']) reqHeaders['authorization'] = clientHeaders['authorization'];
    if (clientHeaders['x-xsrf-token']) reqHeaders['x-xsrf-token'] = clientHeaders['x-xsrf-token'];
    if (bodyBuffer && bodyBuffer.length > 0) reqHeaders['content-length'] = bodyBuffer.length;

    const req = http.request({
      hostname: targetDomain,
      port: 80,
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
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    return res.end();
  }

  const targetPath = resolveTargetPath(req.url);

  if (!targetPath || targetPath === '/' || targetPath === '/api/proxy') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', message: 'PeerBridge Vercel API Proxy is operational' }));
  }

  try {
    const bodyBuffer = await getRawBody(req);
    const backendRes = await sendRequestToBackend(targetPath, req.method, req.headers, bodyBuffer);

    const outHeaders = {};
    if (backendRes.headers['content-type']) {
      outHeaders['Content-Type'] = backendRes.headers['content-type'];
    }
    if (backendRes.headers['set-cookie']) {
      outHeaders['Set-Cookie'] = backendRes.headers['set-cookie'];
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
