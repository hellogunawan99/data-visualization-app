-- Create databases if they don't exist
CREATE DATABASE IF NOT EXISTS `netstat_status`;
CREATE DATABASE IF NOT EXISTS `dbs_monitoring`;
CREATE DATABASE IF NOT EXISTS `report`;

-- Grant privileges to the gunawan user for all databases
GRANT ALL PRIVILEGES ON `netstat_status`.* TO 'gunawan'@'%';
GRANT ALL PRIVILEGES ON `dbs_monitoring`.* TO 'gunawan'@'%';
GRANT ALL PRIVILEGES ON `report`.* TO 'gunawan'@'%';

-- Apply privileges
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS `dbs_monitoring`;
CREATE DATABASE IF NOT EXISTS `report`;

-- Grant privileges to the gunawan user for all databases
GRANT ALL PRIVILEGES ON `netstat_status`.* TO 'gunawan'@'%';
GRANT ALL PRIVILEGES ON `dbs_monitoring`.* TO 'gunawan'@'%';
GRANT ALL PRIVILEGES ON `report`.* TO 'gunawan'@'%';

-- Apply privileges
FLUSH PRIVILEGES;

