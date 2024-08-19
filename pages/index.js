import Link from 'next/link';
import Layout from '../components/Layout';
import { FaChalkboard, FaChargingStation, FaChartArea, FaChartBar, FaChartLine, FaChartPie, FaPuzzlePiece, FaRegChartBar, FaUncharted } from 'react-icons/fa';

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto p-8 bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen">
        <h1 className="text-5xl font-extrabold mb-6 text-center text-gray-800">
          Data Visualization Hub
        </h1>
        <p className="text-xl mb-8 text-center text-gray-600">
          Discover insights through interactive and engaging visualizations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChartLink 
            href="/log-problem-chart"
            title="Log Problem"
            description="Log Problem Jigsaw Develop by MDD to monitor NoComm, GPS & No Route to Host dan melihat trend"
            icon={<FaChartBar className="text-4xl mb-4 text-blue-500" />}
          />
          <ChartLink 
            href="/schedule-jigsaw-chart"
            title="Schedule Jigsaw"
            description="Schedule Pekerjaan Jigsaw untuk melihat progress pekerjaan jigsaw schedule dan melihat trend"
            icon={<FaChalkboard className="text-4xl mb-4 text-purple-500" />}
          />
          <ChartLink 
            href="/unschedule-jigsaw-chart"
            title="Unschedule Jigsaw"
            description="Pekerjaan Unschedule Jigsaw untuk melihat progress pekerjaan jigsaw unschedule dan melihat trend"
            icon={<FaChargingStation className="text-4xl mb-4 text-yellow-500" />}
          />
          <ChartLink 
            href="/nocomm-type-chart"
            title="NoComm Type"
            description="Pekerjaan Unschedule Jigsaw untuk melihat progress pekerjaan nocom dan melihat trend"
            icon={<FaUncharted className="text-4xl mb-4 text-yellow-500" />}
          />
          <ChartLink 
            href="/schedule-network-chart"
            title="Schedule Network"
            description="Pekerjaan Schedule Network untuk melihat progress pekerjaan network schedule dan melihat trend"
            icon={<FaChartLine className="text-4xl mb-4 text-green-500" />}
          />
          <ChartLink 
            href="/unschedule-network-chart"
            title="Unschedule Network"
            description="Pekerjaan Unschedule Network untuk melihat progress pekerjaan network unschedule dan melihat trend"
            icon={<FaChartPie className="text-4xl mb-4 text-red-500" />}
          />
          <ChartLink 
            href="/ytd-nocom-gps"
            title="YtD Nocomm & GPS"
            description="Year to Date untuk Problem Nocomm dan GPS"
            icon={<FaRegChartBar className="text-4xl mb-4 text-red-500" />}
          />
        </div>
      </div>
    </Layout>
  );
}

function ChartLink({ href, title, description, icon }) {
  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-center cursor-pointer">
        {icon}
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}