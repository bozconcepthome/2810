from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import shutil
from PIL import Image
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'boz-concept-home-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    hashed_password: str
    is_boz_plus: bool = False
    boz_plus_expiry_date: Optional[str] = None
    boz_plus_requested: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_name: str
    category: str
    price: float
    discounted_price: Optional[float] = None
    boz_plus_price: Optional[float] = None
    description: Optional[str] = None
    dimensions: Optional[str] = None
    materials: Optional[str] = None
    colors: Optional[str] = None
    barcode: Optional[str] = None
    stock_status: str = "Stokta"
    stock_amount: Optional[int] = None
    image_urls: List[str] = []
    category_order: Optional[int] = None  # Order within category for manual sorting
    best_seller: Optional[bool] = False  # Best seller flag
    sales_count: Optional[int] = 0  # Number of sales for sorting
    best_seller_rank: Optional[int] = None  # Rank among best sellers

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem]
    total: float
    shipping_address: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "pending"

class OrderCreate(BaseModel):
    shipping_address: str

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    order: int = 0
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CategoryCreate(BaseModel):
    name: str
    order: Optional[int] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryReorder(BaseModel):
    categories: List[dict]  # [{"id": "...", "order": 0}, ...]

class ProductReorder(BaseModel):
    products: List[dict]  # [{"id": "...", "category_order": 0}, ...]

class PreorderProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_name: str
    description: Optional[str] = None
    estimated_price: float
    estimated_release_date: Optional[str] = None
    image_urls: List[str] = []
    category: Optional[str] = None
    discount_percentage: Optional[int] = 0  # Early bird discount
    is_active: bool = True
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PreorderProductCreate(BaseModel):
    product_name: str
    description: Optional[str] = None
    estimated_price: float
    estimated_release_date: Optional[str] = None
    image_urls: List[str] = []
    category: Optional[str] = None
    discount_percentage: Optional[int] = 0
    is_active: Optional[bool] = True

class PreorderProductUpdate(BaseModel):
    product_name: Optional[str] = None
    description: Optional[str] = None
    estimated_price: Optional[float] = None
    estimated_release_date: Optional[str] = None
    image_urls: Optional[List[str]] = None
    category: Optional[str] = None
    discount_percentage: Optional[int] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    product_id: str
    product_name: str
    price: float
    discounted_price: Optional[float] = None
    boz_plus_price: Optional[float] = None
    image_url: Optional[str] = None
    quantity: int
    subtotal: float

class AnalyticsEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str  # "page_view", "product_click", "category_click", "add_to_cart"
    event_data: dict  # {product_id, product_name, category, etc}
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AnalyticsEventCreate(BaseModel):
    event_type: str
    event_data: dict
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    hashed_password: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class ProductCreate(BaseModel):
    product_name: str
    category: str
    price: float
    discounted_price: Optional[float] = None
    boz_plus_price: Optional[float] = None
    description: Optional[str] = None
    dimensions: Optional[str] = None
    materials: Optional[str] = None
    colors: Optional[str] = None
    barcode: Optional[str] = None
    stock_status: str = "Stokta"
    stock_amount: Optional[int] = None
    image_urls: List[str] = []

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    discounted_price: Optional[float] = None
    boz_plus_price: Optional[float] = None
    description: Optional[str] = None
    dimensions: Optional[str] = None
    materials: Optional[str] = None
    colors: Optional[str] = None
    barcode: Optional[str] = None
    stock_status: Optional[str] = None
    stock_amount: Optional[int] = None
    image_urls: Optional[List[str]] = None

class OrderStatusUpdate(BaseModel):
    status: str

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if admin_id is None or role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
        if admin is None:
            raise HTTPException(status_code=403, detail="Admin not found")
        return Admin(**admin)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=403, detail="Admin access required")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        hashed_password=hash_password(user_data.password)
    )
    
    await db.users.insert_one(user.model_dump())
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer")

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["id"]})
    return Token(access_token=access_token, token_type="bearer")

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_boz_plus": getattr(current_user, "is_boz_plus", False),
        "boz_plus_expires_at": getattr(current_user, "boz_plus_expires_at", None)
    }

@api_router.put("/auth/update-email")
async def update_email(
    new_email: str = Body(..., embed=True),
    password: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    """Update user email address"""
    # Verify current password
    if not pwd_context.verify(password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mevcut şifre yanlış")
    
    # Check if new email already exists
    existing_user = await db.users.find_one({"email": new_email})
    if existing_user and existing_user["id"] != current_user.id:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kullanılıyor")
    
    # Update email
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"email": new_email}}
    )
    
    return {"message": "E-posta başarıyla güncellendi", "new_email": new_email}

@api_router.put("/auth/update-password")
async def update_password(
    current_password: str = Body(..., embed=True),
    new_password: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    """Update user password"""
    # Verify current password
    if not pwd_context.verify(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mevcut şifre yanlış")
    
    # Hash new password
    hashed_new_password = pwd_context.hash(new_password)
    
    # Update password
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"hashed_password": hashed_new_password}}
    )
    
    return {"message": "Şifre başarıyla güncellendi"}

