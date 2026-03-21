const http = require('http');

http.get('http://bricks.112.213.33.182.sslip.io/api/templates', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const templates = JSON.parse(data);
      console.log('Found templates:', templates.length);
      templates.forEach(t => {
        console.log('Deleting template:', t.title, t.id);
        const req = http.request({
          hostname: 'bricks.112.213.33.182.sslip.io',
          path: `/api/templates/${t.id}`,
          method: 'DELETE'
        }, (delRes) => {
          console.log(`Deleted ${t.id} with status ${delRes.statusCode}`);
        });
        req.on('error', console.error);
        req.end();
      });
    } catch (e) {
      console.error('Parse error:', e);
    }
  });
}).on('error', console.error);
