const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/trpc/auth.login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({input:{email:'info@kiini.africa',password:'Kiinis@@21'}})
    });
    const data = await res.text();
    console.log('status', res.status);
    console.log(data);
  } catch(e){ console.error('err', e); }
})();
