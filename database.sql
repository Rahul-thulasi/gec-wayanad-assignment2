-- =====================================================================
-- GEC Wayanad — Data-Driven Project Showcase Portal
-- KTU CST463 Web Programming Assignment 3
-- Relational Database Schema & Baseline Migration: gec_assignment3
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `gec_assignment3` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `gec_assignment3`;

-- Disable foreign key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `project_technologies`;
DROP TABLE IF EXISTS `project_members`;
DROP TABLE IF EXISTS `technologies`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `faculty`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Table: users
-- Authenticated project management demo credentials
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'Plain text demo credential for local academic evaluation',
  `role` VARCHAR(50) NOT NULL DEFAULT 'Administrator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', 'admin123', 'Administrator'),
('demo_user', 'demo_pass', 'Faculty Evaluator');

-- ---------------------------------------------------------------------
-- 2. Table: faculty
-- Institutional faculty advisors and guides
-- ---------------------------------------------------------------------
CREATE TABLE `faculty` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `department` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Table: students
-- Student researchers and capstone participants
-- ---------------------------------------------------------------------
CREATE TABLE `students` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `department` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Table: technologies
-- Master registry of engineering technologies, libraries, and frameworks
-- ---------------------------------------------------------------------
CREATE TABLE `technologies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Table: projects
-- Core capstone and research project entities
-- ---------------------------------------------------------------------
CREATE TABLE `projects` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `year` INT NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `guide_id` VARCHAR(50) NOT NULL,
  `status` ENUM('Prototype', 'Development', 'Completed') NOT NULL DEFAULT 'Prototype',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_projects_guide` FOREIGN KEY (`guide_id`) REFERENCES `faculty` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_projects_domain` ON `projects` (`domain`);
CREATE INDEX `idx_projects_dept` ON `projects` (`department`);
CREATE INDEX `idx_projects_year` ON `projects` (`year`);
CREATE INDEX `idx_projects_status` ON `projects` (`status`);

-- ---------------------------------------------------------------------
-- 6. Table: project_members
-- Junction table: Projects <-> Students (Many-to-Many)
-- ---------------------------------------------------------------------
CREATE TABLE `project_members` (
  `project_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`project_id`, `student_id`),
  CONSTRAINT `fk_pm_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pm_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Table: project_technologies
-- Junction table: Projects <-> Technologies (Many-to-Many)
-- ---------------------------------------------------------------------
CREATE TABLE `project_technologies` (
  `project_id` VARCHAR(50) NOT NULL,
  `technology_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`project_id`, `technology_id`),
  CONSTRAINT `fk_pt_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_technology` FOREIGN KEY (`technology_id`) REFERENCES `technologies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- Baseline Data: Faculty Members
-- ---------------------------------------------------------------------
INSERT INTO `faculty` (`id`, `name`, `department`) VALUES
('faculty-001', 'Dr. Priya Nair (CSE)', 'Computer Science and Engineering'),
('faculty-002', 'Prof. Thomas Mathew (CSE)', 'Computer Science and Engineering'),
('faculty-003', 'Dr. Rajesh K. V. (ECE)', 'Electronics and Communication Engineering'),
('faculty-004', 'Prof. Anitha Varma (CE)', 'Civil Engineering'),
('faculty-005', 'Dr. K. S. Harikrishnan (EEE)', 'Electrical and Electronics Engineering'),
('faculty-006', 'Prof. Suresh Babu (ME)', 'Mechanical Engineering'),
('faculty-007', 'Dr. Deepa Chandran (CSE)', 'Computer Science and Engineering');

-- ---------------------------------------------------------------------
-- Baseline Data: Student Researchers
-- ---------------------------------------------------------------------
INSERT INTO `students` (`id`, `name`, `department`) VALUES
('student-001', 'Student Researcher 001', 'Computer Science and Engineering'),
('student-002', 'Student Researcher 002', 'Computer Science and Engineering'),
('student-003', 'Student Researcher 003', 'Computer Science and Engineering'),
('student-004', 'Student Researcher 004', 'Computer Science and Engineering'),
('student-005', 'Student Researcher 005', 'Computer Science and Engineering'),
('student-006', 'Student Researcher 006', 'Electronics and Communication Engineering'),
('student-007', 'Student Researcher 007', 'Electronics and Communication Engineering'),
('student-008', 'Student Researcher 008', 'Electronics and Communication Engineering'),
('student-009', 'Student Researcher 009', 'Civil Engineering'),
('student-010', 'Student Researcher 010', 'Civil Engineering'),
('student-011', 'Student Researcher 011', 'Computer Science and Engineering'),
('student-012', 'Student Researcher 012', 'Computer Science and Engineering'),
('student-013', 'Student Researcher 013', 'Computer Science and Engineering'),
('student-014', 'Student Researcher 014', 'Electrical and Electronics Engineering'),
('student-015', 'Student Researcher 015', 'Electrical and Electronics Engineering'),
('student-016', 'Student Researcher 016', 'Computer Science and Engineering'),
('student-017', 'Student Researcher 017', 'Computer Science and Engineering'),
('student-018', 'Student Researcher 018', 'Computer Science and Engineering'),
('student-019', 'Student Researcher 019', 'Mechanical Engineering'),
('student-020', 'Student Researcher 020', 'Mechanical Engineering'),
('student-021', 'Student Researcher 021', 'Mechanical Engineering'),
('student-022', 'Student Researcher 022', 'Computer Science and Engineering'),
('student-023', 'Student Researcher 023', 'Computer Science and Engineering'),
('student-024', 'Student Researcher 024', 'Civil Engineering'),
('student-025', 'Student Researcher 025', 'Civil Engineering');

-- ---------------------------------------------------------------------
-- Baseline Data: Technologies
-- ---------------------------------------------------------------------
INSERT INTO `technologies` (`name`) VALUES
('Arduino'),
('Audio Processing'),
('CSS'),
('Cryptography'),
('Docker'),
('ESP32'),
('Embedded C'),
('Flask'),
('Fluid Dynamics'),
('GIS Mapping'),
('GSM Module'),
('Go'),
('HTML'),
('IndexedDB'),
('IoT'),
('JavaScript'),
('Jetson Nano'),
('LoRaWAN'),
('MATLAB/Simulink'),
('MQTT'),
('Machine Learning'),
('Modbus'),
('Node.js'),
('OpenCV'),
('PHP'),
('Power Electronics'),
('PyTorch'),
('Python'),
('REST API'),
('ROS2'),
('SCADA'),
('SolidWorks'),
('Telemetry'),
('Transformers'),
('Turbidity Sensors'),
('WebSockets');

-- ---------------------------------------------------------------------
-- Baseline Data: Projects (Migrated from Assignment 2 dataset)
-- ---------------------------------------------------------------------
INSERT INTO `projects` (`id`, `title`, `domain`, `description`, `year`, `department`, `guide_id`, `status`) VALUES
('project-001', 'Wayanad Landslide Monitoring System', 'Disaster Management', 'A system for monitoring environmental parameters to support early identification of landslide-prone conditions.', 2026, 'Computer Science and Engineering', 'faculty-001', 'Prototype'),
('project-002', 'Campus Resource Booking System', 'Web Application', 'A web application for booking classrooms, laboratories and other institutional resources.', 2026, 'Computer Science and Engineering', 'faculty-002', 'Development'),
('project-003', 'Smart Agro-Climatic Sensor Network for Wayanad Coffee Plantations', 'Agriculture & IoT', 'Demonstration record: Low-power mesh sensor deployment for microclimate tracking, soil moisture profiling, and frost alerts tailored for high-altitude hill agriculture.', 2026, 'Electronics and Communication Engineering', 'faculty-003', 'Prototype'),
('project-004', 'Kabini River Basin Water Level Early Warning Alert System', 'Disaster Management', 'Demonstration record: Ultrasonic depth telemetry combined with predictive hydrological runoff models to warn downstream riverbank communities during peak monsoon.', 2025, 'Civil Engineering', 'faculty-004', 'Completed'),
('project-005', 'Malayalam Dialect Speech Recognition for Tribal Health Access', 'Artificial Intelligence', 'Demonstration record: Acoustic fine-tuning of automated speech recognition models to transcribe local regional dialects for primary healthcare assistance.', 2026, 'Computer Science and Engineering', 'faculty-001', 'Development'),
('project-006', 'Hybrid Solar-Micro-Hydro Campus Energy Management System', 'Renewable Energy', 'Demonstration record: Supervisory SCADA controller balancing collegiate rooftop photovoltaic generation and backup storage units with dynamic load shedding.', 2025, 'Electrical and Electronics Engineering', 'faculty-005', 'Completed'),
('project-007', 'GECW Digital Central Repository & E-Thesis Archive', 'Web Application', 'Demonstration record: Open-access academic publication and capstone repository facilitating peer review, plagiarism verification, and institutional indexing.', 2025, 'Computer Science and Engineering', 'faculty-002', 'Completed'),
('project-008', 'Autonomous Forest Trail Inspection Rover for Wildlife Corridors', 'Robotics & Vision', 'Demonstration record: Ruggedized tracked chassis navigating rugged terrain with edge computer vision to detect fence breaches and human-wildlife encounters.', 2026, 'Mechanical Engineering', 'faculty-006', 'Prototype'),
('project-009', 'Federated Hospital Record Exchange for District Clinics', 'Information Security', 'Demonstration record: Privacy-preserving cryptographically verified ledger mechanism permitting tamper-evident transfer of patient health summaries.', 2024, 'Computer Science and Engineering', 'faculty-007', 'Completed'),
('project-010', 'Smart Rainwater Harvesting & Greywater Recycling Controller', 'Renewable Energy', 'Demonstration record: Automated pneumatic multi-stage filtration monitor regulating campus hostel auxiliary water supplies based on meteorological forecast data.', 2024, 'Civil Engineering', 'faculty-004', 'Completed');

-- ---------------------------------------------------------------------
-- Baseline Data: Project Team Members (project_members)
-- ---------------------------------------------------------------------
INSERT INTO `project_members` (`project_id`, `student_id`) VALUES
('project-001', 'student-001'),
('project-001', 'student-002'),
('project-001', 'student-003'),
('project-002', 'student-004'),
('project-002', 'student-005'),
('project-003', 'student-006'),
('project-003', 'student-007'),
('project-003', 'student-008'),
('project-004', 'student-009'),
('project-004', 'student-010'),
('project-005', 'student-011'),
('project-005', 'student-012'),
('project-005', 'student-013'),
('project-006', 'student-014'),
('project-006', 'student-015'),
('project-007', 'student-016'),
('project-007', 'student-017'),
('project-007', 'student-018'),
('project-008', 'student-019'),
('project-008', 'student-020'),
('project-008', 'student-021'),
('project-009', 'student-022'),
('project-009', 'student-023'),
('project-010', 'student-024'),
('project-010', 'student-025');

-- ---------------------------------------------------------------------
-- Baseline Data: Project Technologies (project_technologies)
-- ---------------------------------------------------------------------
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-001', id FROM `technologies` WHERE `name` = 'IoT';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-001', id FROM `technologies` WHERE `name` = 'Python';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-001', id FROM `technologies` WHERE `name` = 'Machine Learning';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-002', id FROM `technologies` WHERE `name` = 'HTML';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-002', id FROM `technologies` WHERE `name` = 'CSS';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-002', id FROM `technologies` WHERE `name` = 'JavaScript';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-002', id FROM `technologies` WHERE `name` = 'PHP';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-003', id FROM `technologies` WHERE `name` = 'LoRaWAN';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-003', id FROM `technologies` WHERE `name` = 'Embedded C';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-003', id FROM `technologies` WHERE `name` = 'ESP32';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-003', id FROM `technologies` WHERE `name` = 'MQTT';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-004', id FROM `technologies` WHERE `name` = 'Python';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-004', id FROM `technologies` WHERE `name` = 'Telemetry';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-004', id FROM `technologies` WHERE `name` = 'GIS Mapping';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-004', id FROM `technologies` WHERE `name` = 'GSM Module';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-005', id FROM `technologies` WHERE `name` = 'PyTorch';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-005', id FROM `technologies` WHERE `name` = 'Transformers';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-005', id FROM `technologies` WHERE `name` = 'Audio Processing';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-005', id FROM `technologies` WHERE `name` = 'Flask';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-006', id FROM `technologies` WHERE `name` = 'MATLAB/Simulink';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-006', id FROM `technologies` WHERE `name` = 'SCADA';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-006', id FROM `technologies` WHERE `name` = 'Power Electronics';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-006', id FROM `technologies` WHERE `name` = 'Modbus';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-007', id FROM `technologies` WHERE `name` = 'JavaScript';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-007', id FROM `technologies` WHERE `name` = 'Node.js';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-007', id FROM `technologies` WHERE `name` = 'IndexedDB';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-007', id FROM `technologies` WHERE `name` = 'REST API';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-008', id FROM `technologies` WHERE `name` = 'ROS2';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-008', id FROM `technologies` WHERE `name` = 'OpenCV';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-008', id FROM `technologies` WHERE `name` = 'Jetson Nano';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-008', id FROM `technologies` WHERE `name` = 'SolidWorks';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-009', id FROM `technologies` WHERE `name` = 'Cryptography';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-009', id FROM `technologies` WHERE `name` = 'Go';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-009', id FROM `technologies` WHERE `name` = 'Docker';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-009', id FROM `technologies` WHERE `name` = 'WebSockets';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-010', id FROM `technologies` WHERE `name` = 'Arduino';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-010', id FROM `technologies` WHERE `name` = 'Fluid Dynamics';
INSERT INTO `project_technologies` (`project_id`, `technology_id`) SELECT 'project-010', id FROM `technologies` WHERE `name` = 'Turbidity Sensors';
