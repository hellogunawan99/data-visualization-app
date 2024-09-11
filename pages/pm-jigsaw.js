import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const monthNames = ['July', 'August', 'September', 'October', 'November', 'December'];
const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

const calculateAchievement = (plan, actual) => {
  if (plan === 0) return 100; // All units have been maintained
  return Math.min(100, Math.round((actual / plan) * 100)); // Cap at 100%
};

const AchievementCell = ({ achievement }) => {
  const bgColor = achievement >= 100 ? 'bg-green-500' : 'bg-red-500';
  return (
    <td className={`${bgColor} text-white font-bold p-1 text-center border border-gray-300`}>
      {achievement}%
    </td>
  );
};

const MTDTable = () => {
  const [unitList, setUnitList] = useState([]);
  const [mtdData, setMtdData] = useState({});
  const [totalInstalledUnits, setTotalInstalledUnits] = useState(0);
  const [baseMonthlyPlan, setBaseMonthlyPlan] = useState(0);
  const [remainder, setRemainder] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResponse, mtdResponse] = await Promise.all([
          fetch('/api/pm-jigsaw-list-unit-api'),
          fetch('/api/pm-jigsaw-api')
        ]);

        if (!unitResponse.ok || !mtdResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const unitData = await unitResponse.json();
        const mtdData = await mtdResponse.json();

        setUnitList(unitData.unitList || []);
        setTotalInstalledUnits(mtdData.totalInstalledUnits);
        setBaseMonthlyPlan(mtdData.baseMonthlyPlan);
        setRemainder(mtdData.remainder);

        const updatedMtdData = calculateNewPlans(mtdData.monthlyData, mtdData.totalInstalledUnits, mtdData.baseMonthlyPlan, mtdData.remainder);
        setMtdData(updatedMtdData);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateNewPlans = (data, totalUnits, baseMonthlyPlan, remainder) => {
    let remainingUnits = totalUnits;
    const updatedData = {};

    Object.keys(data).forEach((monthIndex, index) => {
      const month = parseInt(monthIndex);
      let monthlyPlan;

      if (index < 3) {
        // First three months get an extra unit from the remainder
        monthlyPlan = baseMonthlyPlan + (index < remainder ? 1 : 0);
      } else {
        // Last three months just get the base plan
        monthlyPlan = baseMonthlyPlan;
      }

      if (index === 0) {
        // First month
        updatedData[month] = {
          ...data[month],
          mtd: {
            ...data[month].mtd,
            plan: monthlyPlan
          }
        };
      } else {
        // Subsequent months
        const prevMonth = month - 1;
        const prevActual = updatedData[prevMonth].mtd.actual;
        const prevPlan = updatedData[prevMonth].mtd.plan;
        const adjustment = prevActual - prevPlan;
        const newPlan = Math.max(0, monthlyPlan - adjustment);
        updatedData[month] = {
          ...data[month],
          mtd: {
            ...data[month].mtd,
            plan: newPlan
          }
        };
      }

      // Update weekly plans
      const weeklyPlan = Math.ceil(updatedData[month].mtd.plan / 4);
      updatedData[month].weeks = {};
      for (let week = 1; week <= 4; week++) {
        updatedData[month].weeks[week] = {
          ...data[month].weeks[week],
          plan: week === 4 ? updatedData[month].mtd.plan - (weeklyPlan * 3) : weeklyPlan
        };
      }

      remainingUnits -= data[month].mtd.actual;
    });

    return updatedData;
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Preventive Maintenance Jigsaw Periode 2</h1>
        <div className="text-sm mb-4">
          <p>Total Installed Units: {totalInstalledUnits} | Base Monthly Plan: {baseMonthlyPlan} | Remainder: {remainder}</p>
          <p>Total Actual: {Object.values(mtdData).reduce((sum, month) => sum + month.mtd.actual, 0)}</p>
        </div>

        <h2 className="text-xl font-bold mb-4">MTD Table (July - December)</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="p-1 border border-gray-300"></th>
                {monthNames.map(month => (
                  <th key={month} colSpan="3" className="p-1 border border-gray-300">
                    {month}
                  </th>
                ))}
              </tr>
              <tr className="bg-green-500 text-white">
                <th className="p-1 border border-gray-300"></th>
                {monthNames.map(() => (
                  <React.Fragment key={`header-${Math.random()}`}>
                    <th className="p-1 border border-gray-300">Plan</th>
                    <th className="p-1 border border-gray-300">Actual</th>
                    <th className="p-1 border border-gray-300">Ach (%)</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold p-1 border border-gray-300">MTD</td>
                {monthNames.map((_, index) => {
                  const monthIndex = index + 6;
                  const { plan = 0, actual = 0 } = mtdData[monthIndex]?.mtd || {};
                  return (
                    <React.Fragment key={`mtd-${monthIndex}`}>
                      <td className="p-1 text-center border border-gray-300">{plan}</td>
                      <td className="p-1 text-center border border-gray-300">{actual}</td>
                      <AchievementCell achievement={calculateAchievement(plan, actual)} />
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-4">Weekly Breakdown</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="p-1 border border-gray-300">Week</th>
                {monthNames.map(month => (
                  <th key={month} colSpan="3" className="p-1 border border-gray-300">
                    {month}
                  </th>
                ))}
              </tr>
              <tr className="bg-green-500 text-white">
                <th className="p-1 border border-gray-300"></th>
                {monthNames.map(() => (
                  <React.Fragment key={`header-${Math.random()}`}>
                    <th className="p-1 border border-gray-300">Plan</th>
                    <th className="p-1 border border-gray-300">Actual</th>
                    <th className="p-1 border border-gray-300">Ach (%)</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, weekIndex) => (
                <tr key={week}>
                  <td className="font-bold p-1 border border-gray-300">{week}</td>
                  {monthNames.map((_, monthIndex) => {
                    const monthKey = monthIndex + 6;
                    const weekData = mtdData[monthKey]?.weeks?.[weekIndex + 1] || {};
                    const { plan = 0, actual = 0 } = weekData;
                    return (
                      <React.Fragment key={`week-${weekIndex}-month-${monthIndex}`}>
                        <td className="p-1 text-center border border-gray-300">{plan}</td>
                        <td className="p-1 text-center border border-gray-300">{actual}</td>
                        <AchievementCell achievement={calculateAchievement(plan, actual)} />
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-4">Unit List</h2>
        <div className="grid grid-cols-10 gap-1 text-xs">
          {unitList.map((unit, index) => (
            <div key={index} className="p-1 text-center border border-gray-300 bg-gray-100">
              {unit}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MTDTable;