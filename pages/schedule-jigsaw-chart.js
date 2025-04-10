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
        <div key={index} className="flex justify-between items-center mb-1">
          <span style={{ color: data.datasets[0].backgroundColor[index] }}>●</span>
          <span className="flex-grow ml-1 truncate">{label}</span>
          <span className="font-bold ml-1">{data.datasets[0].data[index]}</span>
        </div>
      ))}
    </div>
  );
};

export default function TesChart() {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [mtdChartData, setMtdChartData] = useState({ datasets: [] });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  };

  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    setStartDate(formatDate(sevenDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
      fetchMTDData();
    }
  }, [startDate, endDate]);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchData = async (start, end) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/scheduleUnitData?startDate=${start}&endDate=${end}`);
  
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await response.json();
      const processedData = processData(data, start, end);
      setChartData(processedData);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMTDData = async () => {
    try {
      const response = await fetch('/api/mtdScheduleUnitData');
      
      if (!response.ok) {
        throw new Error('Failed to fetch MTD data');
      }

      const data = await response.json();
      const processedMTDData = processMTDData(data);
      setMtdChartData(processedMTDData);
    } catch (err) {
      setError('Failed to load MTD data. Please try again later.');
    }
  };

  const processData = (data, start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const allDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(formatDate(d));
    }
    
    const groupedData = allDates.reduce((acc, date) => {
      acc[date] = {};
      return acc;
    }, {});
  
    data.forEach(item => {
      const itemDate = new Date(item.date);
      itemDate.setDate(itemDate.getDate() + 1);
      const dateStr = formatDate(itemDate);
      
      if (groupedData[dateStr]) {
        const problemKey = item.problem.toString();
        if (!groupedData[dateStr][problemKey]) {
          groupedData[dateStr][problemKey] = 0;
        }
        groupedData[dateStr][problemKey]++;
      }
    });
  
    const problemTypes = [...new Set(data.map(item => item.problem.toString()))];

    return {
      labels: allDates,
      datasets: problemTypes.map(problem => ({
        label: problem,
        data: allDates.map(date => groupedData[date][problem] || 0),
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
        borderWidth: 1
      }))
    };
  };

  const processMTDData = (data) => {
    const problemCounts = data.reduce((acc, item) => {
      if (!acc[item.problem]) {
        acc[item.problem] = 0;
      }
      acc[item.problem]++;
      return acc;
    }, {});

    const sortedProblems = Object.entries(problemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const colors = sortedProblems.map(() => getRandomColor());

    return {
      labels: sortedProblems.map(([problem]) => problem),
      datasets: [{
        data: sortedProblems.map(([, count]) => count),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1
      }]
    };
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        align: 'center',
        labels: { 
          boxWidth: 20, 
          padding: 20,
          font: {
            size: 12
          }
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        offset: 15,
        color: '#000',
        font: { size: 11, weight: 'bold' },
        formatter: (value) => value > 0 ? value : '',
      },
      tooltip: {
        callbacks: {
          title: (context) => new Date(context[0].label).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        }
      }
    },
    layout: { 
      padding: { top: 40, right: 20, left: 20, bottom: 0 }
    }
  };
  
  const options = {
    ...baseOptions,
    scales: {
      x: { 
        type: 'time',
        time: { 
          unit: 'day',
          displayFormats: { day: 'd MMM' },
          tooltipFormat: 'dd MMMM yyyy'
        },
        adapters: { date: { locale: enUS } },
        title: { display: true, text: 'Tanggal' },
        grid: { display: false },
        ticks: {
          source: 'data',
          autoSkip: false,
          maxRotation: 45,
        }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Masalah' },
        ticks: { stepSize: 1, precision: 0 },
        grid: { display: false },
        suggestedMax: 10,
      }
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
        font: { size: 9, weight: 'bold' },
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
    radius: '90%'
  };

  const getCurrentMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getUTCMonth()];
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Schedule Jigsaw</h1>
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
              <div className="mb-4 bg-white p-4 rounded-lg shadow" style={{ height: '500px' }}>
                <h2 className="text-xl font-semibold mb-2">Pekerjaan Schedule</h2>
                <div style={{ height: '450px' }}>
                  <Bar options={options} data={chartData} />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3 px-2">
              <div className="mb-4 bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Top Pekerjaan Schedule - {getCurrentMonth()}</h2>
                {mtdChartData.datasets.length > 0 ? (
                  <div className="flex flex-col">
                    <div style={{ height: '200px' }}>
                      <Doughnut options={mtdOptions} data={mtdChartData} />
                    </div>
                    <CustomLegend data={mtdChartData} />
                  </div>
                ) : (
                  <p>No data available for MTD chart.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}