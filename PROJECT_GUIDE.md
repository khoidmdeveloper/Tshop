# Project Guide - Tshop Backend

Tai lieu nay mo ta backend `Tshop` theo trang thai code hien tai, de team co the doc nhanh ma khong phai lan tung package.

## 1. Tong quan

- Spring Boot 4.0.1, Java 17
- PostgreSQL + Spring Data JPA
- Spring Security + JWT
- MinIO cho luu anh product
- VNPay cho thanh toan
- GHN cho shipping fee va master data dia chi

Hệ thống đã được chuyển đổi sang Microservices Architecture, bao gồm:
- **api-gateway** (Port 8080): Định tuyến request, xử lý CORS.
- **eureka-server** (Port 8761): Service Registry.
- **auth-service** (Port 8082): Quản lý Authentication và Profile (Database: `tshop_auth`).
- **catalog-service** (Port 8083): Quản lý Categories, Products và MinIO Storage (Database: `tshop_catalog`).
- **order-service** (Port 8084): Quản lý Cart, Orders, Payment (VNPay) và Shipping (GHN) (Database: `tshop_order`).
- **monolith-service** (Port 8081): Chứa logic cũ chưa chuyển đổi hết (nếu còn).

## 2. Cau truc code

```text
Tshop/ (Root POM)
|-- api-gateway/ (Spring Cloud Gateway)
|-- eureka-server/ (Service Registry)
|-- auth-service/ (Auth & Profile)
|-- catalog-service/ (Products & Categories)
|-- order-service/ (Cart, Orders, Payment, Shipping)
|-- monolith-service/ (Legacy Backend)
|   |-- src/main/java/com/project/tshop/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- entity/
|   |   |-- exception/
|   |   |-- repository/
|   |   |-- security/
|   |   `-- service/
|   `-- src/main/resources/application.properties
|-- docker-compose.yml
|-- postgres-init.sql
|-- .env.example
|-- AI_DECISIONS.md
`-- PROJECT_GUIDE.md
```

## 3. Kien truc

### Microservices Architecture (Mới)
- Mọi request từ client sẽ đi qua **API Gateway** (`http://localhost:8080`).
- Các service tự động đăng ký với **Eureka Server** (`http://localhost:8761`).
- Gateway dùng tên service trên Eureka (ví dụ `lb://AUTH-SERVICE`) để forward request.
- Các logical database đã được tách ra (`tshop_auth`, `tshop_catalog`, `tshop_order`, `tshop`).
- Các service gọi chéo nhau thông qua REST API (VD: `order-service` gọi `catalog-service` qua `CatalogClient` để lấy thông tin sản phẩm và giá).

### Layered architecture (Bên trong monolith-service)
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
- `address`
- `provinceId`, `provinceName`
- `districtId`, `districtName`
- `wardCode`, `wardName`
- `memberSince`, `totalOrders`, `totalSpent`

Ghi chu:
- Saved shipping address trong profile duoc dung lam nguon mac dinh cho checkout FE
- `city` / `state` van duoc giu nhu alias de tuong thich, nhung FE hien tai dung bo field shipping moi o tren

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

Ghi chu:
- Backend fee flow gui `ShopId` header va de GHN tu resolve pickup address cua shop; FE chi gui dia chi nhan va package summary
- Fee request contract chi nhan dia chi nhan va package summary: `toDistrictId`, `toWardCode`, `weight`, `insuranceValue`
- Khong con fallback ve `0` neu GHN fee API loi; checkout se tra loi de tranh tao don free shipping sai
- GHN shop phai co thong tin dia chi hop le trong trang quan ly shop; neu shop chua co pickup address hop le thi GHN fee/create API se tra loi

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
- email, passwordHash, role, fullName, phone
- profile shipping: address, provinceId/provinceName, districtId/districtName, wardCode/wardName
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
- `AUTH_DB` (default: `tshop_auth`)
- `CATALOG_DB` (default: `tshop_catalog`)
- `ORDER_DB` (default: `tshop_order`)
- `JWT_SECRET`
- `INTERNAL_SECRET` (shared key for inter-service auth via `X-Internal-Secret` header)
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
- `GHN_URL`
- `GHN_TOKEN`
- `GHN_SHOP_ID`

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

### 3. Khởi chạy hệ thống Microservices

Bạn cần mở nhiều terminal để chạy lần lượt các service.

Windows:

```powershell
# 1. Chạy Eureka Server
cd eureka-server
..\mvnw.cmd spring-boot:run

# 2. Chạy API Gateway (Mở tab mới)
cd api-gateway
..\mvnw.cmd spring-boot:run

# 3. Chạy Auth Service (Mở tab mới)
cd auth-service
..\mvnw.cmd spring-boot:run

# 4. Chạy Catalog Service (Mở tab mới)
cd catalog-service
..\mvnw.cmd spring-boot:run

# 5. Chạy Order Service (Mở tab mới)
cd order-service
..\mvnw.cmd spring-boot:run
```

Lưu ý: FE gọi API vào Gateway ở cổng `8080`. Các microservices chạy ngầm ở các cổng `8082`, `8083`, `8084` v.v.

## 10. Diem can biet khi mo rong

