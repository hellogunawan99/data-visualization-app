import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const { startDate, endDate } = req.query;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST_4,
      user: process.env.DB_USER_4,
      password: process.env.DB_PASSWORD_4,
      database: process.env.DB_NAME_4,
      connectTimeout: 10000 // 10 seconds
    });

    // Function to convert UTC date to UTC+8
    function convertToUTC8(dateString) {
      const date = new Date(dateString);
      return new Date(date.getTime() + (8 * 60 * 60 * 1000));
    }

    // Convert input dates to UTC+8
    const utc8StartDate = convertToUTC8(startDate);
    const utc8EndDate = convertToUTC8(endDate);

    const [rows] = await connection.execute(`
      SELECT 
        DATE(CONVERT_TZ(r.date, '+00:00', '+08:00')) AS date,
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
        r.problem = 37
        AND DATE(CONVERT_TZ(r.date, '+00:00', '+08:00')) BETWEEN ? AND ?
      ORDER BY 
        r.date
    `, [utc8StartDate.toISOString().split('T')[0], utc8EndDate.toISOString().split('T')[0]]);

    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}