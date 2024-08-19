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
      SELECT DATE(date_time) AS date, COUNT(DISTINCT id_unit) as unit_count
      FROM (
        SELECT id_unit, DATE(date_time) AS date_time
        FROM display_status
        WHERE status = 'SYN_SENT'
          AND DATE(date_time) BETWEEN ? AND ?
        GROUP BY id_unit, DATE(date_time)
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