@api_router.put("/auth/update-phone")
async def update_phone(
    phone_number: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    """Update user phone number"""
    # Update phone
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"phone_number": phone_number}}
    )
    
    return {"message": "Telefon numarası başarıyla güncellendi", "phone_number": phone_number}

@api_router.post("/auth/forgot-password")
async def forgot_password(email: str = Body(..., embed=True)):
    """Send password reset email"""
    # Check if user exists
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "Eğer e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi"}
    
    # Generate reset token (valid for 1 hour)
    import secrets
    import datetime
    
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    
    # Save reset token to database
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expires": expires_at
        }}
    )
    
    # In production, send email here
    # For now, just return success (token will be logged in console for testing)
    print(f"Reset token for {email}: {reset_token}")
    print(f"Reset URL: /reset-password?token={reset_token}")
    
    return {"message": "Şifre sıfırlama bağlantısı e-postanıza gönderildi"}

@api_router.post("/auth/reset-password")
async def reset_password(
    token: str = Body(..., embed=True),
    new_password: str = Body(..., embed=True)
):
    """Reset password using token"""
    import datetime
    
    # Find user with valid token
    user = await db.users.find_one({
        "reset_token": token,
        "reset_token_expires": {"$gt": datetime.datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş token")
    
    # Hash new password
    hashed_password = pwd_context.hash(new_password)
    
    # Update password and clear reset token
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "hashed_password": hashed_password
        },
        "$unset": {
            "reset_token": "",
            "reset_token_expires": ""
        }}
    )
    
    return {"message": "Şifre başarıyla sıfırlandı"}

# ============ PRODUCT ROUTES ============

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    color: Optional[str] = None,
    material: Optional[str] = None
):
    query = {}
    
    if category:
        query["category"] = category
    if search:
        query["product_name"] = {"$regex": search, "$options": "i"}
    if color:
        query["colors"] = {"$regex": color, "$options": "i"}
    if material:
        query["materials"] = {"$regex": material, "$options": "i"}
    
    # Sort by category_order if category is specified, otherwise by product_name
    sort_field = "category_order" if category else "product_name"
    products = await db.products.find(query, {"_id": 0}).sort(sort_field, 1).to_list(1000)
    
    # Price filter (after fetching)
    if min_price is not None or max_price is not None:
        filtered_products = []
        for p in products:
            price = p.get('discounted_price') or p.get('price', 0)
            if min_price is not None and price < min_price:
                continue
            if max_price is not None and price > max_price:
                continue
            filtered_products.append(p)
        products = filtered_products
    
    return products

@api_router.get("/products/best-sellers/list", response_model=List[Product])
async def get_best_sellers():
    """Get best selling products - top 4"""
    products = await db.products.find(
        {"best_seller": True}, 
        {"_id": 0}
    ).sort("sales_count", -1).limit(4).to_list(4)
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.get("/categories")
async def get_categories():
    # Get categories from categories collection (sorted by order)
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    
    if not categories:
        # Fallback: get from products if no categories defined
        category_names = await db.products.distinct("category")
        return {"categories": category_names}
    
    return {"categories": [cat["name"] for cat in categories]}

# ============ CART ROUTES (OLD - REMOVED) ============
# These routes have been replaced by the new cart implementation below

# ============ ORDER ROUTES ============

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Get current user to check BOZ PLUS status
    user = await db.users.find_one({"id": current_user.id})
    is_boz_plus = user.get("is_boz_plus", False)
    
    # Check if BOZ PLUS is still valid
    if is_boz_plus and user.get("boz_plus_expiry_date"):
        expiry = datetime.fromisoformat(user["boz_plus_expiry_date"])
        if expiry < datetime.now(timezone.utc):
            is_boz_plus = False
    
    # Calculate total with BOZ PLUS prices if applicable
    total = 0.0
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            # Use BOZ PLUS price if user is BOZ PLUS member and product has BOZ PLUS price
            if is_boz_plus and product.get('boz_plus_price'):
                price = product['boz_plus_price']
            else:
                price = product.get('discounted_price') or product.get('price', 0)
            total += price * item["quantity"]
    
    order = Order(
        user_id=current_user.id,
        items=cart["items"],
        total=total,
        shipping_address=order_data.shipping_address
    )
    
    await db.orders.insert_one(order.model_dump())
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return order

@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    return orders

# ============ ADMIN AUTH ROUTES ============

@api_router.post("/admin/auth/login", response_model=Token)
async def admin_login(admin_data: AdminLogin):
    admin = await db.admins.find_one({"email": admin_data.email}, {"_id": 0})
    if not admin or not verify_password(admin_data.password, admin["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": admin["id"], "role": "admin"})
    return Token(access_token=access_token, token_type="bearer")

