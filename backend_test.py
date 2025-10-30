#!/usr/bin/env python3
"""
Backend API Testing Script for Admin Panel
Tests all admin endpoints with proper authentication and authorization
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

class AdminAPITester:
    def __init__(self):
        self.admin_token = None
        self.test_product_id = None
        self.test_order_id = None
        self.test_category_id = None
        self.results = []

class CartAPITester:
    def __init__(self):
        self.user_token = None
        self.test_product_id = None
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

    def test_user_login(self):
        """Test user login to get token for cart tests"""
        print("\n=== Testing User Login ===")
        
        # Test user credentials
        user_email = "testuser@example.com"
        user_password = "test123"
        
        try:
            response = requests.post(f"{BACKEND_URL}/auth/login", json={
                "email": user_email,
                "password": user_password
            })
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.user_token = data["access_token"]
                    self.log_result("User Login Success", True, "User login successful, token received")
                else:
                    self.log_result("User Login Success", False, "Token not found in response", data)
            else:
                # Try to register the user first
                print("User login failed, attempting to register...")
                register_response = requests.post(f"{BACKEND_URL}/auth/register", json={
                    "email": user_email,
                    "full_name": "Test User",
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
                    self.log_result("User Login Success", False, f"Login failed HTTP {response.status_code}, Registration failed HTTP {register_response.status_code}")
                
        except Exception as e:
            self.log_result("User Login Success", False, f"Request failed: {str(e)}")

    def get_random_product(self):
        """Get a random product for cart testing"""
        print("\n=== Getting Random Product for Cart Tests ===")
        
        try:
            response = requests.get(f"{BACKEND_URL}/products")
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) > 0:
                    # Get first product
                    product = products[0]
                    self.test_product_id = product.get("id")
                    self.log_result("Get Random Product", True, f"Selected product: {product.get('product_name', 'Unknown')} (ID: {self.test_product_id})")
                    return product
                else:
                    self.log_result("Get Random Product", False, "No products available")
                    return None
            else:
                self.log_result("Get Random Product", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_result("Get Random Product", False, f"Request failed: {str(e)}")
            return None

    def test_add_to_cart(self):
        """Test POST /api/cart/add"""
        print("\n=== Testing Add to Cart ===")
        
        if not self.user_token:
            self.log_result("Add to Cart", False, "No user token available")
            return
            
        if not self.test_product_id:
            self.log_result("Add to Cart", False, "No test product ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            cart_item = {
                "product_id": self.test_product_id,
                "quantity": 1
            }
            
            response = requests.post(f"{BACKEND_URL}/cart/add", headers=headers, json=cart_item)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "cart_count" in data:
                    self.log_result("Add to Cart", True, f"Item added to cart successfully. Cart count: {data['cart_count']}")
                else:
                    self.log_result("Add to Cart", False, "Missing expected fields in response", data)
            else:
                self.log_result("Add to Cart", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Add to Cart", False, f"Request failed: {str(e)}")

    def test_get_cart(self):
        """Test GET /api/cart"""
        print("\n=== Testing Get Cart ===")
        
        if not self.user_token:
            self.log_result("Get Cart", False, "No user token available")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.get(f"{BACKEND_URL}/cart", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "cart" in data and "total" in data:
                    cart_items = data["cart"]
                    if isinstance(cart_items, list):
                        self.log_result("Get Cart", True, f"Cart retrieved successfully. Items: {len(cart_items)}, Total: ₺{data['total']}")
                        
                        # Check cart item structure
                        if len(cart_items) > 0:
                            item = cart_items[0]
                            required_fields = ["product_id", "product_name", "price", "quantity", "subtotal"]
                            missing_fields = [field for field in required_fields if field not in item]
                            
                            if not missing_fields:
                                self.log_result("Cart Item Structure", True, "All required fields present in cart items")
                            else:
                                self.log_result("Cart Item Structure", False, f"Missing fields: {missing_fields}")
                        
                        return data
                    else:
                        self.log_result("Get Cart", False, "Cart is not a list", data)
                        return None
                else:
                    self.log_result("Get Cart", False, "Missing cart or total fields", data)
                    return None
            else:
                self.log_result("Get Cart", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_result("Get Cart", False, f"Request failed: {str(e)}")
            return None

    def test_update_cart(self):
        """Test PUT /api/cart/update"""
        print("\n=== Testing Update Cart ===")
        
        if not self.user_token:
            self.log_result("Update Cart", False, "No user token available")
            return
            
        if not self.test_product_id:
            self.log_result("Update Cart", False, "No test product ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            cart_item = {
                "product_id": self.test_product_id,
                "quantity": 2
            }
            
            response = requests.put(f"{BACKEND_URL}/cart/update", headers=headers, json=cart_item)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Update Cart", True, "Cart item quantity updated successfully")
                else:
                    self.log_result("Update Cart", False, "No success message in response", data)
            else:
                self.log_result("Update Cart", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Update Cart", False, f"Request failed: {str(e)}")

    def test_get_cart_after_update(self):
        """Test GET /api/cart after update to verify changes"""
        print("\n=== Testing Get Cart After Update ===")
        
        cart_data = self.test_get_cart()
        if cart_data:
            cart_items = cart_data.get("cart", [])
            if len(cart_items) > 0:
                # Find our test product
                test_item = None
                for item in cart_items:
                    if item.get("product_id") == self.test_product_id:
                        test_item = item
                        break
                
                if test_item:
                    if test_item.get("quantity") == 2:
                        self.log_result("Cart Update Verification", True, f"Quantity correctly updated to 2. Subtotal: ₺{test_item.get('subtotal', 0)}")
                    else:
                        self.log_result("Cart Update Verification", False, f"Expected quantity 2, got {test_item.get('quantity')}")
                else:
                    self.log_result("Cart Update Verification", False, "Test product not found in cart")
            else:
                self.log_result("Cart Update Verification", False, "Cart is empty after update")

    def test_remove_from_cart(self):
        """Test DELETE /api/cart/remove/{product_id}"""
        print("\n=== Testing Remove from Cart ===")
        
        if not self.user_token:
            self.log_result("Remove from Cart", False, "No user token available")
            return
            
        if not self.test_product_id:
            self.log_result("Remove from Cart", False, "No test product ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.delete(f"{BACKEND_URL}/cart/remove/{self.test_product_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "cart_count" in data:
                    self.log_result("Remove from Cart", True, f"Item removed from cart successfully. Cart count: {data['cart_count']}")
                else:
                    self.log_result("Remove from Cart", False, "Missing expected fields in response", data)
            else:
                self.log_result("Remove from Cart", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Remove from Cart", False, f"Request failed: {str(e)}")

    def test_clear_cart(self):
        """Test DELETE /api/cart/clear"""
        print("\n=== Testing Clear Cart ===")
        
        if not self.user_token:
            self.log_result("Clear Cart", False, "No user token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = requests.delete(f"{BACKEND_URL}/cart/clear", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Clear Cart", True, "Cart cleared successfully")
                    
                    # Verify cart is empty
                    verify_response = requests.get(f"{BACKEND_URL}/cart", headers=headers)
                    if verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        cart_items = verify_data.get("cart", [])
                        if len(cart_items) == 0:
                            self.log_result("Clear Cart Verification", True, "Cart is empty after clearing")
                        else:
                            self.log_result("Clear Cart Verification", False, f"Cart still has {len(cart_items)} items after clearing")
                    else:
                        self.log_result("Clear Cart Verification", False, f"Failed to verify clear: HTTP {verify_response.status_code}")
                else:
                    self.log_result("Clear Cart", False, "No success message in response", data)
            else:
                self.log_result("Clear Cart", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Clear Cart", False, f"Request failed: {str(e)}")

    def run_cart_tests(self):
        """Run all cart API tests"""
        print("🛒 Starting Cart API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("Test User: testuser@example.com")
        
        # Run tests in order
        self.test_user_login()
        product = self.get_random_product()
        
        if self.user_token and self.test_product_id:
            self.test_add_to_cart()
            self.test_get_cart()
            self.test_update_cart()
            self.test_get_cart_after_update()
            self.test_remove_from_cart()
            
            # Add item back for clear test
            self.test_add_to_cart()
            self.test_clear_cart()
        else:
            print("❌ Cannot run cart tests without user token and product ID")
        
        # Print summary
        print("\n" + "="*60)
        print("📊 CART API TEST SUMMARY")
        print("="*60)
        
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
        
        return passed == total if total > 0 else False
        
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
        """Test admin login endpoint"""
        print("\n=== Testing Admin Login ===")
        
        # Test successful login
        try:
            response = requests.post(f"{BACKEND_URL}/admin/auth/login", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.admin_token = data["access_token"]
                    self.log_result("Admin Login Success", True, "Admin login successful, token received")
                else:
                    self.log_result("Admin Login Success", False, "Token not found in response", data)
            else:
                self.log_result("Admin Login Success", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Login Success", False, f"Request failed: {str(e)}")
        
        # Test failed login with wrong credentials
        try:
            response = requests.post(f"{BACKEND_URL}/admin/auth/login", json={
                "email": ADMIN_EMAIL,
                "password": "wrongpassword"
            })
            
            if response.status_code == 401:
                self.log_result("Admin Login Failure", True, "Correctly rejected wrong credentials")
            else:
                self.log_result("Admin Login Failure", False, f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Admin Login Failure", False, f"Request failed: {str(e)}")
    
    def test_admin_me(self):
        """Test admin me endpoint"""
        print("\n=== Testing Admin Me ===")
        
        if not self.admin_token:
            self.log_result("Admin Me", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data and data["email"] == ADMIN_EMAIL:
                    self.log_result("Admin Me", True, "Admin info retrieved successfully")
                else:
                    self.log_result("Admin Me", False, "Invalid admin info returned", data)
            else:
                self.log_result("Admin Me", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Me", False, f"Request failed: {str(e)}")
    
    def test_admin_products_list(self):
        """Test admin products list endpoint"""
        print("\n=== Testing Admin Products List ===")
        
        if not self.admin_token:
            self.log_result("Admin Products List", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/products", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Admin Products List", True, f"Retrieved {len(data)} products")
                else:
                    self.log_result("Admin Products List", False, "Response is not a list", data)
            else:
                self.log_result("Admin Products List", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Products List", False, f"Request failed: {str(e)}")
    
    def test_admin_create_product(self):
        """Test admin create product endpoint"""
        print("\n=== Testing Admin Create Product ===")
        
        if not self.admin_token:
            self.log_result("Admin Create Product", False, "No admin token available")
            return
            
        test_product = {
            "product_name": "Test Koltuk Takımı",
            "category": "Oturma Grubu",
            "price": 15000.0,
            "discounted_price": 12000.0,
            "description": "Test amaçlı oluşturulan koltuk takımı",
            "dimensions": "200x80x90 cm",
            "materials": "Kumaş, Ahşap",
            "colors": "Gri, Bej",
            "stock_status": "Stokta",
            "stock_amount": 5,
            "image_urls": []
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.post(f"{BACKEND_URL}/admin/products", 
                                   headers=headers, json=test_product)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["product_name"] == test_product["product_name"]:
                    self.test_product_id = data["id"]
                    self.log_result("Admin Create Product", True, "Product created successfully")
                else:
                    self.log_result("Admin Create Product", False, "Invalid product data returned", data)
            else:
                self.log_result("Admin Create Product", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Create Product", False, f"Request failed: {str(e)}")
    
    def test_admin_update_product(self):
        """Test admin update product endpoint"""
        print("\n=== Testing Admin Update Product ===")
        
        if not self.admin_token:
            self.log_result("Admin Update Product", False, "No admin token available")
            return
            
        if not self.test_product_id:
            self.log_result("Admin Update Product", False, "No test product ID available")
            return
        
        update_data = {
            "price": 16000.0,
            "description": "Güncellenmiş test ürünü açıklaması"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.put(f"{BACKEND_URL}/admin/products/{self.test_product_id}", 
                                  headers=headers, json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("price") == update_data["price"]:
                    self.log_result("Admin Update Product", True, "Product updated successfully")
                else:
                    self.log_result("Admin Update Product", False, "Product not updated correctly", data)
            else:
                self.log_result("Admin Update Product", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Update Product", False, f"Request failed: {str(e)}")
    
    def test_admin_image_upload(self):
        """Test admin image upload endpoint"""
        print("\n=== Testing Admin Image Upload ===")
        
        if not self.admin_token:
            self.log_result("Admin Image Upload", False, "No admin token available")
            return
        
        # Create a small test image
        try:
            # Create a simple 100x100 red image
            img = Image.new('RGB', (100, 100), color='red')
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                img.save(tmp_file, format='JPEG')
                tmp_file_path = tmp_file.name
            
            # Upload the image
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            with open(tmp_file_path, 'rb') as f:
                files = {'file': ('test_image.jpg', f, 'image/jpeg')}
                response = requests.post(f"{BACKEND_URL}/admin/upload-image", 
                                       headers=headers, files=files)
            
            # Clean up temp file
            os.unlink(tmp_file_path)
            
            if response.status_code == 200:
                data = response.json()
                if "image_url" in data:
                    # Check if uploaded file exists by making a HEAD request
                    image_url = data["image_url"]
                    check_response = requests.head(image_url)
                    if check_response.status_code == 200:
                        self.log_result("Admin Image Upload", True, "Image uploaded and accessible")
                    else:
                        self.log_result("Admin Image Upload", False, f"Image uploaded but not accessible at {image_url}")
                else:
                    self.log_result("Admin Image Upload", False, "No image_url in response", data)
            else:
                self.log_result("Admin Image Upload", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Image Upload", False, f"Request failed: {str(e)}")
    
    def create_test_order(self):
        """Create a test user and order for testing order management"""
        print("\n=== Creating Test Order ===")
        
        # First create a test user
        test_user_data = {
            "email": "testuser@example.com",
            "full_name": "Test User",
            "password": "testpass123"
        }
        
        try:
            # Register test user
            response = requests.post(f"{BACKEND_URL}/auth/register", json=test_user_data)
            if response.status_code != 200:
                print(f"Failed to create test user: {response.status_code}")
                return False
            
            user_token = response.json().get("access_token")
            if not user_token:
                print("No user token received")
                return False
            
            # Add product to cart
            if not self.test_product_id:
                print("No test product available for order")
                return False
            
            cart_item = {
                "product_id": self.test_product_id,
                "quantity": 2
            }
            
            headers = {"Authorization": f"Bearer {user_token}"}
            response = requests.post(f"{BACKEND_URL}/cart/add", headers=headers, json=cart_item)
            if response.status_code != 200:
                print(f"Failed to add to cart: {response.status_code}")
                return False
            
            # Create order
            order_data = {
                "shipping_address": "Test Address, Test City, 12345"
            }
            
            response = requests.post(f"{BACKEND_URL}/orders", headers=headers, json=order_data)
            if response.status_code == 200:
                order = response.json()
                self.test_order_id = order.get("id")
                print(f"✅ Test order created with ID: {self.test_order_id}")
                return True
            else:
                print(f"Failed to create order: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Error creating test order: {str(e)}")
            return False

    def test_admin_orders_list(self):
        """Test admin orders list endpoint"""
        print("\n=== Testing Admin Orders List ===")
        
        if not self.admin_token:
            self.log_result("Admin Orders List", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/orders", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if orders have enriched data
                    if len(data) > 0:
                        order = data[0]
                        if not self.test_order_id:  # Only set if we don't have one from test creation
                            self.test_order_id = order.get("id")
                        if "user" in order and "items" in order:
                            self.log_result("Admin Orders List", True, f"Retrieved {len(data)} enriched orders")
                        else:
                            self.log_result("Admin Orders List", True, f"Retrieved {len(data)} orders (not enriched)")
                    else:
                        self.log_result("Admin Orders List", True, "Retrieved 0 orders")
                        # Try to create a test order if none exist
                        if self.create_test_order():
                            # Re-test after creating order
                            response = requests.get(f"{BACKEND_URL}/admin/orders", headers=headers)
                            if response.status_code == 200:
                                data = response.json()
                                if len(data) > 0:
                                    self.log_result("Admin Orders List", True, f"Retrieved {len(data)} orders after creating test order")
                else:
                    self.log_result("Admin Orders List", False, "Response is not a list", data)
            else:
                self.log_result("Admin Orders List", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Orders List", False, f"Request failed: {str(e)}")
    
    def test_admin_update_order_status(self):
        """Test admin update order status endpoint"""
        print("\n=== Testing Admin Update Order Status ===")
        
        if not self.admin_token:
            self.log_result("Admin Update Order Status", False, "No admin token available")
            return
            
        if not self.test_order_id:
            self.log_result("Admin Update Order Status", False, "No test order ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.put(f"{BACKEND_URL}/admin/orders/{self.test_order_id}/status", 
                                  headers=headers, json={"status": "preparing"})
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "preparing":
                    self.log_result("Admin Update Order Status", True, "Order status updated successfully")
                else:
                    self.log_result("Admin Update Order Status", False, "Order status not updated correctly", data)
            else:
                self.log_result("Admin Update Order Status", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Update Order Status", False, f"Request failed: {str(e)}")
    
    def test_admin_users_list(self):
        """Test admin users list endpoint"""
        print("\n=== Testing Admin Users List ===")
        
        if not self.admin_token:
            self.log_result("Admin Users List", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/users", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if users have order counts
                    if len(data) > 0:
                        user = data[0]
                        if "order_count" in user and "hashed_password" not in user:
                            self.log_result("Admin Users List", True, f"Retrieved {len(data)} users with order counts")
                        else:
                            self.log_result("Admin Users List", False, "Users missing order_count or contain passwords")
                    else:
                        self.log_result("Admin Users List", True, "Retrieved 0 users")
                else:
                    self.log_result("Admin Users List", False, "Response is not a list", data)
            else:
                self.log_result("Admin Users List", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Users List", False, f"Request failed: {str(e)}")
    
    def test_admin_dashboard_stats(self):
        """Test admin dashboard stats endpoint"""
        print("\n=== Testing Admin Dashboard Stats ===")
        
        if not self.admin_token:
            self.log_result("Admin Dashboard Stats", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/stats", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_users", "total_products", "total_orders", 
                                 "total_sales", "order_status_breakdown", "recent_orders"]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Admin Dashboard Stats", True, "All required stats fields present")
                else:
                    self.log_result("Admin Dashboard Stats", False, f"Missing fields: {missing_fields}", data)
            else:
                self.log_result("Admin Dashboard Stats", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Dashboard Stats", False, f"Request failed: {str(e)}")
    
    def test_authorization(self):
        """Test authorization - access without token and with regular user token"""
        print("\n=== Testing Authorization ===")
        
        # Test access without token
        try:
            response = requests.get(f"{BACKEND_URL}/admin/products")
            if response.status_code in [401, 403]:
                self.log_result("No Token Authorization", True, "Correctly rejected request without token")
            else:
                self.log_result("No Token Authorization", False, f"Expected 401/403, got {response.status_code}")
        except Exception as e:
            self.log_result("No Token Authorization", False, f"Request failed: {str(e)}")
        
        # Test access with invalid token
        try:
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.get(f"{BACKEND_URL}/admin/products", headers=headers)
            if response.status_code in [401, 403]:
                self.log_result("Invalid Token Authorization", True, "Correctly rejected invalid token")
            else:
                self.log_result("Invalid Token Authorization", False, f"Expected 401/403, got {response.status_code}")
        except Exception as e:
            self.log_result("Invalid Token Authorization", False, f"Request failed: {str(e)}")
    
    def test_admin_delete_product(self):
        """Test admin delete product endpoint"""
        print("\n=== Testing Admin Delete Product ===")
        
        if not self.admin_token:
            self.log_result("Admin Delete Product", False, "No admin token available")
            return
            
        if not self.test_product_id:
            self.log_result("Admin Delete Product", False, "No test product ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.delete(f"{BACKEND_URL}/admin/products/{self.test_product_id}", 
                                     headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Admin Delete Product", True, "Product deleted successfully")
                else:
                    self.log_result("Admin Delete Product", False, "No success message in response", data)
            else:
                self.log_result("Admin Delete Product", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Delete Product", False, f"Request failed: {str(e)}")

    def test_admin_categories_list(self):
        """Test admin categories list endpoint"""
        print("\n=== Testing Admin Categories List ===")
        
        if not self.admin_token:
            self.log_result("Admin Categories List", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/categories", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if we have the expected 17 categories
                    if len(data) == 17:
                        self.log_result("Admin Categories List", True, f"Retrieved expected 17 categories")
                    else:
                        self.log_result("Admin Categories List", True, f"Retrieved {len(data)} categories (expected 17)")
                    
                    # Check category structure
                    if len(data) > 0:
                        category = data[0]
                        required_fields = ["id", "name", "order", "is_active"]
                        missing_fields = [field for field in required_fields if field not in category]
                        
                        if not missing_fields:
                            # Check if sorted by order
                            orders = [cat.get("order", 0) for cat in data]
                            is_sorted = orders == sorted(orders)
                            if is_sorted:
                                self.log_result("Admin Categories Order", True, "Categories properly sorted by order")
                            else:
                                self.log_result("Admin Categories Order", False, "Categories not sorted by order")
                        else:
                            self.log_result("Admin Categories Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Admin Categories List", False, "Response is not a list", data)
            else:
                self.log_result("Admin Categories List", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Categories List", False, f"Request failed: {str(e)}")

    def test_admin_create_category(self):
        """Test admin create category endpoint"""
        print("\n=== Testing Admin Create Category ===")
        
        if not self.admin_token:
            self.log_result("Admin Create Category", False, "No admin token available")
            return
            
        test_category = {
            "name": "Test Kategori"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.post(f"{BACKEND_URL}/admin/categories", 
                                   headers=headers, json=test_category)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["name"] == test_category["name"]:
                    self.test_category_id = data["id"]
                    self.log_result("Admin Create Category", True, "Category created successfully")
                else:
                    self.log_result("Admin Create Category", False, "Invalid category data returned", data)
            else:
                self.log_result("Admin Create Category", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Create Category", False, f"Request failed: {str(e)}")

    def test_admin_update_category(self):
        """Test admin update category endpoint"""
        print("\n=== Testing Admin Update Category ===")
        
        if not self.admin_token:
            self.log_result("Admin Update Category", False, "No admin token available")
            return
        
        # Get first category ID from the list
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/categories", headers=headers)
            
            if response.status_code == 200:
                categories = response.json()
                if len(categories) > 0:
                    first_category_id = categories[0]["id"]
                    
                    update_data = {
                        "name": "Güncellenmiş Kategori"
                    }
                    
                    response = requests.put(f"{BACKEND_URL}/admin/categories/{first_category_id}", 
                                          headers=headers, json=update_data)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("name") == update_data["name"]:
                            self.log_result("Admin Update Category", True, "Category updated successfully")
                            
                            # Restore original name
                            restore_data = {"name": categories[0]["name"]}
                            requests.put(f"{BACKEND_URL}/admin/categories/{first_category_id}", 
                                       headers=headers, json=restore_data)
                        else:
                            self.log_result("Admin Update Category", False, "Category not updated correctly", data)
                    else:
                        self.log_result("Admin Update Category", False, f"HTTP {response.status_code}", response.text)
                else:
                    self.log_result("Admin Update Category", False, "No categories available to update")
            else:
                self.log_result("Admin Update Category", False, f"Failed to get categories: {response.status_code}")
                
        except Exception as e:
            self.log_result("Admin Update Category", False, f"Request failed: {str(e)}")

    def test_admin_reorder_categories(self):
        """Test admin reorder categories endpoint"""
        print("\n=== Testing Admin Reorder Categories ===")
        
        if not self.admin_token:
            self.log_result("Admin Reorder Categories", False, "No admin token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            # Get current categories
            response = requests.get(f"{BACKEND_URL}/admin/categories", headers=headers)
            
            if response.status_code == 200:
                categories = response.json()
                if len(categories) >= 3:
                    # Take first 3 categories and change their order
                    reorder_data = {
                        "categories": [
                            {"id": categories[0]["id"], "order": categories[2]["order"]},
                            {"id": categories[1]["id"], "order": categories[0]["order"]},
                            {"id": categories[2]["id"], "order": categories[1]["order"]}
                        ]
                    }
                    
                    response = requests.post(f"{BACKEND_URL}/admin/categories/reorder", 
                                           headers=headers, json=reorder_data)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "message" in data:
                            self.log_result("Admin Reorder Categories", True, "Categories reordered successfully")
                            
                            # Restore original order
                            restore_data = {
                                "categories": [
                                    {"id": categories[0]["id"], "order": categories[0]["order"]},
                                    {"id": categories[1]["id"], "order": categories[1]["order"]},
                                    {"id": categories[2]["id"], "order": categories[2]["order"]}
                                ]
                            }
                            requests.post(f"{BACKEND_URL}/admin/categories/reorder", 
                                        headers=headers, json=restore_data)
                        else:
                            self.log_result("Admin Reorder Categories", False, "No success message in response", data)
                    else:
                        self.log_result("Admin Reorder Categories", False, f"HTTP {response.status_code}", response.text)
                else:
                    self.log_result("Admin Reorder Categories", False, "Not enough categories to test reordering")
            else:
                self.log_result("Admin Reorder Categories", False, f"Failed to get categories: {response.status_code}")
                
        except Exception as e:
            self.log_result("Admin Reorder Categories", False, f"Request failed: {str(e)}")

    def test_admin_delete_category(self):
        """Test admin delete category endpoint"""
        print("\n=== Testing Admin Delete Category ===")
        
        if not self.admin_token:
            self.log_result("Admin Delete Category", False, "No admin token available")
            return
            
        if not hasattr(self, 'test_category_id') or not self.test_category_id:
            self.log_result("Admin Delete Category", False, "No test category ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.delete(f"{BACKEND_URL}/admin/categories/{self.test_category_id}", 
                                     headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Admin Delete Category", True, "Category deleted successfully")
                else:
                    self.log_result("Admin Delete Category", False, "No success message in response", data)
            else:
                self.log_result("Admin Delete Category", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Delete Category", False, f"Request failed: {str(e)}")

    def test_category_product_sorting(self):
        """Test category product sorting functionality - Mutfak Rafı category"""
        print("\n=== Testing Category Product Sorting - Mutfak Rafı ===")
        
        if not self.admin_token:
            self.log_result("Category Product Sorting", False, "No admin token available")
            return
        
        category_name = "Mutfak Rafı"
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        try:
            # 1. Test GET /api/admin/categories/{category_name}/products
            print(f"Testing GET /api/admin/categories/{category_name}/products")
            response = requests.get(f"{BACKEND_URL}/admin/categories/{category_name}/products", headers=headers)
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list):
                    product_count = len(products)
                    self.log_result("Get Category Products", True, f"Retrieved {product_count} products from {category_name}")
                    
                    # Check if we have the expected 14 products
                    if product_count == 14:
                        self.log_result("Expected Product Count", True, f"Found expected 14 products in {category_name}")
                    else:
                        self.log_result("Expected Product Count", False, f"Expected 14 products, found {product_count}")
                    
                    # Check if products have required fields
                    if len(products) > 0:
                        basic_required_fields = ["id", "product_name", "category", "price"]
                        first_product = products[0]
                        missing_basic_fields = [field for field in basic_required_fields if field not in first_product]
                        
                        if not missing_basic_fields:
                            self.log_result("Product Fields", True, "All basic required fields present in products")
                            
                            # Check how many products have category_order field
                            products_with_order = [p for p in products if p.get("category_order") is not None]
                            self.log_result("Category Order Field", True, f"{len(products_with_order)}/{len(products)} products have category_order field")
                            
                            # Check sorting by category_order (for products that have it)
                            if len(products_with_order) > 1:
                                category_orders = [p.get("category_order") for p in products_with_order]
                                is_sorted = all(category_orders[i] <= category_orders[i+1] for i in range(len(category_orders)-1))
                                if is_sorted:
                                    self.log_result("Product Sorting", True, "Products with category_order correctly sorted")
                                else:
                                    self.log_result("Product Sorting", False, f"Products not sorted by category_order: {category_orders}")
                            else:
                                self.log_result("Product Sorting", True, "Not enough products with category_order to verify sorting")
                        else:
                            self.log_result("Product Fields", False, f"Missing basic fields: {missing_basic_fields}")
                    
                    # Store first 3 products for reordering test
                    if len(products) >= 3:
                        self.test_products_for_reorder = products[:3]
                        
                        # 2. Test POST /api/admin/categories/{category_name}/products/reorder
                        print(f"Testing POST /api/admin/categories/{category_name}/products/reorder")
                        
                        # Change order: 0, 1, 2 → 2, 0, 1
                        reorder_data = {
                            "products": [
                                {"id": self.test_products_for_reorder[0]["id"], "category_order": 2},
                                {"id": self.test_products_for_reorder[1]["id"], "category_order": 0},
                                {"id": self.test_products_for_reorder[2]["id"], "category_order": 1}
                            ]
                        }
                        
                        reorder_response = requests.post(f"{BACKEND_URL}/admin/categories/{category_name}/products/reorder", 
                                                       headers=headers, json=reorder_data)
                        
                        if reorder_response.status_code == 200:
                            reorder_result = reorder_response.json()
                            if "message" in reorder_result:
                                self.log_result("Product Reorder", True, "Products reordered successfully")
                                
                                # 3. Verify reordering worked - get products again
                                verify_response = requests.get(f"{BACKEND_URL}/admin/categories/{category_name}/products", headers=headers)
                                if verify_response.status_code == 200:
                                    updated_products = verify_response.json()
                                    
                                    # Find our test products and check their new orders
                                    test_product_ids = [p["id"] for p in self.test_products_for_reorder]
                                    updated_test_products = [p for p in updated_products if p["id"] in test_product_ids]
                                    
                                    if len(updated_test_products) == 3:
                                        # Check if orders changed correctly
                                        orders_correct = True
                                        for product in updated_test_products:
                                            expected_order = None
                                            if product["id"] == self.test_products_for_reorder[0]["id"]:
                                                expected_order = 2
                                            elif product["id"] == self.test_products_for_reorder[1]["id"]:
                                                expected_order = 0
                                            elif product["id"] == self.test_products_for_reorder[2]["id"]:
                                                expected_order = 1
                                            
                                            if product.get("category_order") != expected_order:
                                                orders_correct = False
                                                break
                                        
                                        if orders_correct:
                                            self.log_result("Reorder Verification", True, "Product orders updated correctly")
                                        else:
                                            self.log_result("Reorder Verification", False, "Product orders not updated correctly")
                                    else:
                                        self.log_result("Reorder Verification", False, "Could not find all test products after reorder")
                                else:
                                    self.log_result("Reorder Verification", False, f"Failed to verify reorder: {verify_response.status_code}")
                            else:
                                self.log_result("Product Reorder", False, "No success message in reorder response", reorder_result)
                        else:
                            self.log_result("Product Reorder", False, f"HTTP {reorder_response.status_code}", reorder_response.text)
                    else:
                        self.log_result("Product Reorder", False, "Not enough products to test reordering")
                else:
                    self.log_result("Get Category Products", False, "Response is not a list", products)
            else:
                self.log_result("Get Category Products", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Category Product Sorting", False, f"Request failed: {str(e)}")

    def test_public_category_sorting(self):
        """Test public category product sorting endpoint"""
        print("\n=== Testing Public Category Product Sorting ===")
        
        category_name = "Mutfak Rafı"
        
        try:
            # Test GET /api/products?category=Mutfak Rafı (no auth required)
            response = requests.get(f"{BACKEND_URL}/products", params={"category": category_name})
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list):
                    product_count = len(products)
                    self.log_result("Public Category Products", True, f"Retrieved {product_count} products from public endpoint")
                    
                    # Check if products are sorted by category_order
                    if len(products) > 1:
                        category_orders = [p.get("category_order", 0) for p in products if p.get("category_order") is not None]
                        if len(category_orders) > 1:
                            is_sorted = all(category_orders[i] <= category_orders[i+1] for i in range(len(category_orders)-1))
                            if is_sorted:
                                self.log_result("Public Product Sorting", True, "Public products correctly sorted by category_order")
                            else:
                                self.log_result("Public Product Sorting", False, f"Public products not sorted by category_order: {category_orders}")
                        else:
                            self.log_result("Public Product Sorting", True, "Not enough products with category_order to verify sorting")
                    else:
                        self.log_result("Public Product Sorting", True, "Only one or no products found")
                        
                    # Verify same products as admin endpoint (if we have test products)
                    if hasattr(self, 'test_products_for_reorder') and self.test_products_for_reorder:
                        test_product_ids = [p["id"] for p in self.test_products_for_reorder]
                        public_test_products = [p for p in products if p["id"] in test_product_ids]
                        
                        if len(public_test_products) == len(self.test_products_for_reorder):
                            self.log_result("Public Admin Consistency", True, "Public endpoint shows same products as admin endpoint")
                        else:
                            self.log_result("Public Admin Consistency", False, "Public endpoint shows different products than admin endpoint")
                else:
                    self.log_result("Public Category Products", False, "Response is not a list", products)
            else:
                self.log_result("Public Category Products", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Public Category Sorting", False, f"Request failed: {str(e)}")

    def test_best_sellers_api(self):
        """Test best sellers API endpoint - GET /api/products/best-sellers/list"""
        print("\n=== Testing Best Sellers API ===")
        
        try:
            # Test GET /api/products/best-sellers/list (no auth required)
            response = requests.get(f"{BACKEND_URL}/products/best-sellers/list")
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list):
                    product_count = len(products)
                    
                    # Check if we have exactly 8 products
                    if product_count == 8:
                        self.log_result("Best Sellers Count", True, f"Retrieved exactly 8 best seller products")
                    else:
                        self.log_result("Best Sellers Count", False, f"Expected 8 products, got {product_count}")
                    
                    if len(products) > 0:
                        # Check required fields in each product
                        required_fields = ["product_name", "price", "category", "image_urls", "best_seller", "sales_count"]
                        all_fields_present = True
                        all_best_sellers = True
                        has_sales_count = True
                        
                        for i, product in enumerate(products):
                            # Check required fields
                            missing_fields = [field for field in required_fields if field not in product]
                            if missing_fields:
                                all_fields_present = False
                                self.log_result("Best Sellers Fields", False, f"Product {i+1} missing fields: {missing_fields}")
                                break
                            
                            # Check best_seller flag
                            if not product.get("best_seller", False):
                                all_best_sellers = False
                                self.log_result("Best Seller Flag", False, f"Product {i+1} ({product.get('product_name', 'Unknown')}) has best_seller=False")
                                break
                            
                            # Check sales_count field exists
                            if product.get("sales_count") is None:
                                has_sales_count = False
                                self.log_result("Sales Count Field", False, f"Product {i+1} ({product.get('product_name', 'Unknown')}) missing sales_count")
                                break
                        
                        if all_fields_present:
                            self.log_result("Best Sellers Fields", True, "All required fields present in all products")
                        
                        if all_best_sellers:
                            self.log_result("Best Seller Flag", True, "All products have best_seller=True")
                        
                        if has_sales_count:
                            self.log_result("Sales Count Field", True, "All products have sales_count field")
                        
                        # Check sorting by sales_count (descending order)
                        if len(products) > 1:
                            sales_counts = [p.get("sales_count", 0) for p in products]
                            is_sorted_desc = all(sales_counts[i] >= sales_counts[i+1] for i in range(len(sales_counts)-1))
                            
                            if is_sorted_desc:
                                self.log_result("Best Sellers Sorting", True, f"Products correctly sorted by sales_count (desc): {sales_counts}")
                            else:
                                self.log_result("Best Sellers Sorting", False, f"Products not sorted by sales_count (desc): {sales_counts}")
                        else:
                            self.log_result("Best Sellers Sorting", True, "Only one or no products to sort")
                        
                        # Log sample product details
                        if len(products) > 0:
                            sample_product = products[0]
                            sample_details = {
                                "name": sample_product.get("product_name", "N/A"),
                                "price": sample_product.get("price", "N/A"),
                                "category": sample_product.get("category", "N/A"),
                                "sales_count": sample_product.get("sales_count", "N/A"),
                                "best_seller": sample_product.get("best_seller", "N/A"),
                                "image_urls_count": len(sample_product.get("image_urls", []))
                            }
                            self.log_result("Sample Product", True, f"Top seller: {sample_details}")
                    else:
                        self.log_result("Best Sellers Empty", False, "No best seller products found")
                else:
                    self.log_result("Best Sellers Response", False, "Response is not a list", products)
            else:
                self.log_result("Best Sellers API", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Best Sellers API", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all admin API tests"""
        print("🚀 Starting Admin Panel Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Admin Email: {ADMIN_EMAIL}")
        
        # Run tests in order
        self.test_admin_login()
        self.test_admin_me()
        self.test_admin_products_list()
        self.test_admin_create_product()
        self.test_admin_update_product()
        self.test_admin_image_upload()
        self.test_admin_orders_list()
        self.test_admin_update_order_status()
        self.test_admin_users_list()
        self.test_admin_dashboard_stats()
        
        # Category management tests
        self.test_admin_categories_list()
        self.test_admin_create_category()
        self.test_admin_update_category()
        self.test_admin_reorder_categories()
        
        # Category product sorting tests (specific request)
        self.test_category_product_sorting()
        self.test_public_category_sorting()
        
        # Best sellers API test (specific request)
        self.test_best_sellers_api()
        
        self.test_admin_delete_category()  # Delete test category
        
        self.test_authorization()
        self.test_admin_delete_product()  # Delete test product at the end
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [r for r in self.results if not r["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return passed == total

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "cart":
        # Run only cart tests
        cart_tester = CartAPITester()
        success = cart_tester.run_cart_tests()
        
        if success:
            print("\n🎉 All cart tests passed!")
        else:
            print("\n⚠️  Some cart tests failed. Check the details above.")
    else:
        # Run admin tests (default behavior)
        tester = AdminAPITester()
        success = tester.run_all_tests()
        
        if success:
            print("\n🎉 All tests passed!")
        else:
            print("\n⚠️  Some tests failed. Check the details above.")