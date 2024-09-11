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
    const startDate = new Date(currentYear, 6, 1); // 1 Juli tahun berjalan

    // Query untuk menghitung total unit terinstall
    const [totalInstalled] = await dbConnection.execute(`
      SELECT COUNT(DISTINCT unit_id) as total_installed
      FROM unit_pm
      WHERE status = 0 AND device_id = 1 AND updated_at < ?
    `, [new Date(currentYear + 1, 0, 1).toISOString().split('T')[0]]);

    const totalInstalledUnits = totalInstalled[0].total_installed;
    const baseMonthlyPlan = Math.floor(totalInstalledUnits / 6);
    const remainder = totalInstalledUnits % 6;

    // Query untuk data aktual
    const [rows] = await dbConnection.execute(`
      SELECT 
          MONTH(r.date) as month,
          CEIL(DAY(r.date) / 7) as week,
          COUNT(DISTINCT r.unit_id) as actual
      FROM 
          report r
      JOIN 
          enum e_problem ON r.problem = e_problem.id AND e_problem.id = 39
      JOIN 
          enum e_device ON r.device_id = e_device.id AND e_device.id = 1
      WHERE
          r.date >= ? AND r.date < ?
      GROUP BY
          MONTH(r.date), CEIL(DAY(r.date) / 7)
      ORDER BY
          MONTH(r.date), CEIL(DAY(r.date) / 7)
    `, [startDate.toISOString().split('T')[0], new Date(currentYear + 1, 0, 1).toISOString().split('T')[0]]);

    const groupedData = {};
    let remainingUnits = totalInstalledUnits;

    // Inisialisasi dan proses data
    for (let i = 6; i <= 11; i++) {
      const initialMonthlyPlan = i < 6 + remainder ? baseMonthlyPlan + 1 : baseMonthlyPlan;
      let monthlyActual = 0;
      
      // Hitung actual untuk bulan ini
      rows.filter(row => row.month === i + 1).forEach(row => {
        monthlyActual += row.actual;
      });

      // Hitung adjusted plan
      const adjustedPlan = Math.min(remainingUnits, initialMonthlyPlan);

      groupedData[i] = {
        mtd: { 
          initialPlan: initialMonthlyPlan,
          adjustedPlan: adjustedPlan,
          actual: monthlyActual
        },
        weeks: {}
      };

      // Proses data mingguan
      const weeklyPlan = Math.ceil(adjustedPlan / 4);
      for (let week = 1; week <= 4; week++) {
        const weeklyData = rows.find(row => row.month === i + 1 && row.week === week);
        const weeklyActual = weeklyData ? weeklyData.actual : 0;
        const remainingWeeklyPlan = week === 4 ? adjustedPlan - (weeklyPlan * 3) : weeklyPlan;
        
        groupedData[i].weeks[week] = {
          plan: remainingWeeklyPlan,
          actual: weeklyActual
        };
      }

      remainingUnits = Math.max(0, remainingUnits - monthlyActual);
    }

    res.status(200).json({ 
      monthlyData: groupedData, 
      totalInstalledUnits,
      baseMonthlyPlan,
      remainder
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await dbConnection.end();
  }
}