@api_router.get("/admin/auth/me")
async def get_admin_me(current_admin: Admin = Depends(get_current_admin)):
    return {
        "id": current_admin.id,
        "email": current_admin.email,
        "full_name": current_admin.full_name
    }

# ============ ADMIN PRODUCT ROUTES ============

@api_router.get("/admin/products")
async def admin_get_products(current_admin: Admin = Depends(get_current_admin)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.post("/admin/products")
async def admin_create_product(
    product_data: ProductCreate,
    current_admin: Admin = Depends(get_current_admin)
):
    product = Product(**product_data.model_dump())
    await db.products.insert_one(product.model_dump())
    return product

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.products.update_one(
            {"id": product_id},
            {"$set": update_data}
        )
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated_product)

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(
    product_id: str,
    current_admin: Admin = Depends(get_current_admin)
):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.post("/admin/upload-image")
async def admin_upload_image(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    # Create uploads directory if it doesn't exist
    uploads_dir = Path("/app/backend/uploads")
    uploads_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = uploads_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return public URL
    backend_url = os.environ.get('BACKEND_URL', 'https://luxury-shop-update.preview.emergentagent.com')
    image_url = f"{backend_url}/uploads/{unique_filename}"
    
    return {"image_url": image_url}

# ============ ADMIN ORDER ROUTES ============

@api_router.get("/admin/orders")
async def admin_get_orders(current_admin: Admin = Depends(get_current_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    # Enrich orders with user and product information
    enriched_orders = []
    for order in orders:
        # Get user info
        user = await db.users.find_one({"id": order["user_id"]}, {"_id": 0, "email": 1, "full_name": 1})
        
        # Get product info for each item
        items_with_products = []
        for item in order.get("items", []):
            product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
            if product:
                items_with_products.append({
                    **item,
                    "product": product
                })
        
        enriched_orders.append({
            **order,
            "user": user,
            "items": items_with_products
        })
    
    return enriched_orders

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(
    order_id: str,
    status_data: OrderStatusUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    # Validate status
    valid_statuses = ["pending", "preparing", "shipped", "in_transit", "delivered"]
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_data.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated_order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return updated_order

# ============ ADMIN USER ROUTES ============

@api_router.get("/admin/users")
async def admin_get_users(current_admin: Admin = Depends(get_current_admin)):
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    
    # Add order count for each user
    enriched_users = []
    for user in users:
        order_count = await db.orders.count_documents({"user_id": user["id"]})
        enriched_users.append({
            **user,
            "order_count": order_count
        })
    
    return enriched_users

# ============ ADMIN STATS ROUTES ============

@api_router.get("/admin/stats")
async def admin_get_stats(current_admin: Admin = Depends(get_current_admin)):
    # Count documents
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    # Calculate total sales
    orders = await db.orders.find({}, {"_id": 0, "total": 1}).to_list(10000)
    total_sales = sum(order.get("total", 0) for order in orders)
    
    # Get order status breakdown
    pending_orders = await db.orders.count_documents({"status": "pending"})
    preparing_orders = await db.orders.count_documents({"status": "preparing"})
    shipped_orders = await db.orders.count_documents({"status": "shipped"})
    in_transit_orders = await db.orders.count_documents({"status": "in_transit"})
    delivered_orders = await db.orders.count_documents({"status": "delivered"})
    
    # Get recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    # Enrich recent orders with user info
    for order in recent_orders:
        user = await db.users.find_one({"id": order["user_id"]}, {"_id": 0, "email": 1, "full_name": 1})
        order["user"] = user
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": total_sales,
        "order_status_breakdown": {
            "pending": pending_orders,
            "preparing": preparing_orders,
            "shipped": shipped_orders,
            "in_transit": in_transit_orders,
            "delivered": delivered_orders
        },
        "recent_orders": recent_orders
    }

# ============ ADMIN CATEGORY ROUTES ============

@api_router.get("/admin/categories")
async def admin_get_categories(current_admin: Admin = Depends(get_current_admin)):
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return categories

@api_router.post("/admin/categories")
async def admin_create_category(
    category_data: CategoryCreate,
    current_admin: Admin = Depends(get_current_admin)
):
    # Check if category already exists
    existing = await db.categories.find_one({"name": category_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    # Get max order
    max_order_cat = await db.categories.find_one({}, sort=[("order", -1)])
    next_order = (max_order_cat["order"] + 1) if max_order_cat else 0
    
    category = Category(
        name=category_data.name,
        order=category_data.order if category_data.order is not None else next_order
    )
    
    await db.categories.insert_one(category.model_dump())
    return category

@api_router.put("/admin/categories/{category_id}")
async def admin_update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    existing_category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {k: v for k, v in category_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.categories.update_one(
            {"id": category_id},
            {"$set": update_data}
        )
    
    updated_category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    return Category(**updated_category)

@api_router.delete("/admin/categories/{category_id}")
async def admin_delete_category(
    category_id: str,
    current_admin: Admin = Depends(get_current_admin)
):
    # Check if category has products
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    product_count = await db.products.count_documents({"category": category["name"]})
    if product_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category with {product_count} products. Please reassign or delete products first."
        )
    
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

@api_router.post("/admin/categories/reorder")
async def admin_reorder_categories(
    reorder_data: CategoryReorder,
    current_admin: Admin = Depends(get_current_admin)
):
    # Update order for each category
    for cat in reorder_data.categories:
        await db.categories.update_one(
            {"id": cat["id"]},
            {"$set": {"order": cat["order"]}}
        )
    
    return {"message": "Categories reordered successfully"}

# ============ ADMIN CATEGORY PRODUCTS SORTING ============

@api_router.get("/admin/categories/{category_name}/products")
async def admin_get_category_products(
    category_name: str,
    current_admin: Admin = Depends(get_current_admin)
):
    """Get all products in a category sorted by category_order"""
    products = await db.products.find(
        {"category": category_name},
        {"_id": 0}
    ).sort("category_order", 1).to_list(1000)
    
    return products

@api_router.post("/admin/categories/{category_name}/products/reorder")
async def admin_reorder_category_products(
    category_name: str,
    reorder_data: ProductReorder,
    current_admin: Admin = Depends(get_current_admin)
):
    """Update product order within a category"""
    # Update category_order for each product
    for product in reorder_data.products:
        await db.products.update_one(
            {"id": product["id"], "category": category_name},
            {"$set": {"category_order": product["category_order"]}}
        )
    
    return {"message": f"Products in {category_name} reordered successfully"}

# ============ CART ROUTES ============

@api_router.get("/cart")
async def get_cart(current_user: User = Depends(get_current_user)):
    """Get user's cart"""
    user_data = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    cart_items = user_data.get("cart", [])
    
    # Fetch product details for each cart item
    cart_response = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            # Determine price based on user's BOZ PLUS status
            if user_data.get("is_boz_plus") and product.get("boz_plus_price"):
                price = product["boz_plus_price"]
            elif product.get("discounted_price"):
                price = product["discounted_price"]
            else:
                price = product["price"]
            
            cart_response.append({
                "product_id": product["id"],
                "product_name": product["product_name"],
                "price": product["price"],
                "discounted_price": product.get("discounted_price"),
                "boz_plus_price": product.get("boz_plus_price"),
                "image_url": product.get("image_urls", [None])[0],
                "quantity": item["quantity"],
                "subtotal": price * item["quantity"]
            })
    
    return {"cart": cart_response, "total": sum(item["subtotal"] for item in cart_response)}

@api_router.post("/cart/add")
async def add_to_cart(cart_item: CartItem, current_user: User = Depends(get_current_user)):
    """Add item to cart"""
    # Check if product exists
    product = await db.products.find_one({"id": cart_item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get user's current cart
    user_data = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    cart = user_data.get("cart", [])
    
    # Check if product already in cart
    existing_item = next((item for item in cart if item["product_id"] == cart_item.product_id), None)
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += cart_item.quantity
    else:
        # Add new item
        cart.append({"product_id": cart_item.product_id, "quantity": cart_item.quantity})
    
    # Update user's cart
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"cart": cart}}
    )
    
    return {"message": "Product added to cart", "cart_count": len(cart)}

@api_router.put("/cart/update")
async def update_cart_item(cart_item: CartItem, current_user: User = Depends(get_current_user)):
    """Update cart item quantity"""
    user_data = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    cart = user_data.get("cart", [])
    
    # Find and update item
    item = next((item for item in cart if item["product_id"] == cart_item.product_id), None)
    if item:
        if cart_item.quantity <= 0:
            cart.remove(item)
        else:
            item["quantity"] = cart_item.quantity
        
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"cart": cart}}
        )
        return {"message": "Cart updated"}
    
    raise HTTPException(status_code=404, detail="Item not found in cart")

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    """Remove item from cart"""
    user_data = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    cart = user_data.get("cart", [])
    
    # Remove item
    cart = [item for item in cart if item["product_id"] != product_id]
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"cart": cart}}
    )
    
    return {"message": "Item removed from cart", "cart_count": len(cart)}

