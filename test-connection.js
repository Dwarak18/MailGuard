import http from 'http';

console.log('🔍 Testing MailGuard API connection...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Connection successful!');
    console.log('📊 Status Code:', res.statusCode);
    console.log('📝 Response:', data);
    console.log('🚀 Backend API is running on port 3000');
  });
});

req.on('error', (error) => {
  console.log('❌ Connection failed:', error.message);
});

req.setTimeout(5000, () => {
  console.log('⏰ Connection timeout');
  req.destroy();
});

req.end();