# Project Guide - Tshop Backend

Tai lieu nay mo ta backend `Tshop` theo trang thai code hien tai, de team co the doc nhanh ma khong phai lan tung package.

## 1. Tong quan

- Spring Boot 4.0.1, Java 17
- PostgreSQL + Spring Data JPA
- Spring Security + JWT
- MinIO cho luu anh product
- VNPay cho thanh toan
- GHN cho shipping fee va master data dia chi

Backend hien tai da co cac module:

- Auth
- Profile
- Categories
- Products
- Cart
- Orders
- Shipping
- Payment callback

## 2. Cau truc code

```text
Tshop/
|-- src/main/java/com/project/tshop/
|   |-- config/
|   |-- controller/
|   |-- dto/
|   |-- entity/
|   |-- exception/
|   |-- repository/
|   |-- security/
|   `-- service/
|-- src/main/resources/application.properties
|-- docker-compose.yml
|-- .env.example
`-- PROJECT_GUIDE.md
```

## 3. Kien truc

### Layered architecture
- `controller`: nhan request, validate DTO, tra `ApiResponse`
- `service`: xu ly nghiep vu
- `repository`: truy van JPA
- `entity`: model va quan he
- `security`: JWT filter, entry point, access denied handler
- `config`: security, MinIO, seed data, VNPay config

### Response format

API thong nhat theo wrapper:

```json
{
  "success": true,
  "message": "text",
  "data": {},
  "timestamp": "..."
}
```

## 4. API hien tai

Base path: `/api`

### Authentication
Controller: `AuthenticationController`

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Auth response tra ve:
- `access_token`
- `refresh_token`
- `token_type`
- `email`
- `full_name`
- `phone`
- `role`

### Profile
Controller: `ProfileController`

- `GET /api/profile`
- `PUT /api/profile`

Field hien tai:
- `firstName`, `lastName`, `email`, `phone`
- `address`, `city`, `state`
- `memberSince`, `totalOrders`, `totalSpent`

### Categories
Controller: `CategoryController`

- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`
- `GET /api/categories/{id}`
- `GET /api/categories?search=&page=0&size=10`

Ghi chu:
- Category routes khong public; can authenticated
- Paging mac dinh `page=0`, `size=10`

### Products
Controller: `ProductController`

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products` with `multipart/form-data`

Ghi chu:
- `GET /api/products/**` dang public
- `POST /api/products` duoc bao ve bang `@PreAuthorize("hasRole('ADMIN')")`
- Create product nhan:
  - `payload` JSON
  - `thumbnail`
  - optional `images`

