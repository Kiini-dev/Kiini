import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'localhost', port: 3307,
  user: 'kiini_user', password: 'tjwzT9pW;NGYq1QxSq0B',
  database: 'kiini-one-hub-total-control'
});

const from = new Date('2026-03-01T00:00:00.000Z');
const to = new Date('2026-03-20T00:00:00.000Z');

console.log('Testing getRevenueByClient query...');
try {
  const [rows] = await conn.query(
    'SELECT `invoices`.`clientId`, `clients`.`companyName`, SUM(`invoices`.`total`) AS total FROM `invoices` LEFT JOIN `clients` ON `invoices`.`clientId` = `clients`.`id` WHERE `invoices`.`createdAt` BETWEEN ? AND ? GROUP BY `invoices`.`clientId`, `clients`.`companyName` ORDER BY total DESC',
    [from, to]
  );
  console.log('✅ Query succeeded:', rows);
} catch (e) {
  console.error('❌ Query failed:', e.message);
}

console.log('\nTesting getRevenueByService query...');
try {
  const [rows] = await conn.query(
    'SELECT `invoiceItems`.`itemId`, `services`.`name`, SUM(`invoiceItems`.`total`) AS total FROM `invoiceItems` LEFT JOIN `services` ON `invoiceItems`.`itemId` = `services`.`id` LEFT JOIN `invoices` ON `invoiceItems`.`invoiceId` = `invoices`.`id` WHERE `invoices`.`createdAt` BETWEEN ? AND ? AND `invoiceItems`.`itemType` = ? GROUP BY `invoiceItems`.`itemId`, `services`.`name` ORDER BY total DESC',
    [from, to, 'service']
  );
  console.log('✅ Query succeeded:', rows);
} catch (e) {
  console.error('❌ Query failed:', e.message);
}

await conn.end();
