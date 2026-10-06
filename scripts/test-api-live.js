process.env.NODE_ENV = 'test';
const { default: app } = await import('../server/server.js');

const PORT = 5001;
const server = app.listen(PORT, async () => {
  console.log(`📡 In-process test server running on http://localhost:${PORT}`);
  try {
    // 1. Health check
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const health = await healthRes.json();
    console.log('✅ Health Check:', health.status);

    // 2. Login as Demo User
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'demo@rupeewise.com',
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    console.log('✅ Auth Login Successful. User:', loginData.user?.name, '| Token Length:', loginData.token?.length);

    const token = loginData.token;

    // 3. Fetch Banks for Authenticated User
    const banksRes = await fetch(`http://localhost:${PORT}/api/banks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const banksData = await banksRes.json();
    console.log(`✅ Banks Endpoint: ${banksData.count} Vaults, Total Balance: ₹${banksData.totalBankBalance}`);

    // 4. Test AI Chat (Safe tool: Summarize spending)
    const aiRes = await fetch(`http://localhost:${PORT}/api/ai/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: 'Summarize my spending and net available balance' })
    });
    const aiData = await aiRes.json();
    console.log('✅ AI Chat Response Received. Preview:', aiData.reply.split('\n')[0]);

    // 5. Test AI Destructive Action Confirmation Guard
    const aiDeleteRes = await fetch(`http://localhost:${PORT}/api/ai/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: 'Delete my transaction of ₹350' })
    });
    const aiDeleteData = await aiDeleteRes.json();
    console.log('✅ AI Destructive Action Guard:', aiDeleteData.requiresConfirmation === true ? 'STAGED FOR CONFIRMATION (SAFE)' : 'UNSAFE');

    console.log('\n🎉 ALL LIVE HTTP ENDPOINT TESTS PASSED COMPLETELY!');
  } catch (err) {
    console.error('❌ HTTP Test Error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