@api_router.delete("/cart/clear")
async def clear_cart(current_user: User = Depends(get_current_user)):
    """Clear all items from cart"""
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"cart": []}}
    )
    
    return {"message": "Cart cleared"}

# ============ ANALYTICS ROUTES ============

@api_router.post("/analytics/event")
async def track_event(event: AnalyticsEventCreate):
    """Track analytics event (public endpoint)"""
    analytics_event = AnalyticsEvent(**event.model_dump())
    await db.analytics_events.insert_one(analytics_event.model_dump())
    return {"message": "Event tracked"}

@api_router.get("/admin/analytics/summary")
async def admin_analytics_summary(
    days: Optional[int] = None,
    current_admin: Admin = Depends(get_current_admin)
):
    """Get analytics summary with optional time filter"""
    
    # Build time filter
    query = {}
    if days:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        query["created_at"] = {"$gte": cutoff_date.isoformat()}
    
    # Total events
    total_events = await db.analytics_events.count_documents(query)
    
    # Page views
    page_view_query = {**query, "event_type": "page_view"}
    total_page_views = await db.analytics_events.count_documents(page_view_query)
    
    # Product clicks
    product_click_query = {**query, "event_type": "product_click"}
    total_product_clicks = await db.analytics_events.count_documents(product_click_query)
    
    # Category clicks
    category_click_query = {**query, "event_type": "category_click"}
    total_category_clicks = await db.analytics_events.count_documents(category_click_query)
    
    # Add to cart
    add_to_cart_query = {**query, "event_type": "add_to_cart"}
    total_add_to_cart = await db.analytics_events.count_documents(add_to_cart_query)
    
    # Most clicked products
    product_clicks = await db.analytics_events.find(product_click_query).to_list(10000)
    product_click_counts = {}
    for event in product_clicks:
        product_id = event.get("event_data", {}).get("product_id")
        if product_id:
            if product_id not in product_click_counts:
                product_click_counts[product_id] = {
                    "product_id": product_id,
                    "product_name": event.get("event_data", {}).get("product_name", "Unknown"),
                    "category": event.get("event_data", {}).get("category", "Unknown"),
                    "count": 0,
                    "last_clicked": event.get("created_at")
                }
            product_click_counts[product_id]["count"] += 1
            if event.get("created_at") > product_click_counts[product_id]["last_clicked"]:
                product_click_counts[product_id]["last_clicked"] = event.get("created_at")
    
    top_products = sorted(product_click_counts.values(), key=lambda x: x["count"], reverse=True)[:10]
    
    # Most clicked categories
    category_clicks = await db.analytics_events.find(category_click_query).to_list(10000)
    category_click_counts = {}
    for event in category_clicks:
        category = event.get("event_data", {}).get("category")
        if category:
            if category not in category_click_counts:
                category_click_counts[category] = {
                    "category": category,
                    "count": 0,
                    "last_clicked": event.get("created_at")
                }
            category_click_counts[category]["count"] += 1
            if event.get("created_at") > category_click_counts[category]["last_clicked"]:
                category_click_counts[category]["last_clicked"] = event.get("created_at")
    
    top_categories = sorted(category_click_counts.values(), key=lambda x: x["count"], reverse=True)[:10]
    
    # Most added to cart products
    cart_events = await db.analytics_events.find(add_to_cart_query).to_list(10000)
    cart_counts = {}
    for event in cart_events:
        product_id = event.get("event_data", {}).get("product_id")
        if product_id:
            if product_id not in cart_counts:
                cart_counts[product_id] = {
                    "product_id": product_id,
                    "product_name": event.get("event_data", {}).get("product_name", "Unknown"),
                    "count": 0,
                    "last_added": event.get("created_at")
                }
            cart_counts[product_id]["count"] += 1
            if event.get("created_at") > cart_counts[product_id]["last_added"]:
                cart_counts[product_id]["last_added"] = event.get("created_at")
    
    top_cart_products = sorted(cart_counts.values(), key=lambda x: x["count"], reverse=True)[:10]
    
    # Page views breakdown
    page_views = await db.analytics_events.find(page_view_query).to_list(10000)
    page_counts = {}
    for event in page_views:
        page = event.get("event_data", {}).get("page", "Unknown")
        page_counts[page] = page_counts.get(page, 0) + 1
    
    return {
        "summary": {
            "total_events": total_events,
            "total_page_views": total_page_views,
            "total_product_clicks": total_product_clicks,
            "total_category_clicks": total_category_clicks,
            "total_add_to_cart": total_add_to_cart
        },
        "top_products": top_products,
        "top_categories": top_categories,
        "top_cart_products": top_cart_products,
        "page_views": page_counts,
        "time_filter": f"Last {days} days" if days else "All time"
    }

