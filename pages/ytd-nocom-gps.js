import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartDataLabels
);

export default function YearToDateChart() {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalUnits, setTotalUnits] = useState({ noComm: 0, gps: 0 });

  useEffect(() => {
    fetchYearToDateData(selectedYear);
  }, [selectedYear]);

  const fetchYearToDateData = async (year) => {
    setLoading(true);
    setError('');
    try {
      const startDate = '2024-04-01'; // Always start from April 1, 2024
      const endDate = new Date().toISOString().split('T')[0]; // Today's date

      console.log(`Fetching data from April 2024 to current date: startDate: ${startDate}, endDate: ${endDate}`);

      const [noCommResponse, gpsResponse] = await Promise.all([
        fetch(`/api/noCommData?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/gpsData?startDate=${startDate}&endDate=${endDate}`)
      ]);

      if (!noCommResponse.ok) {
        throw new Error(`NoComm API error: ${noCommResponse.status} ${noCommResponse.statusText}`);
      }
      if (!gpsResponse.ok) {
        throw new Error(`GPS API error: ${gpsResponse.status} ${gpsResponse.statusText}`);
      }

      const noCommData = await noCommResponse.json();
      const gpsData = await gpsResponse.json();

      console.log('NoComm data:', noCommData);
      console.log('GPS data:', gpsData);

      const monthlyData = processMonthlyData(noCommData, gpsData);
      updateChartData(monthlyData);
      updateTotalUnits(monthlyData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (noCommData, gpsData) => {
    const monthlyMap = new Map();

    const processData = (data, type) => {
      data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { date: monthKey, noComm: 0, gps: 0 });
        }
        const monthData = monthlyMap.get(monthKey);
        monthData[type] += item.unit_count;
      });
    };

    processData(noCommData, 'noComm');
    processData(gpsData, 'gps');

    return Array.from(monthlyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const updateChartData = (monthlyData) => {
    setChartData({
      labels: monthlyData.map(d => d.date),
      datasets: [
        {
          label: 'NoComm',
          data: monthlyData.map(d => d.noComm),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        },
        {
          label: 'GPS',
          data: monthlyData.map(d => d.gps),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1
        }
      ]
    });
  };

  const updateTotalUnits = (monthlyData) => {
    const totals = monthlyData.reduce((acc, month) => ({
      noComm: acc.noComm + month.noComm,
      gps: acc.gps + month.gps
    }), { noComm: 0, gps: 0 });
    setTotalUnits(totals);
  };

  const dataLabelsConfig = {
    color: '#333',
    font: {
      weight: 'bold'
    },
    padding: 4,
    formatter: (value) => {
      if (value === 0) return '';
      return value;
    }
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      datalabels: {
        ...dataLabelsConfig,
        align: 'end',
        anchor: 'end'
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: { month: 'MMM yyyy' }
        },
        title: { display: true, text: 'Month' },
        adapters: { date: { locale: enUS } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Units' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      datalabels: {
        ...dataLabelsConfig,
        align: 'center',
        anchor: 'center'
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: { month: 'MMM' }
        },
        title: { display: true, text: 'Month' },
        adapters: { date: { locale: enUS } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Units' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Year-to-Date Problem Trends</h1>
        
        <div className="mb-6">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Total NoComm Units</h2>
            <p className="text-3xl font-bold text-gray-900">{totalUnits.noComm}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Total GPS Units</h2>
            <p className="text-3xl font-bold text-gray-900">{totalUnits.gps}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Total Problem Units</h2>
            <p className="text-3xl font-bold text-gray-900">{totalUnits.noComm + totalUnits.gps}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">NoComm & GPS</h2>
              <div style={{ height: '400px' }}>
                <Line options={{...lineChartOptions, maintainAspectRatio: false}} data={chartData} />
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">NoComm & GPS</h2>
              <div style={{ height: '400px' }}>
                <Bar options={{...barChartOptions, maintainAspectRatio: false}} data={chartData} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}