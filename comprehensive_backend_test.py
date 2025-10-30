#!/usr/bin/env python3
"""
Comprehensive Backend API Testing Script
Tests all new features: Preorder Products, Image Upload, Enhanced Admin APIs, User Phone Update
"""

import requests
import json
import os
from io import BytesIO
from PIL import Image
import tempfile

# Configuration
BACKEND_URL = "https://luxury-shop-update.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@bozconcept.com"
ADMIN_PASSWORD = "admin123"

class ComprehensiveTester:
    def __init__(self):
        self.admin_token = None
        self.user_token = None
        self.test_preorder_id = None
        self.test_user_id = None
        self.results = []

    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })

    def test_admin_login(self):
        """Test admin login to get token"""
        print("\n=== Testing Admin Login ===")
        
        try:
            response = requests.post(f"{BACKEND_URL}/admin/auth/login", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.admin_token = data["access_token"]
                    self.log_result("Admin Login", True, "Admin login successful, token received")
                else:
                    self.log_result("Admin Login", False, "Token not found in response", data)
            else:
                self.log_result("Admin Login", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Request failed: {str(e)}")

    def test_user_login(self):
        """Test user login to get token for user tests"""
        print("\n=== Testing User Login ===")
        
        user_email = "testuser@example.com"
        user_password = "test123"
        
        try:
            response = requests.post(f"{BACKEND_URL}/auth/login", json={
                "email": user_email,
                "password": user_password
            })
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.user_token = data["access_token"]
                    self.log_result("User Login", True, "User login successful, token received")
                else:
                    self.log_result("User Login", False, "Token not found in response", data)
            else:
                # Try to register the user first
                print("User login failed, attempting to register...")
                register_response = requests.post(f"{BACKEND_URL}/auth/register", json={
                    "email": user_email,
                    "full_name": "Test User",
                    "phone_number": "5551234567",
                    "password": user_password
                })
                
                if register_response.status_code == 200:
                    register_data = register_response.json()
                    if "access_token" in register_data:
                        self.user_token = register_data["access_token"]
                        self.log_result("User Registration & Login", True, "User registered and logged in successfully")
                    else:
                        self.log_result("User Registration & Login", False, "Registration successful but no token", register_data)
                else:
                    self.log_result("User Login", False, f"Login failed HTTP {response.status_code}, Registration failed HTTP {register_response.status_code}")
                
        except Exception as e:
            self.log_result("User Login", False, f"Request failed: {str(e)}")

    # ============ PREORDER PRODUCTS TESTS ============

    def test_get_public_preorder_products(self):
        """Test GET /api/preorder-products (public - active preorders)"""
        print("\n=== Testing GET Public Preorder Products ===")
        
        try:
            response = requests.get(f"{BACKEND_URL}/preorder-products")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    active_count = sum(1 for p in data if p.get("is_active", False))
                    self.log_result("Public Preorder Products", True, f"Retrieved {len(data)} preorder products ({active_count} active)")
                else:
                    self.log_result("Public Preorder Products", False, "Response is not a list", data)
            else:
                self.log_result("Public Preorder Products", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Public Preorder Products", False, f"Request failed: {str(e)}")

    def test_get_admin_preorder_products(self):
        """Test GET /api/admin/preorder-products (admin - all preorders)"""
        print("\n=== Testing GET Admin Preorder Products ===")
        
        if not self.admin_token:
            self.log_result("Admin Preorder Products", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/preorder-products", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    active_count = sum(1 for p in data if p.get("is_active", False))
                    inactive_count = len(data) - active_count
                    self.log_result("Admin Preorder Products", True, f"Retrieved {len(data)} preorder products (Active: {active_count}, Inactive: {inactive_count})")
                else:
                    self.log_result("Admin Preorder Products", False, "Response is not a list", data)
            else:
                self.log_result("Admin Preorder Products", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Preorder Products", False, f"Request failed: {str(e)}")

    def test_create_preorder_product(self):
        """Test POST /api/admin/preorder-products (create preorder with all fields)"""
        print("\n=== Testing POST Create Preorder Product ===")
        
        if not self.admin_token:
            self.log_result("Create Preorder Product", False, "No admin token available")
            return
            
        test_preorder = {
            "product_name": "Test Ön Sipariş Ürünü",
            "description": "Bu bir test ön sipariş ürünüdür. Yakında stoklarda!",
            "estimated_price": 2500.0,
            "estimated_release_date": "2025-03-01",
            "image_urls": ["https://example.com/test-image.jpg"],
            "category": "Mutfak Rafı",
            "discount_percentage": 15,
            "is_active": True
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.post(f"{BACKEND_URL}/admin/preorder-products", 
                                   headers=headers, json=test_preorder)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "product_name", "estimated_price", "is_active", "order", "created_at"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.test_preorder_id = data["id"]
                    self.log_result("Create Preorder Product", True, f"Preorder product created successfully with ID: {self.test_preorder_id}")
                    
                    # Verify all fields
                    if data["product_name"] == test_preorder["product_name"]:
                        self.log_result("Preorder Product Name", True, "Product name matches")
                    else:
                        self.log_result("Preorder Product Name", False, f"Expected '{test_preorder['product_name']}', got '{data['product_name']}'")
                    
                    if data["estimated_price"] == test_preorder["estimated_price"]:
                        self.log_result("Preorder Price", True, "Estimated price matches")
                    else:
                        self.log_result("Preorder Price", False, f"Expected {test_preorder['estimated_price']}, got {data['estimated_price']}")
                    
                    if data["discount_percentage"] == test_preorder["discount_percentage"]:
                        self.log_result("Preorder Discount", True, "Discount percentage matches")
                    else:
                        self.log_result("Preorder Discount", False, f"Expected {test_preorder['discount_percentage']}%, got {data['discount_percentage']}%")
                else:
                    self.log_result("Create Preorder Product", False, f"Missing fields: {missing_fields}", data)
            else:
                self.log_result("Create Preorder Product", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Create Preorder Product", False, f"Request failed: {str(e)}")

    def test_update_preorder_product(self):
        """Test PUT /api/admin/preorder-products/{id} (update preorder)"""
        print("\n=== Testing PUT Update Preorder Product ===")
        
        if not self.admin_token:
            self.log_result("Update Preorder Product", False, "No admin token available")
            return
            
        if not self.test_preorder_id:
            self.log_result("Update Preorder Product", False, "No test preorder ID available")
            return
        
        update_data = {
            "product_name": "Güncellenmiş Test Ön Sipariş Ürünü",
            "estimated_price": 2800.0,
            "discount_percentage": 20,
            "is_active": False
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.put(f"{BACKEND_URL}/admin/preorder-products/{self.test_preorder_id}", 
                                  headers=headers, json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("product_name") == update_data["product_name"] and \
                   data.get("estimated_price") == update_data["estimated_price"] and \
                   data.get("discount_percentage") == update_data["discount_percentage"] and \
                   data.get("is_active") == update_data["is_active"]:
                    self.log_result("Update Preorder Product", True, "Preorder product updated successfully")
                else:
                    self.log_result("Update Preorder Product", False, "Preorder product not updated correctly", data)
            else:
                self.log_result("Update Preorder Product", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Update Preorder Product", False, f"Request failed: {str(e)}")

    def test_reorder_preorder_products(self):
        """Test POST /api/admin/preorder-products/reorder (reorder preorders)"""
        print("\n=== Testing POST Reorder Preorder Products ===")
        
        if not self.admin_token:
            self.log_result("Reorder Preorder Products", False, "No admin token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            # Get current preorders
            response = requests.get(f"{BACKEND_URL}/admin/preorder-products", headers=headers)
            
            if response.status_code == 200:
                preorders = response.json()
                if len(preorders) >= 2:
                    # Take first 2 preorders and swap their order
                    reorder_data = {
                        "preorders": [
                            {"id": preorders[0]["id"], "order": preorders[1].get("order", 1)},
                            {"id": preorders[1]["id"], "order": preorders[0].get("order", 0)}
                        ]
                    }
                    
                    response = requests.post(f"{BACKEND_URL}/admin/preorder-products/reorder", 
                                           headers=headers, json=reorder_data)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "message" in data:
                            self.log_result("Reorder Preorder Products", True, "Preorder products reordered successfully")
                        else:
                            self.log_result("Reorder Preorder Products", False, "No success message in response", data)
                    else:
                        self.log_result("Reorder Preorder Products", False, f"HTTP {response.status_code}", response.text)
                else:
                    self.log_result("Reorder Preorder Products", True, "Not enough preorders to test reordering (need at least 2)")
            else:
                self.log_result("Reorder Preorder Products", False, f"Failed to get preorders: {response.status_code}")
                
        except Exception as e:
            self.log_result("Reorder Preorder Products", False, f"Request failed: {str(e)}")

    def test_delete_preorder_product(self):
        """Test DELETE /api/admin/preorder-products/{id} (delete preorder)"""
        print("\n=== Testing DELETE Preorder Product ===")
        
        if not self.admin_token:
            self.log_result("Delete Preorder Product", False, "No admin token available")
            return
            
        if not self.test_preorder_id:
            self.log_result("Delete Preorder Product", False, "No test preorder ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.delete(f"{BACKEND_URL}/admin/preorder-products/{self.test_preorder_id}", 
                                     headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Delete Preorder Product", True, "Preorder product deleted successfully")
                else:
                    self.log_result("Delete Preorder Product", False, "No success message in response", data)
            else:
                self.log_result("Delete Preorder Product", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Delete Preorder Product", False, f"Request failed: {str(e)}")

    # ============ IMAGE UPLOAD TESTS ============

    def test_image_upload_small(self):
        """Test POST /api/admin/upload-image with small file"""
        print("\n=== Testing Image Upload (Small File) ===")
        
        if not self.admin_token:
            self.log_result("Image Upload Small", False, "No admin token available")
            return
        
        try:
            # Create a small 100x100 test image
            img = Image.new('RGB', (100, 100), color='blue')
            
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                img.save(tmp_file, format='JPEG')
                tmp_file_path = tmp_file.name
            
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            with open(tmp_file_path, 'rb') as f:
                files = {'file': ('test_small.jpg', f, 'image/jpeg')}
                response = requests.post(f"{BACKEND_URL}/admin/upload-image", 
                                       headers=headers, files=files)
            
            os.unlink(tmp_file_path)
            
            if response.status_code == 200:
                data = response.json()
                if "image_url" in data:
                    image_url = data["image_url"]
                    # Verify image is accessible
                    check_response = requests.head(image_url)
                    if check_response.status_code == 200:
                        self.log_result("Image Upload Small", True, f"Small image uploaded and accessible at {image_url}")
                    else:
                        self.log_result("Image Upload Small", False, f"Image uploaded but not accessible (HTTP {check_response.status_code})")
                else:
                    self.log_result("Image Upload Small", False, "No image_url in response", data)
            else:
                self.log_result("Image Upload Small", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Image Upload Small", False, f"Request failed: {str(e)}")

    def test_image_upload_medium(self):
        """Test POST /api/admin/upload-image with medium file"""
        print("\n=== Testing Image Upload (Medium File) ===")
        
        if not self.admin_token:
            self.log_result("Image Upload Medium", False, "No admin token available")
            return
        
        try:
            # Create a medium 500x500 test image
            img = Image.new('RGB', (500, 500), color='green')
            
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                img.save(tmp_file, format='JPEG')
                tmp_file_path = tmp_file.name
            
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            with open(tmp_file_path, 'rb') as f:
                files = {'file': ('test_medium.jpg', f, 'image/jpeg')}
                response = requests.post(f"{BACKEND_URL}/admin/upload-image", 
                                       headers=headers, files=files)
            
            os.unlink(tmp_file_path)
            
            if response.status_code == 200:
                data = response.json()
                if "image_url" in data:
                    image_url = data["image_url"]
                    check_response = requests.head(image_url)
                    if check_response.status_code == 200:
                        self.log_result("Image Upload Medium", True, f"Medium image uploaded and accessible")
                    else:
                        self.log_result("Image Upload Medium", False, f"Image uploaded but not accessible (HTTP {check_response.status_code})")
                else:
                    self.log_result("Image Upload Medium", False, "No image_url in response", data)
            else:
                self.log_result("Image Upload Medium", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Image Upload Medium", False, f"Request failed: {str(e)}")

    def test_image_upload_large(self):
        """Test POST /api/admin/upload-image with large file"""
        print("\n=== Testing Image Upload (Large File) ===")
        
        if not self.admin_token:
            self.log_result("Image Upload Large", False, "No admin token available")
            return
        
        try:
            # Create a large 1920x1080 test image
            img = Image.new('RGB', (1920, 1080), color='red')
            
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                img.save(tmp_file, format='JPEG', quality=85)
                tmp_file_path = tmp_file.name
            
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            with open(tmp_file_path, 'rb') as f:
                files = {'file': ('test_large.jpg', f, 'image/jpeg')}
                response = requests.post(f"{BACKEND_URL}/admin/upload-image", 
                                       headers=headers, files=files)
            
            os.unlink(tmp_file_path)
            
            if response.status_code == 200:
                data = response.json()
                if "image_url" in data:
                    image_url = data["image_url"]
                    check_response = requests.head(image_url)
                    if check_response.status_code == 200:
                        self.log_result("Image Upload Large", True, f"Large image uploaded and accessible")
                    else:
                        self.log_result("Image Upload Large", False, f"Image uploaded but not accessible (HTTP {check_response.status_code})")
                else:
                    self.log_result("Image Upload Large", False, "No image_url in response", data)
            else:
                self.log_result("Image Upload Large", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Image Upload Large", False, f"Request failed: {str(e)}")

    # ============ ENHANCED ADMIN APIS TESTS ============

    def test_cart_analytics(self):
        """Test GET /api/admin/cart-analytics"""
        print("\n=== Testing Cart Analytics API ===")
        
        if not self.admin_token:
            self.log_result("Cart Analytics", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/cart-analytics", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_users_with_cart", "total_products_in_carts", "products", "user_carts"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Cart Analytics", True, f"Cart analytics retrieved successfully")
                    self.log_result("Cart Analytics Users", True, f"Users with cart: {data['total_users_with_cart']}")
                    self.log_result("Cart Analytics Products", True, f"Products in carts: {data['total_products_in_carts']}")
                    
                    # Check products array structure
                    if len(data["products"]) > 0:
                        product = data["products"][0]
                        product_fields = ["product_id", "product_name", "price", "image_url", "cart_count", "users"]
                        missing_product_fields = [field for field in product_fields if field not in product]
                        
                        if not missing_product_fields:
                            self.log_result("Cart Analytics Product Structure", True, "Product structure correct with image_url")
                        else:
                            self.log_result("Cart Analytics Product Structure", False, f"Missing fields: {missing_product_fields}")
                else:
                    self.log_result("Cart Analytics", False, f"Missing fields: {missing_fields}", data)
            else:
                self.log_result("Cart Analytics", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Cart Analytics", False, f"Request failed: {str(e)}")

    def test_users_detailed(self):
        """Test GET /api/admin/users/detailed"""
        print("\n=== Testing Users Detailed API ===")
        
        if not self.admin_token:
            self.log_result("Users Detailed", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/users/detailed", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Users Detailed", True, f"Retrieved {len(data)} users with detailed info")
                    
                    if len(data) > 0:
                        user = data[0]
                        required_fields = ["id", "email", "full_name", "phone_number", "hashed_password", 
                                         "order_count", "total_spent", "cart_items_count", "cart_details"]
                        missing_fields = [field for field in required_fields if field not in user]
                        
                        if not missing_fields:
                            self.log_result("Users Detailed Structure", True, "All required fields present including phone and password hash")
                            
                            # Check cart_details structure
                            if len(user.get("cart_details", [])) > 0:
                                cart_item = user["cart_details"][0]
                                cart_fields = ["product_id", "product_name", "price", "quantity", "image_url"]
                                missing_cart_fields = [field for field in cart_fields if field not in cart_item]
                                
                                if not missing_cart_fields:
                                    self.log_result("Users Cart Details Structure", True, "Cart details properly enriched with product info")
                                else:
                                    self.log_result("Users Cart Details Structure", False, f"Missing cart fields: {missing_cart_fields}")
                        else:
                            self.log_result("Users Detailed Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Users Detailed", False, "Response is not a list", data)
            else:
                self.log_result("Users Detailed", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Users Detailed", False, f"Request failed: {str(e)}")

    def test_dashboard_stats(self):
        """Test GET /api/admin/dashboard/stats"""
        print("\n=== Testing Dashboard Stats API ===")
        
        if not self.admin_token:
            self.log_result("Dashboard Stats", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/dashboard/stats", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_sections = ["overview", "recent_activity", "users", "inventory", "cart_analytics", "top_products"]
                missing_sections = [section for section in required_sections if section not in data]
                
                if not missing_sections:
                    self.log_result("Dashboard Stats", True, "All required sections present")
                    
                    # Check overview section
                    overview_fields = ["total_users", "total_products", "total_orders", "total_categories", "total_sales", "avg_order_value"]
                    missing_overview = [field for field in overview_fields if field not in data["overview"]]
                    if not missing_overview:
                        self.log_result("Dashboard Overview", True, f"Overview complete: {data['overview']['total_users']} users, {data['overview']['total_products']} products")
                    else:
                        self.log_result("Dashboard Overview", False, f"Missing overview fields: {missing_overview}")
                    
                    # Check cart_analytics section
                    cart_fields = ["users_with_items", "total_items_in_carts", "avg_cart_size"]
                    missing_cart = [field for field in cart_fields if field not in data["cart_analytics"]]
                    if not missing_cart:
                        self.log_result("Dashboard Cart Analytics", True, f"Cart analytics: {data['cart_analytics']['users_with_items']} users with items")
                    else:
                        self.log_result("Dashboard Cart Analytics", False, f"Missing cart fields: {missing_cart}")
                else:
                    self.log_result("Dashboard Stats", False, f"Missing sections: {missing_sections}", data)
            else:
                self.log_result("Dashboard Stats", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Dashboard Stats", False, f"Request failed: {str(e)}")

    # ============ USER PHONE UPDATE TEST ============

    def test_update_phone(self):
        """Test PUT /api/auth/update-phone"""
        print("\n=== Testing Update Phone API ===")
        
        if not self.user_token:
            self.log_result("Update Phone", False, "No user token available")
            return
        
        new_phone = "5559876543"
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.put(f"{BACKEND_URL}/auth/update-phone", 
                                  headers=headers, json={"phone_number": new_phone})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and data.get("phone_number") == new_phone:
                    self.log_result("Update Phone", True, f"Phone number updated successfully to {new_phone}")
                else:
                    self.log_result("Update Phone", False, "Phone number not updated correctly", data)
            else:
                self.log_result("Update Phone", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Update Phone", False, f"Request failed: {str(e)}")

    def run_all_tests(self):
        """Run all comprehensive tests"""
        print("🚀 Starting Comprehensive Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Admin: {ADMIN_EMAIL}")
        print("="*80)
        
        # Login first
        self.test_admin_login()
        self.test_user_login()
        
        if not self.admin_token:
            print("\n❌ Cannot run admin tests without admin token")
            return False
        
        # Run all test groups
        print("\n" + "="*80)
        print("📦 PREORDER PRODUCTS TESTS")
        print("="*80)
        self.test_get_public_preorder_products()
        self.test_get_admin_preorder_products()
        self.test_create_preorder_product()
        self.test_update_preorder_product()
        self.test_reorder_preorder_products()
        self.test_delete_preorder_product()
        
        print("\n" + "="*80)
        print("🖼️  IMAGE UPLOAD TESTS")
        print("="*80)
        self.test_image_upload_small()
        self.test_image_upload_medium()
        self.test_image_upload_large()
        
        print("\n" + "="*80)
        print("📊 ENHANCED ADMIN APIS TESTS")
        print("="*80)
        self.test_cart_analytics()
        self.test_users_detailed()
        self.test_dashboard_stats()
        
        print("\n" + "="*80)
        print("📱 USER PHONE UPDATE TEST")
        print("="*80)
        self.test_update_phone()
        
        # Print summary
        print("\n" + "="*80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("="*80)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%" if total > 0 else "No tests run")
        
        # Show failed tests
        failed_tests = [r for r in self.results if not r["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        else:
            print("\n✅ ALL TESTS PASSED!")
        
        return passed == total if total > 0 else False

if __name__ == "__main__":
    tester = ComprehensiveTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
