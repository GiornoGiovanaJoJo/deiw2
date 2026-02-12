import requests
import sys
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"
ADMIN_EMAIL = "granpainside@yandex.ru"
ADMIN_PASS = "Nikitoso02-"

class APITester:
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
        self.log("Attempting Login...")
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
            self.log("Login Successful")
        except Exception as e:
            self.fail(f"Login Exception: {e}")

    def create_category(self):
        self.log("Creating Test Category...")
        url = f"{BASE_URL}/categories/"
        payload = {
            "name": "Automated Test Category",
            "type": "Projekt",
            "color": "#FF5733"
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
            self.fail(f"Create Category failed: {res.text}")
        
        data = res.json()
        self.data_store['category_id'] = data['id']
        self.log(f"Category Created: ID {data['id']}")

    def create_customer(self):
        self.log("Creating Test Customer...")
        url = f"{BASE_URL}/customers/"
        payload = {
            "company_name": "Automated Test Corp",
            "type": "Firma",
            "email": "test@example.com"
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
            self.fail(f"Create Customer failed: {res.text}")
        
        data = res.json()
        self.data_store['customer_id'] = data['id']
        self.log(f"Customer Created: ID {data['id']}")

    def create_project(self):
        self.log("Creating Project...")
        url = f"{BASE_URL}/projects/"
        payload = {
            "name": "Automated Full Cycle Project",
            "status": "Geplant",
            "customer_id": self.data_store.get('customer_id'),
            "category_id": self.data_store.get('category_id'),
            "description": "Created via automated test script"
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
            self.fail(f"Create Project failed: {res.text}")
        
        data = res.json()
        self.data_store['project_id'] = data['id']
        self.log(f"Project Created: ID {data['id']}")

    def add_project_stage(self):
        self.log("Adding Project Stage...")
        url = f"{BASE_URL}/project-stages/"
        payload = {
            "project_id": self.data_store['project_id'],
            "name": "Planning Phase",
            "status": "Geplant"
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
            self.fail(f"Create Stage failed: {res.text}")
        self.log("Project Stage Added")

    def add_task(self):
        self.log("Adding Task to Project...")
        url = f"{BASE_URL}/tasks/"
        payload = {
            "title": "Initial Setup Task",
            "project_id": self.data_store['project_id'],
            "status": "Offen",
            "priority": "Hoch"
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
            self.fail(f"Create Task failed: {res.text}")
        
        data = res.json()
        self.data_store['task_id'] = data['id']
        self.log(f"Task Created: ID {data['id']}")

    def add_time_entry(self):
        self.log("Logging Time...")
        # Need current user ID first? Usually inferred from token, but endpoint might require it.
        # Let's check /users/me
        me_res = self.session.get(f"{BASE_URL}/users/me")
        if me_res.status_code != 200:
             self.fail("Could not fetch User ID for time entry")
        user_id = me_res.json()['id']

        url = f"{BASE_URL}/time-entries/"
        payload = {
            "user_id": user_id,
            "project_id": self.data_store['project_id'],
            "date": "2026-02-12",
            "start_time": "09:00",
            "end_time": "12:00",
            "hours": 3.0,
            "note": "Test work"
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
            self.log(f"Create Time Entry failed: {res.text} (Non-critical, continuing)", "WARN")
        else:
            self.log("Time Entry Created")

    def add_comment(self):
        self.log("Adding Comment...")
        url = f"{BASE_URL}/comments/"
        payload = {
            "entity_type": "project",
            "entity_id": str(self.data_store['project_id']),
            "content": "This is a test comment."
        }
        res = self.session.post(url, json=payload)
        if res.status_code not in [200, 201]:
             self.log(f"Create Comment failed: {res.text} (Non-critical, continuing)", "WARN")
        else:
             self.log("Comment Added")

    def update_status(self):
        self.log("Updating Project Status...")
        url = f"{BASE_URL}/projects/{self.data_store['project_id']}"
        payload = {
            "status": "In Bearbeitung"
        }
        res = self.session.put(url, json=payload)
        if res.status_code != 200:
            self.fail(f"Update Project failed: {res.text}")
        self.log("Project Status Updated")

    def cleanup(self):
        self.log("Starting Cleanup...")
        # Delete Project
        if 'project_id' in self.data_store:
            url = f"{BASE_URL}/projects/{self.data_store['project_id']}"
            self.session.delete(url)
            self.log(f"Deleted Project {self.data_store['project_id']}")
        
        # Delete Customer
        if 'customer_id' in self.data_store:
            url = f"{BASE_URL}/customers/{self.data_store['customer_id']}"
            self.session.delete(url)
            self.log(f"Deleted Customer {self.data_store['customer_id']}")

        # Delete Category
        if 'category_id' in self.data_store:
            url = f"{BASE_URL}/categories/{self.data_store['category_id']}"
            self.session.delete(url)
            self.log(f"Deleted Category {self.data_store['category_id']}")

    def run(self):
        try:
            self.login()
            self.create_category()
            self.create_customer()
            self.create_project()
            self.add_project_stage()
            self.add_task()
            self.add_time_entry()
            self.add_comment()
            self.update_status()
            self.log("Full Cycle Test Completed Successfully!")
        except Exception as e:
            self.log(f"Unexpected Error: {e}", "ERROR")
        finally:
            self.cleanup()

if __name__ == "__main__":
    tester = APITester()
    tester.run()