@api_router.get("/admin/analytics/timeline")
async def admin_analytics_timeline(
    days: int = 7,
    current_admin: Admin = Depends(get_current_admin)
):
    """Get analytics timeline for charts"""
    
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    query = {"created_at": {"$gte": cutoff_date.isoformat()}}
    
    events = await db.analytics_events.find(query).to_list(10000)
    
    # Group by day and event type
    timeline = {}
    for event in events:
        created_at = datetime.fromisoformat(event["created_at"])
        day_key = created_at.strftime("%Y-%m-%d")
        event_type = event["event_type"]
        
        if day_key not in timeline:
            timeline[day_key] = {
                "date": day_key,
                "page_view": 0,
                "product_click": 0,
                "category_click": 0,
                "add_to_cart": 0
            }
        
        timeline[day_key][event_type] = timeline[day_key].get(event_type, 0) + 1
    
    # Sort by date
    sorted_timeline = sorted(timeline.values(), key=lambda x: x["date"])
    
    return sorted_timeline

# ============ BOZ PLUS ROUTES ============

@api_router.post("/boz-plus/request")
async def request_boz_plus(current_user: User = Depends(get_current_user)):
    """User requests BOZ PLUS membership"""
    
    # Check if already BOZ PLUS member
    if current_user.is_boz_plus:
        # Check if not expired
        if current_user.boz_plus_expiry_date:
            expiry = datetime.fromisoformat(current_user.boz_plus_expiry_date)
            if expiry > datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="You already have an active BOZ PLUS membership")
    
    # Check if already requested
    if current_user.boz_plus_requested:
        raise HTTPException(status_code=400, detail="You have already requested BOZ PLUS membership")
    
    # Mark as requested
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"boz_plus_requested": True}}
    )
    
    return {"message": "BOZ PLUS membership request submitted. Admin will review shortly."}

