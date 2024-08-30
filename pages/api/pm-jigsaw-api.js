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
    const startDate = new Date(currentYear, 6, 1); // July 1st of current year

    const [rows] = await dbConnection.execute(`
      SELECT 
          r.unit_id,
          r.date,
          e_problem.name AS problem,
          e_device.name AS device
      FROM 
          report r
      JOIN 
          enum e_problem ON r.problem = e_problem.id AND e_problem.id = 39
      JOIN 
          enum e_device ON r.device_id = e_device.id AND e_device.id = 1
      WHERE
          r.date >= ?
      ORDER BY
          r.date ASC
    `, [startDate.toISOString().split('T')[0]]);

    const groupedData = {};
    const globalUniqueUnits = new Set();

    rows.forEach(row => {
      const date = new Date(row.date);
      const month = date.getMonth();
      const dayOfMonth = date.getDate();
      let week;
      
      if (dayOfMonth <= 7) week = 1;
      else if (dayOfMonth <= 14) week = 2;
      else if (dayOfMonth <= 21) week = 3;
      else week = 4;
      
      if (!groupedData[month]) {
        groupedData[month] = { mtd: new Set(), weeks: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() } };
      }

      if (!globalUniqueUnits.has(row.unit_id)) {
        groupedData[month].mtd.add(row.unit_id);
        groupedData[month].weeks[week].add(row.unit_id);
        globalUniqueUnits.add(row.unit_id);
      }
    });

    // Convert Sets to counts
    Object.keys(groupedData).forEach(month => {
      groupedData[month].mtd = groupedData[month].mtd.size;
      Object.keys(groupedData[month].weeks).forEach(week => {
        groupedData[month].weeks[week] = groupedData[month].weeks[week].size;
      });
    });
    res.status(200).json(groupedData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await dbConnection.end();
  }
}