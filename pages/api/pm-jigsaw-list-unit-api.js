import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const dbConnection = await mysql.createConnection({
    host: process.env.DB_HOST_3,
    user: process.env.DB_USER_3,
    password: process.env.DB_PASSWORD_3,
    database: process.env.DB_NAME_3,
  });

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    let startDate, endDate, checkDate;
    if (currentMonth < 6) {
      // Period 1: January to June
      startDate = `${currentYear}-01-01`;
      endDate = `${currentYear}-07-01`;
      checkDate = '01-01';
    } else {
      // Period 2: July to December
      startDate = `${currentYear}-07-01`;
      endDate = `${currentYear + 1}-01-01`;
      checkDate = '07-01';
    }

    const query = `
      SELECT DISTINCT unit_id
      FROM unit_pm
      WHERE
          status = 0
          AND device_id = 1
          AND updated_at >= ?
          AND updated_at < ?
          AND DATE_FORMAT(updated_at, '%m-%d') = ?
      ORDER BY unit_id ASC
    `;

    const [rows] = await dbConnection.execute(query, [startDate, endDate, checkDate]);

    const unitList = rows.map(row => row.unit_id);

    res.status(200).json({ unitList });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await dbConnection.end();
  }
}