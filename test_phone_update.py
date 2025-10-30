#!/usr/bin/env python3
"""Test phone update with existing user"""

import requests

BACKEND_URL = "https://luxury-shop-update.preview.emergentagent.com/api"

# Try with an existing user from the database
existing_users = [
    {"email": "splendor35@outlook.com", "password": "test123"},
    {"email": "admin@bozconcept.com", "password": "admin123"}
]

for user_creds in existing_users:
    print(f"\nTrying to login with {user_creds['email']}...")
    response = requests.post(f"{BACKEND_URL}/auth/login", json=user_creds)
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        print(f"✅ Login successful!")
        
        # Test phone update
        headers = {"Authorization": f"Bearer {token}"}
        new_phone = "5559876543"
        response = requests.put(f"{BACKEND_URL}/auth/update-phone", 
                              headers=headers, json={"phone_number": new_phone})
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Phone update successful: {data}")
        else:
            print(f"❌ Phone update failed: {response.status_code} - {response.text}")
        break
    else:
        print(f"❌ Login failed: {response.status_code}")
