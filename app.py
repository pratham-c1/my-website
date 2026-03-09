from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG
import hashlib

app = Flask(__name__)
CORS(app)  # Allow frontend to access API

# Database connection helper
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Route 1: Submit admission form
@app.route('/api/register', methods=['POST'])
def register_student():
    try:
        data = request.json
        connection = get_db_connection()
        cursor = connection.cursor()
        
        query = """
            INSERT INTO students 
            (full_name, email, phone, date_of_birth, address, course, 
             previous_school, father_name, mother_name, emergency_contact)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            data['full_name'],
            data['email'],
            data['phone'],
            data['date_of_birth'],
            data['address'],
            data['course'],
            data.get('previous_school', ''),
            data.get('father_name', ''),
            data.get('mother_name', ''),
            data.get('emergency_contact', '')
        )
        
        cursor.execute(query, values)
        connection.commit()
        student_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'message': 'Registration successful!',
            'student_id': student_id
        }), 201
        
    except mysql.connector.Error as err:
        if err.errno == 1062:  # Duplicate entry error
            return jsonify({
                'success': False,
                'message': 'Email already registered!'
            }), 400
        return jsonify({
            'success': False,
            'message': f'Database error: {err}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Route 2: Admin login
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # In production, use password hashing!
        cursor.execute(
            "SELECT * FROM admin WHERE username = %s AND password = %s",
            (username, password)
        )
        admin = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if admin:
            return jsonify({
                'success': True,
                'message': 'Login successful'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Route 3: Get all students (for admin view)
@app.route('/api/students', methods=['GET'])
def get_all_students():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, full_name, email, phone, date_of_birth, 
                   address, course, previous_school, father_name, 
                   mother_name, emergency_contact, submitted_at 
            FROM students 
            ORDER BY submitted_at DESC
        """)
        
        students = cursor.fetchall()
        
        # Convert date to string for JSON
        for student in students:
            student['date_of_birth'] = student['date_of_birth'].strftime('%Y-%m-%d')
            student['submitted_at'] = student['submitted_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'students': students
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Route 4: Get single student by ID
@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM students WHERE id = %s", (student_id,))
        student = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if student:
            student['date_of_birth'] = student['date_of_birth'].strftime('%Y-%m-%d')
            student['submitted_at'] = student['submitted_at'].strftime('%Y-%m-%d %H:%M:%S')
            return jsonify({
                'success': True,
                'student': student
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