@api_router.get("/boz-plus/status")
async def get_boz_plus_status(current_user: User = Depends(get_current_user)):
    """Get current user's BOZ PLUS status"""
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    is_active = False
    days_remaining = 0
    
    if user.get("is_boz_plus") and user.get("boz_plus_expiry_date"):
        expiry = datetime.fromisoformat(user["boz_plus_expiry_date"])
        now = datetime.now(timezone.utc)
        
        if expiry > now:
            is_active = True
            days_remaining = (expiry - now).days
        else:
            # Expired, deactivate
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": {"is_boz_plus": False, "boz_plus_expiry_date": None}}
            )
    
    return {
        "is_boz_plus": is_active,
        "boz_plus_expiry_date": user.get("boz_plus_expiry_date"),
        "days_remaining": days_remaining,
        "boz_plus_requested": user.get("boz_plus_requested", False)
    }

# ============ ADMIN BOZ PLUS ROUTES ============

@api_router.get("/admin/boz-plus/requests")
async def admin_get_boz_plus_requests(current_admin: Admin = Depends(get_current_admin)):
    """Get all BOZ PLUS membership requests"""
    users = await db.users.find(
        {
            "boz_plus_requested": True,
            "$or": [
                {"is_boz_plus": False},
                {"is_boz_plus": {"$exists": False}}
            ]
        },
        {"_id": 0, "hashed_password": 0}
    ).to_list(1000)
    
    return users

@api_router.post("/admin/boz-plus/approve/{user_id}")
async def admin_approve_boz_plus(
    user_id: str,
    current_admin: Admin = Depends(get_current_admin)
):
    """Approve BOZ PLUS membership for a user"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Set expiry date to 30 days from now
    expiry_date = datetime.now(timezone.utc) + timedelta(days=30)
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "is_boz_plus": True,
                "boz_plus_expiry_date": expiry_date.isoformat(),
                "boz_plus_requested": False
            }
        }
    )
    
    return {"message": "BOZ PLUS membership approved", "expiry_date": expiry_date.isoformat()}

@api_router.post("/admin/boz-plus/reject/{user_id}")
async def admin_reject_boz_plus(
    user_id: str,
    current_admin: Admin = Depends(get_current_admin)
):
    """Reject BOZ PLUS membership request"""
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"boz_plus_requested": False}}
    )
    
    return {"message": "BOZ PLUS membership request rejected"}

@api_router.get("/admin/boz-plus/members")
async def admin_get_boz_plus_members(current_admin: Admin = Depends(get_current_admin)):
    """Get all active BOZ PLUS members"""
    users = await db.users.find(
        {"is_boz_plus": True},
        {"_id": 0, "hashed_password": 0}
    ).to_list(1000)
    
    # Check and update expired memberships
    now = datetime.now(timezone.utc)
    active_members = []
    
    for user in users:
        if user.get("boz_plus_expiry_date"):
            expiry = datetime.fromisoformat(user["boz_plus_expiry_date"])
            if expiry > now:
                user["days_remaining"] = (expiry - now).days
                active_members.append(user)
            else:
                # Auto-expire
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"is_boz_plus": False, "boz_plus_expiry_date": None}}
                )
    
    return active_members

@api_router.post("/admin/boz-plus/extend/{user_id}")
async def admin_extend_boz_plus(
    user_id: str,
    days: int = 30,
    current_admin: Admin = Depends(get_current_admin)
):
    """Extend BOZ PLUS membership"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate new expiry date
    if user.get("boz_plus_expiry_date"):
        current_expiry = datetime.fromisoformat(user["boz_plus_expiry_date"])
        # If already expired, start from now
        if current_expiry < datetime.now(timezone.utc):
            new_expiry = datetime.now(timezone.utc) + timedelta(days=days)
        else:
            new_expiry = current_expiry + timedelta(days=days)
    else:
        new_expiry = datetime.now(timezone.utc) + timedelta(days=days)
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "is_boz_plus": True,
                "boz_plus_expiry_date": new_expiry.isoformat()
            }
        }
    )
    
    return {"message": f"BOZ PLUS membership extended by {days} days", "new_expiry_date": new_expiry.isoformat()}

