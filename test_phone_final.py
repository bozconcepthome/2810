#!/usr/bin/env python3
"""Test phone update - create fresh user"""

import requests

BACKEND_URL = "https://luxury-shop-update.preview.emergentagent.com/api"

# Register a new user with unique email
import time
unique_email = f"phonetest{int(time.time())}@example.com"

print(f"Registering new user: {unique_email}")
response = requests.post(f"{BACKEND_URL}/auth/register", json={
    "email": unique_email,
    "full_name": "Phone Test User",
    "phone_number": "5551111111",
    "password": "testpass123"
})

if response.status_code == 200:
    token = response.json().get("access_token")
    print(f"✅ Registration successful!")
    
    # Test phone update
    headers = {"Authorization": f"Bearer {token}"}
    new_phone = "5559876543"
    print(f"\nUpdating phone to: {new_phone}")
    response = requests.put(f"{BACKEND_URL}/auth/update-phone", 
                          headers=headers, json={"phone_number": new_phone})
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Phone update successful!")
        print(f"   Message: {data.get('message')}")
        print(f"   New phone: {data.get('phone_number')}")
    else:
        print(f"❌ Phone update failed: {response.status_code} - {response.text}")
else:
    print(f"❌ Registration failed: {response.status_code} - {response.text}")