- Product hien co `list`, `detail`, `create`; chua thay `update/delete`
- Payment flow hien xoay quanh VNPay callback/IPN
- Shipping hien dang goi GHN service
- Security route-level chu yeu dua tren `SecurityConfig` + `@PreAuthorize`
- `HELP.md` chi giu vai tro quick start; tai lieu chinh la file nay

## 11. Recent Notes

### Hoàn tất tách Microservices - 2026-05-26

- Đã bóc tách thành công toàn bộ logic của Monolith ra 3 service độc lập: `auth-service`, `catalog-service`, `order-service`.
- Cập nhật API Gateway để định tuyến đúng các path:
  - `/api/auth/**`, `/api/profile/**` -> `auth-service`
  - `/api/products/**`, `/api/categories/**` -> `catalog-service`
  - `/api/orders/**`, `/api/cart/**`, `/api/payment/**`, `/api/shipping/**` -> `order-service`
- Chuyển đổi giao tiếp database nguyên khối (JPA `@ManyToOne`) sang giao tiếp qua HTTP API bằng cách dùng `RestClient` (VD: `CatalogClient` trong `order-service`).
- Áp dụng kiểm tra bảo mật (JWT verify) phân tán tại từng microservice thông qua config chung thay vì tập trung tại một nơi.

### Khởi tạo kiến trúc Microservices - 2026-05-23

- Chuyển `Tshop` thành Multi-module project.
- Di chuyển source nguyên khối vào `monolith-service`.
- Thêm `api-gateway` và cấu hình `eureka-server`.
- Cập nhật `docker-compose.yml` để mount `postgres-init.sql` tạo nhiều database ảo chuẩn bị cho việc bóc tách (`tshop_auth`, `tshop_catalog`, `tshop_order`).

### VNPay flow update - 2026-05-13

- Backend khong con tra JSON truc tiep cho browser tai `GET /api/payment/vnpay-return`; endpoint nay verify callback va redirect ve FE
- Them `vnpay.expire-minutes` / `VNPAY_EXPIRE_MINUTES` de dong bo han thanh toan VNPay va logic order timeout
- Order VNPay unpaid qua han se duoc auto-expire thanh `cancelled` + `paymentStatus=failed` khi user tai order list/detail, dong thoi restore stock
- Callback/IPN se bo qua order da o trang thai final de tranh xu ly lap va sai stock
- Manual cancel voi order `paymentMethod=vnpay` nhung chua paid se set `paymentStatus=failed`

### Profile + shipping update - 2026-05-13

- Profile API mo rong them shipping location co cau truc: `provinceId`, `provinceName`, `districtId`, `districtName`, `wardCode`, `wardName`
- FE account page bo `Account Preference`, thay bang saved shipping address editor dung GHN province/district/ward selectors
- Checkout uu tien dung saved profile shipping address; user van co the chon ship den mot dia chi khac cho tung order

### Shipping fee + cart summary update - 2026-05-13

- Checkout FE khong con hien `Free Shipping` khi chua tinh duoc phi ship; summary doi sang trang thai `Calculated at checkout` / `Calculating...` / `Unavailable`
- Cart summary bo promo code mock `SAVE10` va bo shipping estimate hardcoded; shipping chi duoc tinh tai checkout
- FE quote hien tai doi GHN fee VND sang currency noi bo bang `VITE_VND_EXCHANGE_RATE` (mac dinh `25000`) thay vi lam tron thanh so nguyen

### GHN config rollback - 2026-05-15

- Bo `GHN_API_URL`, `GHN_FROM_DISTRICT_ID`, `GHN_FROM_WARD_CODE` khoi env contract
- Backend chi con doc `GHN_URL`, `GHN_TOKEN`, `GHN_SHOP_ID`
- Pickup address cua shop duoc GHN resolve tu `ShopId` header khi tinh phi va tao don; backend khong can fix cung bang env nua

### Shipping payload alignment - 2026-05-15

- FE checkout khong gui `items` vao `/api/shipping/fee` nua vi backend DTO khong doc field nay
- FE gui `weight` bang tong so luong item * 500g va `insuranceValue` bang cart total quy doi sang VND
- Backend checkout tinh lai cung package summary truoc khi tao order de phi hien thi tren FE va phi luu trong order khong bi lech
- GHN create order cung dung tong can nang theo so luong item thay vi mac dinh 500g cho ca don
- Backend khong chan checkout dua tren `shop/all` nua vi GHN fee/create API co the tu lay pickup address tu `ShopId` header.

### Đồng bộ Microservices - 2026-05-29

- **Profile stats**: `auth-service` bây giờ lấy `totalOrders` / `totalSpent` từ `order-service` qua internal API `GET /api/internal/orders/stats?userEmail=...` thay vì hardcode `0`. Fallback `0` nếu order-service unreachable.
- **Catalog seed data**: Đã port seed categories/products/productImages từ `monolith-service/DataInitializer` sang `catalog-service/DataInitializer`. User seeding vẫn ở `auth-service`.
- **Cancel order**: Endpoint `PUT /api/orders/{orderId}/cancel` là primary (match mono). `POST` giữ lại cho backward compatibility.
- **Env**: `.env.example` đã bổ sung `AUTH_DB`, `CATALOG_DB`, `ORDER_DB`, `INTERNAL_SECRET`.
- **Review API**: Chưa implement. Mono chỉ có entity, chưa có controller/service/API. Sẽ thêm sau nếu cần.
