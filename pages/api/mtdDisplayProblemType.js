import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST_4,
      user: process.env.DB_USER_4,
      password: process.env.DB_PASSWORD_4,
      database: process.env.DB_NAME_4,
      connectTimeout: 10000 // 10 seconds
    });

    function getUTC8Date(date = new Date()) {
      return new Date(date.getTime() + (8 * 60 * 60 * 1000));
    }

    const today = getUTC8Date();
    const firstDayOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const startDate = firstDayOfMonth.toISOString().slice(0, 19).replace('T', ' ');
    const endDate = today.toISOString().slice(0, 19).replace('T', ' ');

    const [rows] = await connection.execute(`
      SELECT 
        r.date,
        r.unit_id,
        e1.name AS analysis,
        e2.name AS problem
      FROM 
        report r
      LEFT JOIN 
        enum e1 ON r.analysis = e1.id
      LEFT JOIN 
        enum e2 ON r.problem = e2.id
      WHERE 
        r.problem = 434
        AND r.date >= ? AND r.date <= ?
      ORDER BY 
        r.date DESC
    `, [startDate, endDate]);

    await connection.end();

    res.status(200).json(rows.map(row => ({
      ...row,
      date: getUTC8Date(new Date(row.date)).toISOString()
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch MTD data', details: error.message });
  }
}