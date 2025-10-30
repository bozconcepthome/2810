#!/usr/bin/env python3
"""
Admin Panel Backend API Testing Script
Tests all admin panel endpoints as per review request
"""

import requests
import json

# Configuration
BACKEND_URL = "https://luxury-shop-update.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@bozconcept.com"
ADMIN_PASSWORD = "admin123"

class AdminPanelTester:
    def __init__(self):
        self.admin_token = None
        self.test_category_id = None
        self.results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2, ensure_ascii=False)}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def test_admin_login(self):
        """Test POST /api/admin/auth/login with correct credentials"""
        print("\n=== 1. Testing Admin Authentication ===")
        print("Testing POST /api/admin/auth/login")
        
        try:
            response = requests.post(f"{BACKEND_URL}/admin/auth/login", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.admin_token = data["access_token"]
                    self.log_result("Admin Login", True, "Admin login successful, token received")
                else:
                    self.log_result("Admin Login", False, "Token not found in response", data)
            else:
                self.log_result("Admin Login", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Request failed: {str(e)}")
    
    def test_admin_me(self):
        """Test GET /api/admin/me endpoint with token"""
        print("\nTesting GET /api/admin/auth/me")
        
        if not self.admin_token:
            self.log_result("Admin Me", False, "No admin token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data and data["email"] == ADMIN_EMAIL:
                    self.log_result("Admin Me", True, f"Admin info retrieved: {data['email']}")
                else:
                    self.log_result("Admin Me", False, "Invalid admin info returned", data)
            else:
                self.log_result("Admin Me", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Admin Me", False, f"Request failed: {str(e)}")
    
    def test_list_categories(self):
        """Test GET /api/admin/categories - List all categories"""
        print("\n=== 2. Testing Category Management APIs ===")
        print("Testing GET /api/admin/categories")
        
        if not self.admin_token:
            self.log_result("List Categories", False, "No admin token available")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/categories", headers=headers)
            
            if response.status_code == 200:
                categories = response.json()
                if isinstance(categories, list):
                    total_count = len(categories)
                    active_count = sum(1 for cat in categories if cat.get("is_active", True))
                    hidden_count = total_count - active_count
                    
                    self.log_result("List Categories", True, 
                                  f"Retrieved {total_count} categories (Active: {active_count}, Hidden: {hidden_count})")
                    return categories
                else:
                    self.log_result("List Categories", False, "Response is not a list", categories)
                    return None
            else:
                self.log_result("List Categories", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_result("List Categories", False, f"Request failed: {str(e)}")
            return None
    
    def test_create_category(self):
        """Test POST /api/admin/categories - Create new category"""
        print("\nTesting POST /api/admin/categories")
        
        if not self.admin_token:
            self.log_result("Create Category", False, "No admin token available")
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
                    self.log_result("Create Category", True, 
                                  f"Category created: {data['name']} (ID: {data['id']})")
                else:
                    self.log_result("Create Category", False, "Invalid category data returned", data)
            else:
                self.log_result("Create Category", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Create Category", False, f"Request failed: {str(e)}")
    
    def test_update_category(self):
        """Test PUT /api/admin/categories/{id} - Update category"""
        print("\nTesting PUT /api/admin/categories/{id}")
        
        if not self.admin_token:
            self.log_result("Update Category", False, "No admin token available")
            return
            
        if not self.test_category_id:
            self.log_result("Update Category", False, "No test category ID available")
            return
        
        # Test 1: Change name
        update_data = {
            "name": "Test Kategori Güncellenmiş"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.put(f"{BACKEND_URL}/admin/categories/{self.test_category_id}", 
                                  headers=headers, json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == update_data["name"]:
                    self.log_result("Update Category Name", True, 
                                  f"Category name updated to: {data['name']}")
                else:
                    self.log_result("Update Category Name", False, "Name not updated correctly", data)
            else:
                self.log_result("Update Category Name", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Update Category Name", False, f"Request failed: {str(e)}")
        
        # Test 2: Toggle is_active
        toggle_data = {
            "is_active": False
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.put(f"{BACKEND_URL}/admin/categories/{self.test_category_id}", 
                                  headers=headers, json=toggle_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("is_active") == False:
                    self.log_result("Toggle Category Active", True, 
                                  f"Category is_active toggled to: {data['is_active']}")
                else:
                    self.log_result("Toggle Category Active", False, "is_active not toggled correctly", data)
            else:
                self.log_result("Toggle Category Active", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Toggle Category Active", False, f"Request failed: {str(e)}")
    
    def test_reorder_categories(self):
        """Test POST /api/admin/categories/reorder - Reorder categories"""
        print("\nTesting POST /api/admin/categories/reorder")
        
        if not self.admin_token:
            self.log_result("Reorder Categories", False, "No admin token available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            # Get current categories
            response = requests.get(f"{BACKEND_URL}/admin/categories", headers=headers)
            
            if response.status_code == 200:
                categories = response.json()
                if len(categories) >= 2:
                    # Take first 2 categories and swap their order
                    reorder_data = {
                        "categories": [
                            {"id": categories[0]["id"], "order": categories[1]["order"]},
                            {"id": categories[1]["id"], "order": categories[0]["order"]}
                        ]
                    }
                    
                    response = requests.post(f"{BACKEND_URL}/admin/categories/reorder", 
                                           headers=headers, json=reorder_data)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "message" in data:
                            self.log_result("Reorder Categories", True, "Categories reordered successfully")
                            
                            # Restore original order
                            restore_data = {
                                "categories": [
                                    {"id": categories[0]["id"], "order": categories[0]["order"]},
                                    {"id": categories[1]["id"], "order": categories[1]["order"]}
                                ]
                            }
                            requests.post(f"{BACKEND_URL}/admin/categories/reorder", 
                                        headers=headers, json=restore_data)
                        else:
                            self.log_result("Reorder Categories", False, "No success message", data)
                    else:
                        self.log_result("Reorder Categories", False, f"HTTP {response.status_code}", response.text)
                else:
                    self.log_result("Reorder Categories", False, "Not enough categories to test reordering")
            else:
                self.log_result("Reorder Categories", False, f"Failed to get categories: {response.status_code}")
                
        except Exception as e:
            self.log_result("Reorder Categories", False, f"Request failed: {str(e)}")
    
    def test_delete_category(self):
        """Test DELETE /api/admin/categories/{id} - Delete test category"""
        print("\nTesting DELETE /api/admin/categories/{id}")
        
        if not self.admin_token:
            self.log_result("Delete Category", False, "No admin token available")
            return
            
        if not self.test_category_id:
            self.log_result("Delete Category", False, "No test category ID available")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.delete(f"{BACKEND_URL}/admin/categories/{self.test_category_id}", 
                                     headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Delete Category", True, "Test category deleted successfully")
                else:
                    self.log_result("Delete Category", False, "No success message", data)
            else:
                self.log_result("Delete Category", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Delete Category", False, f"Request failed: {str(e)}")
    
    def test_list_products(self):
        """Test GET /api/admin/products - List all products"""
        print("\n=== 3. Testing Products APIs ===")
        print("Testing GET /api/admin/products")
        
        if not self.admin_token:
            self.log_result("List Products", False, "No admin token available")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/products", headers=headers)
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list):
                    self.log_result("List Products", True, f"Retrieved {len(products)} products")
                    return products
                else:
                    self.log_result("List Products", False, "Response is not a list", products)
                    return None
            else:
                self.log_result("List Products", False, f"HTTP {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_result("List Products", False, f"Request failed: {str(e)}")
            return None
    
    def test_products_by_category(self, categories):
        """Test GET /api/products?category={name} - Get products by category"""
        print("\nTesting GET /api/products?category={name}")
        
        if not categories or len(categories) == 0:
            self.log_result("Products by Category", False, "No categories available")
            return
        
        # Test with first category
        test_category = categories[0]["name"]
        
        try:
            response = requests.get(f"{BACKEND_URL}/products", params={"category": test_category})
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list):
                    self.log_result("Products by Category", True, 
                                  f"Retrieved {len(products)} products for category '{test_category}'")
                else:
                    self.log_result("Products by Category", False, "Response is not a list", products)
            else:
                self.log_result("Products by Category", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Products by Category", False, f"Request failed: {str(e)}")
    
    def test_statistics(self, categories, products):
        """Test statistics - category counts and product counts per category"""
        print("\n=== 4. Testing Statistics ===")
        
        if categories is None:
            self.log_result("Category Statistics", False, "No categories data available")
            return
        
        # Category counts
        total_categories = len(categories)
        active_categories = sum(1 for cat in categories if cat.get("is_active", True))
        hidden_categories = total_categories - active_categories
        
        self.log_result("Category Counts", True, 
                      f"Total: {total_categories}, Active: {active_categories}, Hidden: {hidden_categories}")
        
        # Product counts per category
        if products is None:
            self.log_result("Product Counts per Category", False, "No products data available")
            return
        
        category_product_counts = {}
        for product in products:
            category = product.get("category", "Unknown")
            category_product_counts[category] = category_product_counts.get(category, 0) + 1
        
        print("\nProduct counts per category:")
        for category_name, count in sorted(category_product_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {category_name}: {count} products")
        
        self.log_result("Product Counts per Category", True, 
                      f"Calculated product counts for {len(category_product_counts)} categories")
    
    def test_authentication_required(self):
        """Test that all admin endpoints require authentication"""
        print("\n=== Testing Authentication Requirements ===")
        
        endpoints = [
            ("GET", f"{BACKEND_URL}/admin/categories"),
            ("GET", f"{BACKEND_URL}/admin/products"),
            ("GET", f"{BACKEND_URL}/admin/stats")
        ]
        
        all_protected = True
        for method, url in endpoints:
            try:
                if method == "GET":
                    response = requests.get(url)
                
                if response.status_code in [401, 403]:
                    print(f"  ✅ {method} {url.split('/api')[1]} - Protected")
                else:
                    print(f"  ❌ {method} {url.split('/api')[1]} - Not protected (HTTP {response.status_code})")
                    all_protected = False
            except Exception as e:
                print(f"  ❌ {method} {url.split('/api')[1]} - Error: {str(e)}")
                all_protected = False
        
        if all_protected:
            self.log_result("Authentication Required", True, "All admin endpoints require authentication")
        else:
            self.log_result("Authentication Required", False, "Some endpoints not properly protected")
    
    def run_all_tests(self):
        """Run all admin panel tests"""
        print("="*70)
        print("🔧 ADMIN PANEL BACKEND API TESTING")
        print("="*70)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Admin Email: {ADMIN_EMAIL}")
        print("="*70)
        
        # 1. Admin Authentication
        self.test_admin_login()
        self.test_admin_me()
        
        # 2. Category Management
        categories = self.test_list_categories()
        self.test_create_category()
        self.test_update_category()
        self.test_reorder_categories()
        self.test_delete_category()
        
        # 3. Products APIs
        products = self.test_list_products()
        self.test_products_by_category(categories)
        
        # 4. Statistics
        self.test_statistics(categories, products)
        
        # 5. Authentication Requirements
        self.test_authentication_required()
        
        # Print summary
        print("\n" + "="*70)
        print("📊 TEST SUMMARY")
        print("="*70)
        
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
        
        print("="*70)
        
        return passed == total if total > 0 else False

if __name__ == "__main__":
    tester = AdminPanelTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
