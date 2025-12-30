import unittest
import sys
import os
import json

# Add the backend folder to the system path so we can import 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import User

class APITestCase(unittest.TestCase):
    def setUp(self):
        """Set up a temporary fake database before each test."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # RAM only
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Clean up after each test."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    # --- TEST 1: Check if Signup works ---
    def test_1_signup(self):
        response = self.client.post('/api/auth/signup', json={
            'full_name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('User created', response.get_data(as_text=True))

    # --- TEST 2: Check if Login works ---
    def test_2_login_success(self):
        # Create user first
        self.client.post('/api/auth/signup', json={
            'full_name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        })
        # Login
        response = self.client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.get_data(as_text=True))

    # --- TEST 3: Check if Wrong Password fails ---
    def test_3_login_fail(self):
        self.client.post('/api/auth/signup', json={
            'full_name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        })
        response = self.client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'WRONGpassword'
        })
        self.assertEqual(response.status_code, 401)

    # --- TEST 4: Check Protected Route (Profile) ---
    def test_4_access_denied(self):
        # Try to access profile without a token
        response = self.client.get('/api/user/profile')
        self.assertEqual(response.status_code, 401)

    # --- TEST 5: Check Admin Protection ---
    def test_5_admin_only(self):
        # 1. Create Normal User
        self.client.post('/api/auth/signup', json={
            'full_name': 'Normal User',
            'email': 'normal@test.com',
            'password': 'password123'
        })
        # 2. Login to get Token
        login_res = self.client.post('/api/auth/login', json={
            'email': 'normal@test.com',
            'password': 'password123'
        })
        token = login_res.json['token']

        # 3. Try to access Admin User List
        response = self.client.get('/api/admin/users', headers={
            'Authorization': f'Bearer {token}'
        })
        
        # 4. Should be Forbidden (403)
        self.assertEqual(response.status_code, 403)

if __name__ == '__main__':
    unittest.main()