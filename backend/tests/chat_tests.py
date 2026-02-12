import requests
import sys
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"
ADMIN_EMAIL = "granpainside@yandex.ru"
ADMIN_PASS = "Nikitoso02-"

class ChatTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.data_store = {}

    def log(self, message, status="INFO"):
        print(f"[{status}] {message}")

    def fail(self, message):
        self.log(message, "FAIL")
        sys.exit(1)

    # --- Auth Helper ---
    def login(self, email, password):
        self.log(f"Logging in as {email}...")
        url = f"{BASE_URL}/login/access-token"
        payload = {
            "username": email,
            "password": password
        }
        res = self.session.post(url, data=payload)
        if res.status_code != 200:
            self.fail(f"Login failed for {email}: {res.text}")
        
        data = res.json()
        self.token = data["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        self.log("Login Successful")

    # --- Setup Steps (as Admin) ---
    def setup_entities(self):
        self.login(ADMIN_EMAIL, ADMIN_PASS)
        
        # Create User A
        self.log("Creating User A...")
        ua_email = f"userA_{int(time.time())}@example.com"
        res = self.session.post(f"{BASE_URL}/users/", json={
            "email": ua_email, "password": "password123", 
            "first_name": "User", "last_name": "A", "role": "Mitarbeiter"
        })
        if res.status_code not in [200, 201]: self.fail(f"Create User A failed: {res.text}")
        self.data_store['user_a'] = res.json()
        self.data_store['user_a_pass'] = "password123"

        # Create User B
        self.log("Creating User B...")
        ub_email = f"userB_{int(time.time())}@example.com"
        res = self.session.post(f"{BASE_URL}/users/", json={
            "email": ub_email, "password": "password123", 
            "first_name": "User", "last_name": "B", "role": "Mitarbeiter"
        })
        if res.status_code not in [200, 201]: self.fail(f"Create User B failed: {res.text}")
        self.data_store['user_b'] = res.json()
        self.data_store['user_b_pass'] = "password123"

        # Create Project (Needs Customer/Category first? Reuse existing or create new? Let's create minimal)
        # Create Category
        res = self.session.post(f"{BASE_URL}/categories/", json={
            "name": f"ChatCat_{int(time.time())}", "type": "Projekt", "color": "#000"
        })
        if res.status_code not in [200, 201]: self.fail("Create Category failed")
        self.data_store['cat_id'] = res.json()['id']

        # Create Customer
        res = self.session.post(f"{BASE_URL}/customers/", json={
            "company_name": f"ChatCorp_{int(time.time())}", "type": "Firma", "email": "c@c.com"
        })
        if res.status_code not in [200, 201]: self.fail("Create Customer failed")
        self.data_store['cust_id'] = res.json()['id']

        # Create Project
        res = self.session.post(f"{BASE_URL}/projects/", json={
            "name": f"Chat Project {int(time.time())}", 
            "customer_id": self.data_store['cust_id'],
            "category_id": self.data_store['cat_id']
        })
        if res.status_code not in [200, 201]: self.fail("Create Project failed")
        self.data_store['proj_id'] = res.json()['id']
        self.log(f"Setup Complete. Project ID: {self.data_store['proj_id']}")

    # --- Test Steps ---
    def send_message(self):
        # Login as User A
        self.login(self.data_store['user_a']['email'], self.data_store['user_a_pass'])
        
        self.log("Sending Message from A to B...")
        payload = {
            "recipient_id": self.data_store['user_b']['id'],
            "project_id": self.data_store['proj_id'],
            "content": "Hello User B, this is a test message."
        }
        res = self.session.post(f"{BASE_URL}/messages/", json=payload)
        if res.status_code not in [200, 201]:
            self.fail(f"Send Message failed: {res.text}")
        
        self.data_store['msg_id'] = res.json()['id']
        self.log("Message Sent")

    def read_message(self):
        # Login as User B
        self.login(self.data_store['user_b']['email'], self.data_store['user_b_pass'])
        
        self.log("Reading Conversation as User B...")
        # Get conv with User A
        url = f"{BASE_URL}/messages/conversation/{self.data_store['user_a']['id']}"
        res = self.session.get(url)
        if res.status_code != 200:
            self.fail(f"Read Conversation failed: {res.text}")
        
        messages = res.json()
        found = False
        for msg in messages:
            if msg['id'] == self.data_store['msg_id'] and msg['content'] == "Hello User B, this is a test message.":
                found = True
                break
        
        if found:
            self.log("Message Verified in Conversation")
        else:
            self.fail("Sent message not found in recipient's conversation")

    # --- Cleanup ---
    def cleanup(self):
        self.log("Cleaning up...")
        self.login(ADMIN_EMAIL, ADMIN_PASS)
        
        # Delete Project
        if 'proj_id' in self.data_store:
            self.session.delete(f"{BASE_URL}/projects/{self.data_store['proj_id']}")
        # Delete Customer/Category
        if 'cust_id' in self.data_store:
            self.session.delete(f"{BASE_URL}/customers/{self.data_store['cust_id']}")
        if 'cat_id' in self.data_store:
            self.session.delete(f"{BASE_URL}/categories/{self.data_store['cat_id']}")
        
        # Delete Users
        if 'user_a' in self.data_store:
            self.session.delete(f"{BASE_URL}/users/{self.data_store['user_a']['id']}")
        if 'user_b' in self.data_store:
            self.session.delete(f"{BASE_URL}/users/{self.data_store['user_b']['id']}")
        
        self.log("Cleanup Complete")

    def run(self):
        try:
            self.setup_entities()
            self.send_message()
            self.read_message()
            self.log("Chat Test Completed Successfully!")
        except Exception as e:
            self.log(f"Unexpected Error: {e}", "ERROR")
        finally:
            # Attempt cleanup if admin login possible
            try:
                self.cleanup()
            except:
                pass

if __name__ == "__main__":
    tester = ChatTester()
    tester.run()