### Cart
Controller: `CartController`

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/{itemId}`
- `DELETE /api/cart/items/{itemId}`
- `DELETE /api/cart`

Cart API can authenticated.

### Orders
Controller: `OrderController`

- `POST /api/orders/checkout`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `PUT /api/orders/{id}/cancel`

Ghi chu:
- `checkout` co the tra `paymentUrl` neu order di qua VNPay
- `GET /api/orders` tra `Page<OrderResponse>`
- Order VNPay unpaid se tu dong chuyen `status=cancelled`, `paymentStatus=failed` sau khi qua han cua so thanh toan khi user mo order history/detail

### Shipping
Controller: `ShippingController`

- `POST /api/shipping/fee`
- `GET /api/shipping/provinces`
- `GET /api/shipping/districts?provinceId=...`
- `GET /api/shipping/wards?districtId=...`

Shipping routes dang public de FE checkout goi truc tiep.

### Payment
Controller: `PaymentController`

- `GET /api/payment/vnpay-return`
- `GET /api/payment/vnpay-ipn`

Hai endpoint nay dang public.

Ghi chu:
- `vnpay-return` verify callback tai backend roi redirect `302` ve `VNPAY_FRONTEND_RETURN_URL`
- FE nhan `status`, `paymentStatus`, `orderId`, `message` va mot so `vnp_*` query params de hien thi ket qua

## 5. Security

File chinh: `config/SecurityConfig.java`

### Public routes
- `/api/auth/**`
- `/api/payment/vnpay-return`
- `/api/payment/vnpay-ipn`
- `/api/shipping/**`
- `/api/products/**`
- `/error`
- `OPTIONS /**`

### Protected routes
- Tat ca route con lai can authenticated

### JWT behavior
- `JwtAuthenticationFilter` doc Bearer token va set `SecurityContext`
- `RestAuthenticationEntryPoint` tra `401` theo `ApiResponse`
- `RestAccessDeniedHandler` tra `403` theo `ApiResponse`
- Access token mac dinh: `900000ms` (15 phut)
- Refresh token mac dinh: `604800000ms` (7 ngay)

## 6. Data model nhanh

### User
- email, passwordHash, role, fullName, phone, address, city, state
- 1-1 cart
- 1-n orders

### Category
- name, slug, parent

### Product
- category, name, slug, price, stockQuantity, description, thumbnail, status

### ProductImage
- objectKey, altText, sortOrder

### Cart / CartItem
- cart cua user
- item gan voi product va quantity

### Order / OrderItem
- order cua user
- order item gan product, unit price, quantity

### RevokedRefreshToken
- luu hash refresh token da revoke

## 7. Seed data

File: `config/DataInitializer.java`

App se seed du lieu mac dinh theo cach idempotent.

### Seed users
- `admin@tshop.local` / `Admin@123`
- `customer1@tshop.local` / `Customer@123`
- `customer2@tshop.local` / `Customer@123`

### Seed categories
- `cpu`
- `gpu`
- `motherboard`
- `ram`
- `storage`
- `psu`
- `case`
- `cooler`

### Seed products
- Mot nhom product mau tu `PRODUCT_SEEDS`
- Moi product seed co thumbnail va product image

## 8. Cau hinh

Backend doc env tu `.env` nho:

```properties
spring.config.import=optional:file:./.env[.properties]
```

### Bien moi truong chinh

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `MINIO_ENDPOINT`
- `MINIO_BUCKET`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `MINIO_PUBLIC_BASE_URL`
- `VNPAY_TMN_CODE`
- `VNPAY_HASH_SECRET`
- `VNPAY_RETURN_URL`
- `VNPAY_FRONTEND_RETURN_URL`
- `VNPAY_EXCHANGE_RATE`
- `VNPAY_EXPIRE_MINUTES`
- `GHN_TOKEN`
- `GHN_SHOP_ID`
- `GHN_API_URL`
- `GHN_FROM_DISTRICT_ID`

### Multipart limits
- `spring.servlet.multipart.max-file-size=10MB`
- `spring.servlet.multipart.max-request-size=50MB`

### JWT secret note

`JwtService` ho tro:
- Base64 secret hop le
- Plain text secret, neu ngan se duoc bam SHA-256 de dat do dai toi thieu cho HS256

PowerShell generate secret:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## 9. Local setup

### 1. Tao `.env`
Copy `.env.example` thanh `.env` va dien cac gia tri can thiet.

### 2. Start Postgres + MinIO

```bash
docker compose up -d
```

Mac dinh:
- Postgres: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

Bucket `tshop` duoc tao tu dong boi service `minio-init`.

### 3. Chay backend

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Test:

```powershell
.\mvnw.cmd test
```

Unix:

```bash
./mvnw spring-boot:run
```

## 10. Diem can biet khi mo rong

- Product hien co `list`, `detail`, `create`; chua thay `update/delete`
- Payment flow hien xoay quanh VNPay callback/IPN
- Shipping hien dang goi GHN service
- Security route-level chu yeu dua tren `SecurityConfig` + `@PreAuthorize`
- `HELP.md` chi giu vai tro quick start; tai lieu chinh la file nay

## 11. Recent Notes

### VNPay flow update - 2026-05-13

- Backend khong con tra JSON truc tiep cho browser tai `GET /api/payment/vnpay-return`; endpoint nay verify callback va redirect ve FE
- Them `vnpay.expire-minutes` / `VNPAY_EXPIRE_MINUTES` de dong bo han thanh toan VNPay va logic order timeout
- Order VNPay unpaid qua han se duoc auto-expire thanh `cancelled` + `paymentStatus=failed` khi user tai order list/detail, dong thoi restore stock
- Callback/IPN se bo qua order da o trang thai final de tranh xu ly lap va sai stock
- Manual cancel voi order `paymentMethod=vnpay` nhung chua paid se set `paymentStatus=failed`
