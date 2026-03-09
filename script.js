// API Base URL (change this to your backend URL)
const API_BASE_URL = 'http://localhost:5000/api';

// ==================== REGISTRATION FORM HANDLING ====================
const admissionForm = document.getElementById('admissionForm');
if (admissionForm) {
    admissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Get form data
        const formData = {
            full_name: document.getElementById('full_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            date_of_birth: document.getElementById('date_of_birth').value,
            address: document.getElementById('address').value,
            course: document.getElementById('course').value,
            previous_school: document.getElementById('previous_school').value,
            father_name: document.getElementById('father_name').value,
            mother_name: document.getElementById('mother_name').value,
            emergency_contact: document.getElementById('emergency_contact').value
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('success', 'Application submitted successfully!');
                admissionForm.reset();
            } else {
                showMessage('error', data.message || 'Submission failed');
            }
        } catch (error) {
            showMessage('error', 'Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ==================== ADMIN LOGIN & DASHBOARD ====================
let isLoggedIn = false;

// Check login status on admin page load
if (window.location.pathname.includes('admin.html')) {
    checkLoginStatus();
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                isLoggedIn = true;
                sessionStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
                loadStudents();
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            alert('Login failed. Please try again.');
            console.error('Error:', error);
        }
    });
}

// Check if admin is logged in
function checkLoginStatus() {
    isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showDashboard();
        loadStudents();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
    }
}

// Show dashboard (hide login)
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    isLoggedIn = false;
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
}

// Load all students
async function loadStudents() {
    const studentsList = document.getElementById('studentsList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const data = await response.json();
        
        if (data.success && data.students.length > 0) {
            studentsList.innerHTML = data.students.map(student => `
                <div class="student-card" onclick="viewStudent(${student.id})">
                    <h3>${student.full_name}</h3>
                    <p>📧 ${student.email}</p>
                    <p>📞 ${student.phone}</p>
                    <p>📅 Applied: ${new Date(student.submitted_at).toLocaleDateString()}</p>
                    <span class="course-badge">${student.course}</span>
                </div>
            `).join('');
        } else {
            studentsList.innerHTML = '<p class="loading">No applications yet.</p>';
        }
    } catch (error) {
        studentsList.innerHTML = '<p class="loading error">Error loading applications.</p>';
        console.error('Error:', error);
    }
}

// View single student details
async function viewStudent(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
        const data = await response.json();
        
        if (data.success) {
            const student = data.student;
            const detailsHtml = `
                <h2>Student Details</h2>
                <div class="detail-item">
                    <strong>Full Name:</strong> <span>${student.full_name}</span>
                </div>
                <div class="detail-item">
                    <strong>Email:</strong> <span>${student.email}</span>
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong> <span>${student.phone}</span>
                </div>
                <div class="detail-item">
                    <strong>Date of Birth:</strong> <span>${student.date_of_birth}</span>
                </div>
                <div class="detail-item">
                    <strong>Course:</strong> <span>${student.course}</span>
                </div>
                <div class="detail-item">
                    <strong>Address:</strong> <span>${student.address}</span>
                </div>
                <div class="detail-item">
                    <strong>Father's Name:</strong> <span>${student.father_name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Mother's Name:</strong> <span>${student.mother_name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Previous School:</strong> <span>${student.previous_school || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Emergency Contact:</strong> <span>${student.emergency_contact || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <strong>Submitted:</strong> <span>${student.submitted_at}</span>
                </div>
            `;
            
            document.getElementById('studentDetails').innerHTML = detailsHtml;
            document.getElementById('studentModal').style.display = 'flex';
        }
    } catch (error) {
        alert('Error loading student details');
        console.error('Error:', error);
    }
}

// Close modal
function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('studentModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// ==================== HELPER FUNCTIONS ====================
function showMessage(type, text) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Make functions global for HTML onclick handlers
window.viewStudent = viewStudent;
window.closeModal = closeModal;
window.logout = logout;
