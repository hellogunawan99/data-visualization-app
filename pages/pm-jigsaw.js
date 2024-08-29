import React from 'react';
import Layout from '../components/Layout';

const months = ['July', 'August', 'September', 'October', 'November', 'December'];
const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

const data = {
  monthly: [
    { plan: 95, actual: 119 },
    { plan: 95, actual: 130 },
    { plan: 95, actual: 100 },
    { plan: 95, actual: 0 },
    { plan: 95, actual: 0 },
    { plan: 99, actual: 0 },
  ],
  weekly: [
    [
      { plan: 24, actual: 31 },
      { plan: 24, actual: 25 },
      { plan: 24, actual: 33 },
      { plan: 20, actual: 32 },
    ],
    [
      { plan: 24, actual: 37 },
      { plan: 24, actual: 38 },
      { plan: 24, actual: 37 },
      { plan: 20, actual: 27 },
    ],
    [
      { plan: 24, actual: 0 },
      { plan: 24, actual: 0 },
      { plan: 24, actual: 0 },
      { plan: 20, actual: 0 },
    ],
    [
      { plan: 24, actual: 0 },
      { plan: 24, actual: 0 },
      { plan: 24, actual: 0 },
      { plan: 20, actual: 0 },
    ],
    [
      { plan: 24, actual: 0 },
      { plan: 24, actual: 0 },
      { plan: 24, actual: 0 },
      { plan: 20, actual: 0 },
    ],
    [
      { plan: 25, actual: 0 },
      { plan: 25, actual: 0 },
      { plan: 25, actual: 0 },
      { plan: 24, actual: 0 },
    ],
  ],
};

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
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">MTD Report</h1>
        <div className="overflow-x-auto">
          <div className="mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-green-500 text-white">
                  <th className="p-1 border border-gray-300"></th>
                  {months.map((month) => (
                    <th key={month} colSpan="3" className="p-1 border border-gray-300">
                      {month}
                    </th>
                  ))}
                </tr>
                <tr className="bg-green-500 text-white">
                  <th className="p-1 border border-gray-300"></th>
                  {months.map(() => (
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
                  {data.monthly.map(({ plan, actual }, index) => (
                    <React.Fragment key={`mtd-${index}`}>
                      <td className="p-1 text-center border border-gray-300">{plan}</td>
                      <td className="p-1 text-center border border-gray-300">{actual}</td>
                      <AchievementCell achievement={calculateAchievement(plan, actual)} />
                    </React.Fragment>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-green-500 text-white">
                  <th className="p-1 border border-gray-300">Type Unit</th>
                  {months.map((month) => (
                    <th key={month} colSpan="3" className="p-1 border border-gray-300">
                      {month}
                    </th>
                  ))}
                </tr>
                <tr className="bg-green-500 text-white">
                  <th className="p-1 border border-gray-300"></th>
                  {months.map(() => (
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
                    {data.weekly.map((monthData, monthIndex) => (
                      <React.Fragment key={`week-${weekIndex}-month-${monthIndex}`}>
                        <td className="p-1 text-center border border-gray-300">{monthData[weekIndex].plan}</td>
                        <td className="p-1 text-center border border-gray-300">{monthData[weekIndex].actual}</td>
                        <AchievementCell
                          achievement={calculateAchievement(
                            monthData[weekIndex].plan,
                            monthData[weekIndex].actual
                          )}
                        />
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MTDTable;