@api_router.delete("/admin/boz-plus/revoke/{user_id}")
async def admin_revoke_boz_plus(
    user_id: str,
    current_admin: Admin = Depends(get_current_admin)
):
    """Revoke BOZ PLUS membership"""
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "is_boz_plus": False,
                "boz_plus_expiry_date": None,
                "boz_plus_requested": False
            }
        }
    )
    
    return {"message": "BOZ PLUS membership revoked"}

# ============ ADMIN ENHANCED ANALYTICS ROUTES ============

@api_router.get("/admin/cart-analytics")
async def admin_get_cart_analytics(current_admin: Admin = Depends(get_current_admin)):
    """Get cart analytics - which products are in how many carts"""
    
    # Get all users with their carts
    users = await db.users.find({}, {"_id": 0, "id": 1, "email": 1, "full_name": 1, "cart": 1}).to_list(10000)
    
    # Count products in carts
    product_cart_counts = {}
    user_cart_details = []
    
    for user in users:
        cart = user.get("cart", [])
        if cart and len(cart) > 0:
            user_cart_details.append({
                "user_id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "cart_items": len(cart),
                "cart": cart
            })
            
            for item in cart:
                product_id = item.get("product_id")
                if product_id:
                    if product_id not in product_cart_counts:
                        product_cart_counts[product_id] = {
                            "count": 0,
                            "users": []
                        }
                    product_cart_counts[product_id]["count"] += 1
                    product_cart_counts[product_id]["users"].append({
                        "email": user["email"],
                        "quantity": item.get("quantity", 1)
                    })
    
    # Enrich with product details
    enriched_products = []
    for product_id, data in product_cart_counts.items():
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if product:
            enriched_products.append({
                "product_id": product_id,
                "product_name": product.get("product_name"),
                "price": product.get("price"),
                "image_url": product.get("image_urls", [None])[0],
                "cart_count": data["count"],
                "users": data["users"]
            })
    
    # Sort by cart count
    enriched_products.sort(key=lambda x: x["cart_count"], reverse=True)
    
    return {
        "total_users_with_cart": len(user_cart_details),
        "total_products_in_carts": len(product_cart_counts),
        "products": enriched_products[:20],  # Top 20
        "user_carts": user_cart_details
    }

@api_router.get("/admin/users/detailed")
async def admin_get_users_detailed(current_admin: Admin = Depends(get_current_admin)):
    """Get detailed user information including password hash, phone, cart, orders"""
    
    users = await db.users.find({}, {"_id": 0}).to_list(10000)
    
    enriched_users = []
    for user in users:
        # Get order count and total spent
        orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0, "total": 1, "created_at": 1, "status": 1}).to_list(1000)
        order_count = len(orders)
        total_spent = sum(order.get("total", 0) for order in orders)
        
        # Get cart info
        cart = user.get("cart", [])
        cart_items_count = len(cart)
        
        # Enrich cart with product details
        enriched_cart = []
        for item in cart:
            product = await db.products.find_one({"id": item.get("product_id")}, {"_id": 0, "product_name": 1, "price": 1, "image_urls": 1})
            if product:
                enriched_cart.append({
                    "product_id": item.get("product_id"),
                    "product_name": product.get("product_name"),
                    "price": product.get("price"),
                    "quantity": item.get("quantity", 1),
                    "image_url": product.get("image_urls", [None])[0]
                })
        
        enriched_users.append({
            **user,
            "order_count": order_count,
            "total_spent": round(total_spent, 2),
            "cart_items_count": cart_items_count,
            "cart_details": enriched_cart,
            "last_order_date": orders[0].get("created_at") if orders else None
        })
    
    # Sort by total spent
    enriched_users.sort(key=lambda x: x["total_spent"], reverse=True)
    
    return enriched_users

