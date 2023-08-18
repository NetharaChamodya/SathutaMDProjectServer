CREATE TABLE `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('operator','admin') NOT NULL,
  `status` varchar(10) DEFAULT 'available',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `username` (`username`)
);

CREATE TABLE `customers` (
  `customerId` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`customerId`)
);

CREATE TABLE `machines` (
  `machineId` int NOT NULL AUTO_INCREMENT,
  `machine_name` varchar(100) NOT NULL,
  `machine_type` varchar(50) NOT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `salary_rate` decimal(10,2) DEFAULT NULL,
  `meterReading` int NOT NULL,
  `boughtYr` varchar(10) NOT NULL,
  `manufactureYr` varchar(10) NOT NULL,
  `salaryRatePerHour` decimal(10,2) NOT NULL,
  `engineNo` varchar(50) NOT NULL,
  `chassis` varchar(50) NOT NULL,
  `machineStatus` varchar(20) NOT NULL,
  PRIMARY KEY (`machineId`)
);


CREATE TABLE `tasks` (
  `taskID` int NOT NULL AUTO_INCREMENT,
  `task_name` varchar(100) NOT NULL,
  `assigned_userID` int DEFAULT NULL,
  `created_by_userID` int DEFAULT NULL,
  `allocated_machineID` int DEFAULT NULL,
  `customerID` int DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'NotStarted', 
  `location` varchar(255) DEFAULT NULL,
  `estimateHours` varchar(255) DEFAULT NULL,
  `customerRate` varchar(255) DEFAULT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`taskID`),
  KEY `assigned_userID` (`assigned_userID`),
  KEY `created_by_userID` (`created_by_userID`),
  KEY `allocated_machineID` (`allocated_machineID`),
  KEY `customerID` (`customerID`),
  CONSTRAINT FOREIGN KEY (`assigned_userID`) REFERENCES `users` (`userId`),
  CONSTRAINT FOREIGN KEY (`created_by_userID`) REFERENCES `users` (`userId`),
  CONSTRAINT FOREIGN KEY (`allocated_machineID`) REFERENCES `machines` (`machineId`),
  CONSTRAINT FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerId`)
);

CREATE TABLE `task_details` (
  `taskID` int NOT NULL,
  `date` date NOT NULL,
  `startmeter` int NOT NULL,
  `endmeter` int NOT NULL,
  `fuel` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`taskID`,`date`),
  CONSTRAINT FOREIGN KEY (`taskID`) REFERENCES `tasks` (`taskID`)
);