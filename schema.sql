-- Create database
CREATE DATABASE IF NOT EXISTS school_admission;
USE school_admission;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT NOT NULL,
    course VARCHAR(50) NOT NULL,
    previous_school VARCHAR(100),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    emergency_contact VARCHAR(20),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin table (for login)
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Insert default admin (username: admin, password: admin123)
-- In production, use hashed passwords!
INSERT INTO admin (username, password) 
VALUES ('admin', 'admin123')
ON DUPLICATE KEY UPDATE username=username;

-- Sample query to view all students
-- SELECT * FROM students ORDER BY submitted_at DESC;
