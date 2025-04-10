import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const { startDate, endDate } = req.query;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(`
      SELECT DATE(date) AS date, COUNT(DISTINCT id_unit) as unit_count 
      FROM (
        SELECT id_unit, DATE(date) AS date
        FROM log_nrt
        WHERE status = 'SYN_SENT' 
        AND DATE(date) BETWEEN ? AND ?
        GROUP BY id_unit, DATE(date)
        HAVING COUNT(*) >= 2
      ) AS subquery
      GROUP BY date
      ORDER BY date
    `, [startDate, endDate]);

    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}