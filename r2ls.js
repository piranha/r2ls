function humanBytes(x) {
  if (x < 1024) return x + ' B';
  for (var i = 0; x > 1024; i++) {
    x = x / 1024;
  }
  var size = " KMGTPE"[i];
  return `${x.toFixed(1)} ${size}B`;
}


function makeRangeHeader({range, size}) {
  return `bytes ${range.offset}-${range.offset + range.length - 1}/${size}`;
}


/// Responses

async function fileRes(bucket, req, key) {
  if (key[key.length-1] == '/')
    return;

  var obj;
  if (req.method == 'GET') {
    obj = await bucket.get(key, {range: req.headers});
  } else {
    obj = await bucket.head(key);
  }

  if (!obj)
    return;

  var fn = obj.key.slice(obj.key.lastIndexOf('/') + 1);
  var headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  if (obj.range)
    headers.set('content-range', makeRangeHeader(obj));
  if (req.method == 'GET')
    headers.set('content-disposition', `attachment; filename="${fn}"`);

  const status = obj.body ? (req.headers.get('range') ? 206 : 200) : 304;
  return new Response(obj.body, {status, headers});
}


async function lsRes(bucket, req, key) {
  if (!key)
    return;
  if (key[key.length-1] != '/')
    key += '/';

  var res = await bucket.list({prefix: key,
                               include: ['customMetadata']});

  if (!res.objects.length)
    return;

  var files = res.objects
      .filter(f => f.key[f.key.length-1] != '/')
      .sort((a, b) => {
        a.key.localeCompare(b.key);
      });

  var html = `<html><body><meta charset="utf-8">
  <style>
  table { text-align: left; }
  td, th { padding: 0.4rem 0.8rem; }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      [].forEach.call(document.querySelectorAll('time'), function(t) {
        var d = new Date(t.innerText);
        t.innerText = d.toLocaleString();
      });
    });
  </script>
  <table>
    <tr><th>Name</th><th>Size</th><th>Date</th></tr>
    ${files.map(f => `<tr>
      <td><a href="/${f.key}" download>${f.key.slice(key.length)}</a></td>
      <td align=right title="${f.size}">${humanBytes(f.size)}</td>
      <td><time>${new Date(f.uploaded)}</time></td>
      </tr>`).join('\n')}
  </table>`;

  return new Response(html, {
    status: 200,
    headers: {'Content-Type': 'text/html'}
  });
}


export default {
  async fetch(req, env, ctx) {
    var url = new URL(req.url);
    var key = url.pathname.slice(1);

    switch (req.method) {
    case 'OPTIONS':
      return new Response(null, {headers: {Allow: 'HEAD, GET, OPTIONS'}});
    case 'HEAD':
    case 'GET':
      return (await fileRes(env.R2BUCKET, req, key) ||
              await lsRes(env.R2BUCKET, req, key) ||
              new Response('Not Found', {status: 404}));
    default:
      return new Response('Method not allowed',
                          {status: 405,
                           headers: {Allow: 'HEAD, GET, OPTIONS'}});
    }
  },
};
