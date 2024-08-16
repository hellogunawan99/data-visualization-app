import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const { startDate, endDate } = req.query;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST_2,
      user: process.env.DB_USER_2,
      password: process.env.DB_PASSWORD_2,
      database: process.env.DB_NAME_2,
    });

    const [rows] = await connection.execute(`
      SELECT DATE(date_job) AS date, COUNT(DISTINCT id_unit) as unit_count
      FROM tb_job_list_jigsaw
      WHERE problem = 'GPS'
        AND DATE(date_job) BETWEEN ? AND ?
      GROUP BY DATE(date_job)
      ORDER BY date
    `, [startDate, endDate]);

    await connection.end();

    console.log('API response (GPS):', rows);

    res.status(200).json(rows);
  } catch (error) {
    console.error('API error (GPS):', error);
    res.status(500).json({ error: 'Failed to fetch GPS data' });
  }
}