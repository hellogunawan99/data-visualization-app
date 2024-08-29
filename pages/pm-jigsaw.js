import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const monthNames = ['July', 'August', 'September', 'October', 'November', 'December'];
const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

const calculateAchievement = (plan, actual) => {
  if (plan === 0) return 0;
  return Math.round((100 / plan) * actual);
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
  const [mtdData, setMtdData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/pm-jigsaw-api');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setMtdData(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">MTD Table (July - December)</h1>
        <div className="overflow-x-auto">
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
                  const monthIndex = index + 6; // July is 6, August is 7, etc.
                  const plan = 95; // Assuming a fixed plan of 95 for each month
                  const actual = mtdData[monthIndex]?.mtd || 0;
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
        <div className="mt-4">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="p-1 border border-gray-300">Type Unit</th>
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
                    const actualMonthIndex = monthIndex + 6;
                    const plan = 24; // Plan is always 24, including Week 4
                    const actual = mtdData[actualMonthIndex]?.weeks?.[weekIndex + 1] || 0;
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
      </div>
    </Layout>
  );
};

export default MTDTable;