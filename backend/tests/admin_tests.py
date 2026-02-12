import requests
import sys
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"
ADMIN_EMAIL = "granpainside@yandex.ru"
ADMIN_PASS = "Nikitoso02-"

class AdminTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.data_store = {}

    def log(self, message, status="INFO"):
        print(f"[{status}] {message}")

    def fail(self, message):
        self.log(message, "FAIL")
        sys.exit(1)

    def login(self):
        self.log("Attempting Admin Login...")
        url = f"{BASE_URL}/login/access-token"
        payload = {
            "username": ADMIN_EMAIL,
            "password": ADMIN_PASS
        }
        try:
            res = self.session.post(url, data=payload)
            if res.status_code != 200:
                self.fail(f"Login failed: {res.text}")
            
            data = res.json()
            self.token = data["access_token"]
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
            self.log("Admin Login Successful")
        except Exception as e:
            self.fail(f"Login Exception: {e}")

    # --- User Management Tests ---
    def create_user(self):
        self.log("Creating Test Manager User...")
        url = f"{BASE_URL}/users/"
        # We need a unique email
        unique_email = f"manager_{int(time.time())}@example.com"
        payload = {
            "email": unique_email,
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "Manager",
            "role": "Manager",
            "is_superuser": False
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
            self.fail(f"Create User failed: {res.text}")
        
        data = res.json()
        self.data_store['user_id'] = data['id']
        self.data_store['user_email'] = unique_email
        self.log(f"User Created: ID {data['id']} ({unique_email})")

    def list_users(self):
        self.log("Listing Users...")
        url = f"{BASE_URL}/users/"
        res = self.session.get(url)
        if res.status_code != 200:
            self.fail(f"List Users failed: {res.text}")
        
        users = res.json()
        found = any(u['id'] == self.data_store['user_id'] for u in users)
        if not found:
            self.fail("Created user not found in user list")
        self.log("User verified in list")

    def update_user(self):
        self.log("Updating User Role...")
        url = f"{BASE_URL}/users/{self.data_store['user_id']}"
        payload = {
            "first_name": "UpdatedName",
            "role": "Mitarbeiter" # Changing role
        }
        res = self.session.put(url, json=payload)
        if res.status_code != 200:
            self.fail(f"Update User failed: {res.text}")
            
        data = res.json()
        if data['first_name'] != "UpdatedName" or data['role'] != "Mitarbeiter":
             self.fail("User update data mismatch")
        self.log("User Updated Successfully")

    def delete_user(self):
        self.log("Deleting User...")
        url = f"{BASE_URL}/users/{self.data_store['user_id']}"
        res = self.session.delete(url)
        if res.status_code != 200:
            self.fail(f"Delete User failed: {res.text}")
        self.log("User Deleted Successfully")

    # --- Site Content Tests ---
    def update_site_content(self):
        self.log("Updating Site Content (Imprint)...")
        key = "imprint_test"
        url = f"{BASE_URL}/content/{key}"
        content_dict = {"text": f"Updated Imprint Content {int(time.time())}", "active": True}
        
        payload = {
            "content": content_dict
        }
        res = self.session.put(url, json=payload)
        if res.status_code != 200:
             self.fail(f"Update/Create Content failed: {res.text}")
        
        self.log("Content Updated/Created")
        
        # Verify
        res_get = self.session.get(url)
        if res_get.status_code != 200:
             self.fail("Could not fetch updated content")
        
        if res_get.json()['content'] != content_dict:
             self.fail("Content persistence check failed")
        
        self.log("Content Verified")

    def run(self):
        try:
            self.login()
            
            self.log("--- Starting User Management Tests ---")
            self.create_user()
            self.list_users()
            self.update_user()
            self.delete_user()
            
            self.log("--- Starting Site Content Tests ---")
            self.update_site_content()
            
            self.log("Admin Functionality Test Completed Successfully!")
        except Exception as e:
            self.log(f"Unexpected Error: {e}", "ERROR")

if __name__ == "__main__":
    tester = AdminTester()
    tester.run()
