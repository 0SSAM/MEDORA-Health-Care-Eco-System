import autocannon from 'autocannon';

async function runLoadTest() {
  console.log('🚀 Starting MEDORA Production Load Test...');
  
  const url = 'http://localhost:4173'; // Production build preview port
  
  const result = await autocannon({
    url,
    connections: 100, // 100 concurrent connections
    duration: 30,     // 30 seconds
    pipelining: 1,
    title: 'MEDORA Peak Load Stress Test',
    requests: [
      {
        method: 'GET',
        path: '/',
      },
      {
        method: 'GET',
        path: '/auth.me', // Check auth endpoint resilience
      }
    ]
  });

  console.log('📊 Load Test Results:');
  console.log(`- Total Requests: ${result.requests.total}`);
  console.log(`- Total Duration: ${result.duration}s`);
  console.log(`- Average Latency: ${result.latency.average}ms`);
  console.log(`- Max Latency: ${result.latency.max}ms`);
  console.log(`- Throughput: ${result.throughput.average / 1024 / 1024} MB/s`);
  console.log(`- Errors: ${result.errors}`);
  console.log(`- Non-2xx Responses: ${result.non2xx}`);

  if (result.errors > 0 || result.non2xx > result.requests.total * 0.05) {
    console.error('❌ System failed to maintain stability under peak load.');
    process.exit(1);
  } else {
    console.log('✅ System resilient under peak load.');
  }
}

runLoadTest().catch(console.error);
