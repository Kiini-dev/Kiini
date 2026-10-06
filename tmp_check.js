const mysql = require('mysql2/promise');
(async()=>{
  console.log('NODE sees DATABASE_URL=', process.env.DATABASE_URL);
  try{
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await conn.execute("SHOW COLUMNS FROM payments LIKE 'organizationId'");
    console.log('ROWS:', JSON.stringify(rows));
    await conn.end();
  }catch(e){
    console.error('ERR:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
