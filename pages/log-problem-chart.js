import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import Layout from '../components/Layout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartDataLabels
);

const CustomLegend = ({ data }) => {
  if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 text-xs">
      {data.labels.map((label, index) => (
        <div key={index} className="flex justify-between items-center mb-1 p-1 rounded hover:bg-gray-100 transition-colors duration-200">
          <span style={{ color: data.datasets[0].backgroundColor[index] }}>●</span>
          <span className="flex-grow ml-1 truncate">{label}</span>
          <span className="font-bold ml-1">{data.datasets[0].data[index]}</span>
        </div>
      ))}
    </div>
  );
};

export default function UnitStatusChart() {
  const [chartData, setChartData] = useState({datasets: []});
  const [mtdData, setMtdData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    setStartDate(formatDate(sevenDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAllData(startDate, endDate);
      fetchMTDData().then(setMtdData).catch(() => setError('Failed to load MTD data'));
    }
  }, [startDate, endDate]);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchAllData = async (start, end) => {
    setLoading(true);
    setError('');
    try {
      const [synSentResponse, noCommResponse, gpsResponse] = await Promise.all([
        fetch(`/api/unitData?startDate=${start}&endDate=${end}`),
        fetch(`/api/noCommData?startDate=${start}&endDate=${end}`),
        fetch(`/api/gpsData?startDate=${start}&endDate=${end}`)
      ]);

      if (!synSentResponse.ok || !noCommResponse.ok || !gpsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const synSentData = await synSentResponse.json();
      const noCommData = await noCommResponse.json();
      const gpsData = await gpsResponse.json();

      // Combine the data
      const allDates = [...new Set([
        ...synSentData.map(d => d.date),
        ...noCommData.map(d => d.date),
        ...gpsData.map(d => d.date)
      ])].sort();

      const combinedData = allDates.map(date => {
        return {
          date: new Date(date),
          synSent: synSentData.find(d => d.date === date)?.unit_count || 0,
          noComm: noCommData.find(d => d.date === date)?.unit_count || 0,
          gps: gpsData.find(d => d.date === date)?.unit_count || 0
        };
      });

      setChartData({
        labels: combinedData.map(d => d.date),
        datasets: [
          {
            label: 'No Route to Host',
            data: combinedData.map(d => d.synSent),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          },
          {
            label: 'NoComm',
            data: combinedData.map(d => d.noComm),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          },
          {
            label: 'GPS',
            data: combinedData.map(d => d.gps),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMTDData = async () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDate = formatDate(firstDayOfMonth);
    const endDate = formatDate(today);

    try {
      const [synSentResponse, noCommResponse, gpsResponse] = await Promise.all([
        fetch(`/api/unitData?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/noCommData?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/gpsData?startDate=${startDate}&endDate=${endDate}`)
      ]);

      if (!synSentResponse.ok || !noCommResponse.ok || !gpsResponse.ok) {
        throw new Error('Failed to fetch MTD data');
      }

      const synSentData = await synSentResponse.json();
      const noCommData = await noCommResponse.json();
      const gpsData = await gpsResponse.json();

      return {
        synSent: synSentData.reduce((sum, day) => sum + day.unit_count, 0),
        noComm: noCommData.reduce((sum, day) => sum + day.unit_count, 0),
        gps: gpsData.reduce((sum, day) => sum + day.unit_count, 0)
      };
    } catch (err) {
      console.error('Error fetching MTD data:', err);
      throw err;
    }
  };

  const prepareMTDChartData = (mtdData) => {
    if (!mtdData) return { datasets: [] };

    const colors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)'
    ];

    return {
      labels: ['No Route to Host', 'NoComm', 'GPS'],
      datasets: [{
        data: [mtdData.synSent, mtdData.noComm, mtdData.gps],
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
        hoverBackgroundColor: colors.map(color => color.replace('0.6', '0.8')),
        hoverBorderColor: colors.map(color => color.replace('0.6', '1')),
        hoverBorderWidth: 2,
      }]
    };
  };


  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      datalabels: {
        anchor: 'end',
        align: 'top',
        offset: 10,
        formatter: (value) => value || '',
        font: { weight: 'bold' },
        display: function(context) {
          return context.dataset.data[context.dataIndex] > 0;
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: { 
        type: 'time',
        time: { 
          unit: 'day',
          displayFormats: { day: 'MMM d' }
        },
        adapters: { date: { locale: enUS } },
        title: { display: true, text: 'DATE' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Units' },
        ticks: { stepSize: 1 },
        grid: { display: false }
      }
    },
    layout: {
      padding: {
        top: 30
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    animation: {
      duration: 1000,
    },
  };

  const mtdOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: { size: 11, weight: 'bold' },
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((acc, curr) => acc + curr, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return percentage > 5 ? `${percentage}%` : '';
        },
        align: 'center',
        anchor: 'center',
      }
    },
    cutout: '60%',
    radius: '90%',
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    animation: {
      animateRotate: true,
      animateScale: true
    },
  };

  const getCurrentMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getMonth()];
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Log Problem Jigsaw</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4 flex flex-wrap space-x-4">
          <div className="mb-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input 
              type="date" 
              id="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input 
              type="date" 
              id="endDate"
              value={endDate}
              onChange={handleEndDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          </div>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div className="flex flex-wrap -mx-2">
            <div className="w-full lg:w-2/3 px-2">
              {chartData.datasets.length > 0 && (
                <div className="mb-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300" style={{ height: '400px' }}>
                  <h2 className="text-xl font-semibold mb-2">Log Problem</h2>
                  <Bar options={{...options, maintainAspectRatio: false}} data={chartData} />
                </div>
              )}
            </div>
            <div className="w-full lg:w-1/3 px-2">
              {mtdData && (
                <div className="mb-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                  <h2 className="text-lg font-semibold mb-2">MTD Log Problem - {getCurrentMonth()}</h2>
                  <div className="flex flex-col">
                    <div style={{ height: '200px' }}>
                      <Doughnut options={mtdOptions} data={prepareMTDChartData(mtdData)} />
                    </div>
                    <CustomLegend data={prepareMTDChartData(mtdData)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}