@api_router.get("/admin/dashboard/stats")
async def admin_get_dashboard_stats(current_admin: Admin = Depends(get_current_admin)):
    """Get comprehensive dashboard statistics"""
    
    # Basic counts
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_categories = await db.categories.count_documents({})
    
    # Sales statistics
    orders = await db.orders.find({}, {"_id": 0, "total": 1, "created_at": 1}).to_list(10000)
    total_sales = sum(order.get("total", 0) for order in orders)
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    
    # Recent sales (last 7 days)
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent_orders = [o for o in orders if o.get("created_at", "") > seven_days_ago]
    recent_sales = sum(order.get("total", 0) for order in recent_orders)
    
    # User statistics
    boz_plus_users = await db.users.count_documents({"is_boz_plus": True})
    users_with_orders = await db.orders.distinct("user_id")
    conversion_rate = (len(users_with_orders) / total_users * 100) if total_users > 0 else 0
    
    # Product statistics
    out_of_stock = await db.products.count_documents({"stock_amount": 0})
    low_stock = await db.products.count_documents({"stock_amount": {"$lte": 5, "$gt": 0}})
    
    # Cart statistics
    users_with_cart = await db.users.find({"cart": {"$exists": True, "$ne": []}}, {"_id": 0, "cart": 1}).to_list(10000)
    total_items_in_carts = sum(len(user.get("cart", [])) for user in users_with_cart)
    
    # Top selling products
    all_orders = await db.orders.find({}, {"_id": 0, "items": 1}).to_list(10000)
    product_sales = {}
    for order in all_orders:
        for item in order.get("items", []):
            pid = item.get("product_id")
            if pid:
                product_sales[pid] = product_sales.get(pid, 0) + item.get("quantity", 1)
    
    # Get top 5 products
    top_products = []
    for pid, qty in sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]:
        product = await db.products.find_one({"id": pid}, {"_id": 0, "product_name": 1, "price": 1, "image_urls": 1})
        if product:
            top_products.append({
                "product_id": pid,
                "product_name": product.get("product_name"),
                "image_url": product.get("image_urls", [None])[0],
                "total_sold": qty,
                "revenue": qty * product.get("price", 0)
            })
    
    return {
        "overview": {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_categories": total_categories,
            "total_sales": round(total_sales, 2),
            "avg_order_value": round(avg_order_value, 2)
        },
        "recent_activity": {
            "sales_last_7_days": round(recent_sales, 2),
            "orders_last_7_days": len(recent_orders)
        },
        "users": {
            "boz_plus_members": boz_plus_users,
            "conversion_rate": round(conversion_rate, 2),
            "users_with_orders": len(users_with_orders)
        },
        "inventory": {
            "out_of_stock": out_of_stock,
            "low_stock": low_stock,
            "in_stock": total_products - out_of_stock - low_stock
        },
        "cart_analytics": {
            "users_with_items": len(users_with_cart),
            "total_items_in_carts": total_items_in_carts,
            "avg_cart_size": round(total_items_in_carts / len(users_with_cart), 2) if users_with_cart else 0
        },
        "top_products": top_products
    }

# ============ PREORDER PRODUCTS ROUTES ============

@api_router.get("/preorder-products")
async def get_preorder_products():
    """Get active preorder products for public view"""
    preorders = await db.preorder_products.find(
        {"is_active": True}, 
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    return preorders

@api_router.get("/admin/preorder-products")
async def admin_get_preorder_products(current_admin: Admin = Depends(get_current_admin)):
    """Get all preorder products for admin"""
    preorders = await db.preorder_products.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return preorders

@api_router.post("/admin/preorder-products")
async def admin_create_preorder(
    preorder: PreorderProductCreate,
    current_admin: Admin = Depends(get_current_admin)
):
    """Create new preorder product"""
    # Get current max order
    existing = await db.preorder_products.find({}, {"_id": 0, "order": 1}).to_list(1000)
    max_order = max([p.get("order", 0) for p in existing], default=-1)
    
    # Create PreorderProduct model instance
    preorder_product = PreorderProduct(
        **preorder.model_dump(),
        order=max_order + 1
    )
    
    await db.preorder_products.insert_one(preorder_product.model_dump())
    return preorder_product

@api_router.put("/admin/preorder-products/{preorder_id}")
async def admin_update_preorder(
    preorder_id: str,
    preorder_update: PreorderProductUpdate,
    current_admin: Admin = Depends(get_current_admin)
):
    """Update preorder product"""
    update_data = {k: v for k, v in preorder_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.preorder_products.update_one(
        {"id": preorder_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Preorder product not found")
    
    updated = await db.preorder_products.find_one({"id": preorder_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/preorder-products/{preorder_id}")
async def admin_delete_preorder(
    preorder_id: str,
    current_admin: Admin = Depends(get_current_admin)
):
    """Delete preorder product"""
    result = await db.preorder_products.delete_one({"id": preorder_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preorder product not found")
    
    return {"message": "Preorder product deleted"}

@api_router.post("/admin/preorder-products/reorder")
async def admin_reorder_preorders(
    data: dict,
    current_admin: Admin = Depends(get_current_admin)
):
    """Reorder preorder products"""
    preorders = data.get("preorders", [])
    
    for preorder_data in preorders:
        await db.preorder_products.update_one(
            {"id": preorder_data["id"]},
            {"$set": {"order": preorder_data["order"]}}
        )
    
    return {"message": "Preorder products reordered"}

# ============ INIT ROUTE ============

@api_router.get("/")
async def root():
    return {"message": "Boz Concept Home API"}

# Include router
app.include_router(api_router)

# Create uploads directory
uploads_dir = Path("/app/backend/uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()