#!/usr/bin/env python3
"""
Test script for new Admin Dashboard APIs
Tests the following endpoints:
1. GET /api/admin/dashboard/stats
2. GET /api/admin/cart-analytics
3. GET /api/admin/users/detailed
"""

import requests
import json

# Configuration
BACKEND_URL = "https://luxury-shop-update.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@bozconcept.com"
ADMIN_PASSWORD = "admin123"

class NewAdminDashboardTester:
    def __init__(self):
        self.admin_token = None
        self.results = []
    
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
        
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
                    return True
                else:
                    self.log_result("Admin Login", False, "Token not found in response", data)
                    return False
            else:
                self.log_result("Admin Login", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Request failed: {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test GET /api/admin/dashboard/stats"""
        print("\n=== Testing GET /api/admin/dashboard/stats ===")
        
        if not self.admin_token:
            self.log_result("Dashboard Stats", False, "No admin token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/dashboard/stats", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for required top-level fields
                required_fields = ["overview", "recent_activity", "users", "inventory", "cart_analytics", "top_products"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Dashboard Stats - Top Level Fields", False, f"Missing fields: {missing_fields}", data)
                    return
                else:
                    self.log_result("Dashboard Stats - Top Level Fields", True, "All required top-level fields present")
                
                # Check overview fields
                overview_fields = ["total_users", "total_products", "total_orders", "total_categories", "total_sales", "avg_order_value"]
                overview = data.get("overview", {})
                missing_overview = [field for field in overview_fields if field not in overview]
                
                if missing_overview:
                    self.log_result("Dashboard Stats - Overview Fields", False, f"Missing overview fields: {missing_overview}")
                else:
                    self.log_result("Dashboard Stats - Overview Fields", True, f"All overview fields present: {overview}")
                
                # Check recent_activity fields
                recent_activity_fields = ["sales_last_7_days", "orders_last_7_days"]
                recent_activity = data.get("recent_activity", {})
                missing_recent = [field for field in recent_activity_fields if field not in recent_activity]
                
                if missing_recent:
                    self.log_result("Dashboard Stats - Recent Activity Fields", False, f"Missing recent activity fields: {missing_recent}")
                else:
                    self.log_result("Dashboard Stats - Recent Activity Fields", True, f"All recent activity fields present: {recent_activity}")
                
                # Check users fields
                users_fields = ["boz_plus_members", "conversion_rate", "users_with_orders"]
                users = data.get("users", {})
                missing_users = [field for field in users_fields if field not in users]
                
                if missing_users:
                    self.log_result("Dashboard Stats - Users Fields", False, f"Missing users fields: {missing_users}")
                else:
                    self.log_result("Dashboard Stats - Users Fields", True, f"All users fields present: {users}")
                
                # Check inventory fields
                inventory_fields = ["out_of_stock", "low_stock", "in_stock"]
                inventory = data.get("inventory", {})
                missing_inventory = [field for field in inventory_fields if field not in inventory]
                
                if missing_inventory:
                    self.log_result("Dashboard Stats - Inventory Fields", False, f"Missing inventory fields: {missing_inventory}")
                else:
                    self.log_result("Dashboard Stats - Inventory Fields", True, f"All inventory fields present: {inventory}")
                
                # Check cart_analytics fields
                cart_analytics_fields = ["users_with_items", "total_items_in_carts", "avg_cart_size"]
                cart_analytics = data.get("cart_analytics", {})
                missing_cart = [field for field in cart_analytics_fields if field not in cart_analytics]
                
                if missing_cart:
                    self.log_result("Dashboard Stats - Cart Analytics Fields", False, f"Missing cart analytics fields: {missing_cart}")
                else:
                    self.log_result("Dashboard Stats - Cart Analytics Fields", True, f"All cart analytics fields present: {cart_analytics}")
                
                # Check top_products
                top_products = data.get("top_products", [])
                if isinstance(top_products, list):
                    self.log_result("Dashboard Stats - Top Products", True, f"Top products is a list with {len(top_products)} items")
                    
                    # Check structure of top products if any exist
                    if len(top_products) > 0:
                        product_fields = ["product_id", "product_name", "image_url", "total_sold", "revenue"]
                        first_product = top_products[0]
                        missing_product_fields = [field for field in product_fields if field not in first_product]
                        
                        if missing_product_fields:
                            self.log_result("Dashboard Stats - Top Product Fields", False, f"Missing product fields: {missing_product_fields}")
                        else:
                            self.log_result("Dashboard Stats - Top Product Fields", True, f"All product fields present in top products")
                else:
                    self.log_result("Dashboard Stats - Top Products", False, "Top products is not a list")
                
            else:
                self.log_result("Dashboard Stats", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Dashboard Stats", False, f"Request failed: {str(e)}")
    
    def test_cart_analytics(self):
        """Test GET /api/admin/cart-analytics"""
        print("\n=== Testing GET /api/admin/cart-analytics ===")
        
        if not self.admin_token:
            self.log_result("Cart Analytics", False, "No admin token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/cart-analytics", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for required fields
                required_fields = ["total_users_with_cart", "total_products_in_carts", "products", "user_carts"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Cart Analytics - Required Fields", False, f"Missing fields: {missing_fields}", data)
                else:
                    self.log_result("Cart Analytics - Required Fields", True, "All required fields present")
                    
                    # Log summary data
                    summary = {
                        "total_users_with_cart": data.get("total_users_with_cart"),
                        "total_products_in_carts": data.get("total_products_in_carts"),
                        "products_count": len(data.get("products", [])),
                        "user_carts_count": len(data.get("user_carts", []))
                    }
                    self.log_result("Cart Analytics - Summary", True, f"Cart analytics data retrieved", summary)
                    
                    # Check products structure if any exist
                    products = data.get("products", [])
                    if len(products) > 0:
                        product_fields = ["product_id", "product_name", "price", "image_url", "cart_count", "users"]
                        first_product = products[0]
                        missing_product_fields = [field for field in product_fields if field not in first_product]
                        
                        if missing_product_fields:
                            self.log_result("Cart Analytics - Product Fields", False, f"Missing product fields: {missing_product_fields}")
                        else:
                            self.log_result("Cart Analytics - Product Fields", True, "All product fields present")
                    
                    # Check user_carts structure if any exist
                    user_carts = data.get("user_carts", [])
                    if len(user_carts) > 0:
                        user_cart_fields = ["user_id", "email", "full_name", "cart_items", "cart"]
                        first_user_cart = user_carts[0]
                        missing_user_fields = [field for field in user_cart_fields if field not in first_user_cart]
                        
                        if missing_user_fields:
                            self.log_result("Cart Analytics - User Cart Fields", False, f"Missing user cart fields: {missing_user_fields}")
                        else:
                            self.log_result("Cart Analytics - User Cart Fields", True, "All user cart fields present")
                
            else:
                self.log_result("Cart Analytics", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Cart Analytics", False, f"Request failed: {str(e)}")
    
    def test_users_detailed(self):
        """Test GET /api/admin/users/detailed"""
        print("\n=== Testing GET /api/admin/users/detailed ===")
        
        if not self.admin_token:
            self.log_result("Users Detailed", False, "No admin token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/users/detailed", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    self.log_result("Users Detailed - Response Type", True, f"Retrieved {len(data)} users")
                    
                    if len(data) > 0:
                        # Check first user structure
                        first_user = data[0]
                        
                        # Required fields including sensitive data
                        required_fields = ["id", "email", "full_name", "phone_number", "hashed_password", 
                                         "order_count", "total_spent", "cart_items_count", "cart_details"]
                        missing_fields = [field for field in required_fields if field not in first_user]
                        
                        if missing_fields:
                            self.log_result("Users Detailed - Required Fields", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_result("Users Detailed - Required Fields", True, "All required fields present including phone and hashed_password")
                        
                        # Check if hashed_password is actually present (not excluded)
                        if "hashed_password" in first_user:
                            self.log_result("Users Detailed - Password Hash", True, "hashed_password field is present (as required)")
                        else:
                            self.log_result("Users Detailed - Password Hash", False, "hashed_password field is missing")
                        
                        # Check cart_details structure
                        cart_details = first_user.get("cart_details", [])
                        if isinstance(cart_details, list):
                            self.log_result("Users Detailed - Cart Details Type", True, f"cart_details is a list with {len(cart_details)} items")
                            
                            if len(cart_details) > 0:
                                cart_item_fields = ["product_id", "product_name", "price", "quantity", "image_url"]
                                first_cart_item = cart_details[0]
                                missing_cart_fields = [field for field in cart_item_fields if field not in first_cart_item]
                                
                                if missing_cart_fields:
                                    self.log_result("Users Detailed - Cart Item Fields", False, f"Missing cart item fields: {missing_cart_fields}")
                                else:
                                    self.log_result("Users Detailed - Cart Item Fields", True, "All cart item fields present")
                        else:
                            self.log_result("Users Detailed - Cart Details Type", False, "cart_details is not a list")
                        
                        # Log sample user data (without sensitive info in logs)
                        sample_user = {
                            "email": first_user.get("email"),
                            "full_name": first_user.get("full_name"),
                            "phone_number": first_user.get("phone_number"),
                            "has_password_hash": "hashed_password" in first_user,
                            "order_count": first_user.get("order_count"),
                            "total_spent": first_user.get("total_spent"),
                            "cart_items_count": first_user.get("cart_items_count")
                        }
                        self.log_result("Users Detailed - Sample User", True, f"Sample user data", sample_user)
                    else:
                        self.log_result("Users Detailed - No Users", True, "No users found in database")
                else:
                    self.log_result("Users Detailed - Response Type", False, "Response is not a list", data)
                
            else:
                self.log_result("Users Detailed", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Users Detailed", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all new admin dashboard API tests"""
        print("🚀 Starting New Admin Dashboard API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Admin Email: {ADMIN_EMAIL}")
        print("="*60)
        
        # Login first
        if not self.test_admin_login():
            print("\n❌ Cannot proceed without admin token")
            return False
        
        # Run all tests
        self.test_dashboard_stats()
        self.test_cart_analytics()
        self.test_users_detailed()
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
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

if __name__ == "__main__":
    tester = NewAdminDashboardTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All new admin dashboard API tests passed!")
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
