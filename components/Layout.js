import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  FaChartBar,
  FaHome,
  FaNetworkWired,
  FaPuzzlePiece,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaAlgolia,
  FaSketch,
  FaGitkraken,
  FaTruckLoading,
  FaTruckMoving,
  FaTencentWeibo,
  FaKeyboard,
  FaCalendarPlus,
  FaUncharted,
  FaLink,
  FaTruckPickup,
  FaAddressBook,
  FaWeight,
  FaPeopleArrows,
  FaPeopleCarry,
  FaRegHandPointer,
  FaRegHandPointRight,
  FaRedoAlt,
  FaWatchmanMonitoring,
  FaBook
} from 'react-icons/fa';

export default function Layout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const navItems = [
    { href: '/', label: 'Home', icon: <FaHome /> },
    {
      label: 'Charts',
      icon: <FaChartBar />,
      subItems: [
        { href: '/log-problem-chart', label: 'Log Problem', icon: <FaAlgolia /> },
        { href: '/schedule-jigsaw-chart', label: 'Schedule Jigsaw', icon: <FaTruckMoving /> },
        { href: '/unschedule-jigsaw-chart', label: 'Unschedule Jigsaw', icon: <FaTruckLoading /> },
        { href: '/nocomm-type-chart', label: 'Nocomm Type Jigsaw', icon: <FaUncharted /> },
        { href: '/display-problem-type-chart', label: 'Display Problem Type Jigsaw', icon: <FaUncharted /> },
        { href: '/schedule-network-chart', label: 'Schedule Network', icon: <FaNetworkWired /> },
        { href: '/unschedule-network-chart', label: 'Unschedule Network', icon: <FaTencentWeibo /> },
        { href: '/ytd-nocom-gps', label: 'YTD Nocomm & GPS', icon: <FaCalendarPlus /> },
        { href: '/pm-jigsaw', label: 'PM Jigsaw', icon: <FaCalendarPlus /> },
      ],
    },
    {
      label: 'Link Web',
      icon: <FaLink />,
      subItems: [
        { href: 'http://192.168.211.22/reporting/auth', label: 'Reporting', icon: <FaRegHandPointRight /> },
        {
          label: 'Monitoring',
          icon: <FaRedoAlt />,
          subItems: [
            { href: 'https://192.168.114.252:4343/login.html', label: 'Aruba', icon: <FaNetworkWired /> },
            { href: 'https://192.168.211.31:4444/index.htm', label: 'PRTG', icon: <FaWatchmanMonitoring /> },
            { href: 'http://192.168.211.48:5000', label: 'IP Realtime Monitor', icon: <FaAddressBook /> },
          ],
        },
        {
          label: 'Jigsaw',
          icon: <FaRegHandPointer />,
          subItems: [
            { href: 'http://192.168.211.44/jigsaw', label: 'Nocom Jigsaw', icon: <FaTruckPickup /> },
            { href: 'http://192.168.211.44/payload', label: 'Payload', icon: <FaWeight /> },
            { href: 'http://192.168.211.44/jigsaw/1', label: 'Realtime Monitor Jigsaw', icon: <FaAlgolia /> },
            { href: 'http://192.168.211.44/jigsaw/2', label: 'Realtime Monitor Jigsaw Old', icon: <FaTimes /> },
          ]
        },
        { href: 'http://192.168.211.44/mds_management_ip/_login/form', label: 'Management IP', icon: <FaBars /> },
        {
          label: 'Administrasi',
          icon: <FaBook />,
          subItems: [
            { href: 'http://192.168.200.22/myhr/', label: 'MyHR', icon: <FaPeopleArrows /> },
            { href: 'https://app-saptaindra.msappproxy.net/hris/login/', label: 'HRIS', icon: <FaPeopleCarry /> },
            { href: 'https://sites.google.com/view/e-learningshe/beranda', label: 'Induksi', icon: <FaRedoAlt /> },
          ]
        }
      ],
    },
  ];

  const NavItem = ({ item, path = "", depth = 0 }) => {
    const itemPath = path + "-" + item.label;
    const isActive = item.href
      ? router.pathname === item.href
      : item.subItems?.some(subItem => isItemActive(subItem, itemPath));
    const isOpen = openDropdowns[itemPath] || false;

    function isItemActive(item, currentPath) {
      if (item.href && router.pathname === item.href) {
        return true;
      }
      if (item.subItems) {
        return item.subItems.some(subItem => isItemActive(subItem, currentPath + "-" + item.label));
      }
      return false;
    }

    const toggleDropdown = () => {
      setOpenDropdowns(prev => ({
        ...prev,
        [itemPath]: !prev[itemPath]
      }));
    };

    if (item.subItems) {
      return (
        <div>
          <button
            onClick={toggleDropdown}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium ${
              isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-500 hover:text-white'
            } transition duration-150 ease-in-out`}
            style={{ paddingLeft: `${depth * 8 + 16}px` }}
          >
            <span className="flex items-center">
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </span>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {isOpen && (
            <div>
              {item.subItems.map((subItem, index) => (
                <NavItem key={index} item={subItem} path={itemPath} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href || "#"}
        className={`flex items-center px-4 py-2 text-sm font-medium ${
          router.pathname === item.href
            ? 'bg-blue-700 text-white'
            : 'text-blue-100 hover:bg-blue-500 hover:text-white'
        } transition duration-150 ease-in-out`}
        style={{ paddingLeft: `${depth * 8 + 16}px` }}
      >
        <span className="mr-3">{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-blue-600 text-white w-64 fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-4">
            <Link href="/" className="flex items-center">
              <img className="h-8 w-8 mr-2" src="/next.svg" alt="Logo" />
              <span className="text-lg font-semibold">ITSD</span>
            </Link>
          </div>
          <nav className="flex-grow overflow-y-auto">
            {navItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open sidebar</span>
                {isSidebarOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
              </button>
              <div className="flex-1 flex justify-between items-center md:hidden">
                <img className="h-8 w-auto" src="/next.svg" alt="Logo" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>

        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-2 md:mb-0 text-sm">
                © 2024 Data Visualization App. All rights reserved.
              </div>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="hover:text-blue-300 transition duration-150 ease-in-out">Privacy Policy</a>
                <a href="#" className="hover:text-blue-300 transition duration-150 ease-in-out">Terms of Service</a>
                <a href="#" className="hover:text-blue-300 transition duration-150 ease-in-out">Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
