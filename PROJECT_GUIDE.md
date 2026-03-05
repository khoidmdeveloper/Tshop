# Project Guide - Tshop

Muc tieu: tai lieu nay giup thanh vien moi (hoac sau nay doc lai) hieu nhanh kien truc, chuc nang, va cach chay project ma khong can doc toan bo code.

## 1) Tong quan nhanh
- Tshop la backend Spring Boot (Java 17) cho mo hinh thuong mai dien tu co ban.
- Su dung PostgreSQL, Spring Data JPA, Spring Security (JWT), Validation, Lombok.
- Hien tai co API auth, profile (get/update), CRUD cho Category, va Product API (list/detail/create co upload anh).
- Cac domain Cart/Order/Review chua co controller/service day du.

## 2) Tech stack va phu thuoc chinh
- Spring Boot 4.0.1
- Spring WebMVC, Spring Security, Spring Validation
- Spring Data JPA + PostgreSQL
- JWT (io.jsonwebtoken)
- Lombok (Builder, v.v.)

## 3) Kien truc va design patterns
### Layered Architecture
- `controller/`: nhan request, validate DTO, tra ve `ApiResponse`.
- `service/`: xu ly nghiep vu, phat sinh token, validate, thao tac repository.
- `repository/`: Spring Data JPA, truy van DB.
- `entity/`: JPA entities, quan he giua bang.
- `security/`: JWT service + filter, SecurityConfig.

### Repository Pattern (Spring Data JPA)
`UserRepository`, `CategoryRepository`, `ProductRepository`, `ProductImageRepository`, `OrderRepository` ke thua `JpaRepository`, dong vai tro truy van DB.

### DTO Pattern
`dto/auth/*`, `dto/profile/*`, `dto/category/*`, `dto/product/*` gom request/response theo tung use-case, validate bang annotation (`@NotBlank`, `@Email`, `@Size`).

### Builder Pattern (Lombok)
`User`, `AuthResponse`, `RegisterRequest`, v.v. su dung `@Builder` de khoi tao object ro rang.

### Security Filter Chain
`JwtAuthenticationFilter` (OncePerRequestFilter) doc header `Authorization: Bearer ...`, xac thuc token va dat `SecurityContext`.

Token validation behavior (cap nhat):
- Neu access token het han/khong hop le, filter khong throw ra `500` nua; request duoc mark loi auth de Spring Security xu ly.
- `RestAuthenticationEntryPoint` tra `401` theo format `ApiResponse` (vi du: "Access token expired.", "Invalid access token.").
- `RestAccessDeniedHandler` tra `403` theo format `ApiResponse` khi user da xac thuc nhung khong du quyen.

### Domain Validation (Entity hooks)
`ValueValidation.requireOneOf(...)` duoc goi trong `@PrePersist`/`@PreUpdate` cua `User`, `Product`, `Order` de rang buoc gia tri status/role.

## 4) Chuc nang (function) hien tai
### Authentication
File: `controller/AuthenticationController.java`
- `POST /api/auth/register` -> tao user, tra ve access + refresh token.
- `POST /api/auth/login` -> xac thuc, tra ve token.
- `POST /api/auth/refresh` -> tao access token moi tu refresh token.
- `POST /api/auth/logout` -> revoke refresh token hien tai.

Flow:
1. Controller nhan DTO va validate.
2. `AuthenticationService`:
   - `register`: check email, ma hoa password (BCrypt), luu user, tao token.
   - `login`: authenticate qua `AuthenticationManager`, tao token.
   - `refreshToken`: validate refresh token (bao gom check revoke), tao access token moi.
   - `logout`: hash refresh token va luu vao bang revoke.
3. `JwtService` tao/kiem tra token voi HS256.

AuthResponse tra ve:
- `access_token`, `refresh_token`, `token_type`
- `email`, `full_name`, `phone`, `role`

Token lifetime mac dinh (xem `application.properties`):
- `jwt.access-token-expiration=60000` (1 phut)
- `jwt.refresh-token-expiration=604800000` (7 ngay)

Custom exceptions trong auth:
- `EmailAlreadyExistsException` (409)
- `UserNotFoundException` (404)
- `InvalidRefreshTokenException` (401)
- `RefreshTokenRevokedException` (401)

### Response wrapper
`ApiResponse<T>` dong goi response theo format: `success`, `message`, `data`, `timestamp`.

### Profile API (Current user)
Files: `controller/ProfileController.java`, `service/ProfileService.java`
- `GET /api/profile` -> lay profile cua user dang dang nhap.
- `PUT /api/profile` -> cap nhat profile cua user dang dang nhap.

Response profile hien tai gom:
- `firstName`, `lastName`, `email`, `phone`
- `address`, `city`, `state`
- `memberSince`, `totalOrders`, `totalSpent`

Behavior update profile:
- Partial update: field nao gui len thi moi xu ly field do.
- Validate email format + unique email neu thay doi email.
- Chuan hoa du lieu text (`trim`, bo khoang trang du).
- Toi uu no-op: neu khong co thay doi thuc te thi khong `save` vao DB.
- Khong su dung truong `zip` trong profile.

### Category CRUD
File: `controller/CategoryController.java`
- `POST /api/categories` -> tao category
- `PUT /api/categories/{id}` -> cap nhat category
- `DELETE /api/categories/{id}` -> xoa category
- `GET /api/categories/{id}` -> xem chi tiet category
- `GET /api/categories?search=&page=0&size=10` -> danh sach + tim kiem

**Paging mac dinh**: `page=0`, `size=10` va size duoc gioi han toi da 10.

**Behavior cap nhat (update)**:
- Field nao khong gui (null) thi giu nguyen gia tri cu.
- `name`: chi update khi khong null va khong blank.
- `slug`:
  - Neu gui slug rong/blank -> set `null`.
  - Neu `name` thay doi -> slug tu dong sinh lai tu `name`.
  - Neu `name` khong doi -> slug duoc resolve tu slug request (neu co) hoac tu `name` (neu khong co).
- `parentId`: neu khong gui -> giu nguyen. Parent khong duoc la chinh no va phai ton tai.

### Product API
Files: `controller/ProductController.java`, `service/ProductService.java`
- `GET /api/products?search=&category=&page=0&size=24` -> danh sach san pham co phan trang.
- `GET /api/products/{id}` -> chi tiet san pham.
- `POST /api/products` (`multipart/form-data`, role `ADMIN`) -> tao san pham moi voi anh.

List response item gom:
- `id`, `name`, `slug`, `price`, `stockQuantity`
- `thumbnail`
- `categoryName`, `categorySlug`

Detail response gom:
- Cac field list item + `description`, `status`, `categoryId`
- `images[]` (url, altText, sortOrder), sap xep theo `sortOrder` tang dan.
- Neu product chua co image trong `product_images`, service fallback 1 anh tu `thumbnail`.

Create request (`POST /api/products`) gom:
- `payload` (JSON): `categoryId`, `name`, `slug?`, `price`, `stockQuantity`, `description?`, `status?`
- `thumbnail` (file anh, bat buoc)
- `images` (danh sach file anh, tuy chon, toi da 10 file)

Behavior upload:
- BE chi chap nhan file anh hop le (MIME `image/*` va decode duoc bang `ImageIO`).
- Anh duoc upload len MinIO, sau do DB luu URL public day du cho `products.thumbnail` va `product_images.object_key`.
- Neu tao product loi sau khi upload mot phan, he thong xoa file da upload theo co che best-effort rollback.

### Data initialization
File: `config/DataInitializer.java`
- Khi app start, he thong seed du lieu mac dinh theo co che idempotent (chi tao ban ghi chua ton tai).
- Tai khoan:
  - admin: `admin@tshop.local` / `Admin@123` / role `admin`
  - customer 1: `customer1@tshop.local` / `Customer@123` / role `customer`
  - customer 2: `customer2@tshop.local` / `Customer@123` / role `customer`
- Category: seed 8 loai (`cpu`, `gpu`, `motherboard`, `ram`, `storage`, `psu`, `case`, `cooler`).
- Product: seed mau theo danh sach trong code (`PRODUCT_SEEDS`), status `active`.
- Product image: moi product seed 1 anh vao bang `product_images` (URL online), dong thoi `products.thumbnail` cung dung URL online.
- Co check unique key theo `email` (user) va `slug` (category/product) nen restart app khong tao du lieu trung.

## 5) Mo hinh du lieu (entities) va quan he
### User
- Truong: email, passwordHash, role (customer/admin), fullName, phone, address, city, state
- Quan he: 1-1 Cart, 1-n Order, 1-n Review
- Implement `UserDetails` de tich hop Spring Security

### Product
- Gia, ton kho, mo ta, specs (JSON), status (active/draft/archived)
- Quan he: n-1 Category, 1-n ProductImage, CartItem, OrderItem, Review

### Category
- Coi nhu cay danh muc (parent/children)
- Quan he: 1-n Product

### Cart / CartItem
- Cart gan voi User (1-1), CartItem chua Product + quantity

### Order / OrderItem
- Order gan voi User (n-1), gom OrderItem (1-n)
- Status: pending/confirmed/shipped/delivered/cancelled

### Review
- Review gan User + Product, co rating/comment

### ProductImage
- Cot `object_key` dang duoc dung de luu URL public anh (tuong thich du lieu URL online va MinIO URL).

### RevokedRefreshToken
- Luu hash cua refresh token da logout (`token_hash`) de chan refresh token do.
- Co `expires_at` de cleanup token revoke het han.

## 6) Cau hinh va bien moi truong
`application.properties`:
- Doc `.env` qua `spring.config.import=optional:file:./.env[.properties]`
- Cau hinh DB tu `POSTGRES_*`
- JWT tu `JWT_SECRET`, `jwt.access-token-expiration`, `jwt.refresh-token-expiration`
  - Mac dinh hien tai: access token `60000ms` (1 phut), refresh token `604800000ms` (7 ngay)
- Multipart upload: `spring.servlet.multipart.max-file-size=10MB`, `spring.servlet.multipart.max-request-size=50MB`
- MinIO: `MINIO_ENDPOINT`, `MINIO_BUCKET`, `MINIO_PUBLIC_BASE_URL`
- Tuy chon override credential MinIO: `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` (neu khong set thi fallback qua `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`)

### CORS (SecurityConfig)
- Backend bat CORS thong qua `CorsConfigurationSource` trong `SecurityConfig`.
- Dang dung `allowedOriginPatterns("*")` (cho frontend nao cung duoc), phu hop cho du an nho/dev.
- Methods cho phep: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Headers: `*`, expose header `Authorization`, `allowCredentials=true`.
- Co permit `OPTIONS /**` de preflight request di qua Spring Security.
- Security rule hien tai cho phep public `GET /api/products/**` de FE co the browse san pham truoc khi dang nhap.

**Luu y quan trong**: `JwtService` ho tro 2 kieu `JWT_SECRET`:
- Base64 hop le (uu tien su dung neu decode duoc va >= 32 bytes).
- Plain text (neu >= 32 bytes thi dung truc tiep, neu ngan hon se duoc bam SHA-256 de dat 32 bytes cho HS256).
- Neu secret rong, he thong throw `InvalidJwtSecretException`.

Goi y tao JWT secret (PowerShell):
```
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## 7) Cach chay project (local)
### 7.1 Tao file .env
Copy `.env.example` -> `.env` va cap nhat:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `POSTGRES_HOST`
- `JWT_SECRET` (base64)
- (MinIO) `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_PORT`, `MINIO_CONSOLE_PORT`, `MINIO_BUCKET`

### 7.2 Chay DB + MinIO bang Docker
```
docker compose up -d
```
Postgres: `localhost:5432` (mac dinh)
MinIO S3: `http://localhost:9000`
MinIO Console: `http://localhost:9001`

Bucket mac dinh: `tshop`

### 7.3 Chay ung dung
Tren Windows:
```
.\mvnw.cmd spring-boot:run
```
Hoac:
```
.\mvnw.cmd test
```

Neu dung Maven thuong:
```
mvn spring-boot:run
```

Sau khi app start lan dau, co the dang nhap bang cac tai khoan seed o muc `Data initialization`.

## 8) Diem can biet khi mo rong
- Product da co `create` voi upload anh; `update/delete` chua duoc implement.
- Chua co controller/service cho Cart, Order, Review.
- Auth da dung custom exception theo use-case cho service/controller.
- Chua co `@RestControllerAdvice` tong quat cho business exception; tuy nhien security da co handler rieng cho `401/403`.
- `Product.specs` dung JSON column trong Postgres (JPA JSON mapping).
- Da co `MinioStorageService` de upload/xoa/resolve public URL.

## 9) Dinh huong them (goi y cho team)
- Them `@RestControllerAdvice` de thong nhat format loi.
- Them API `update/delete` cho product va dong bo luong xoa anh tren MinIO.
- Toi uu quan ly MinIO bucket policy theo moi truong (dev/staging/prod) va bo sung luong xoa file theo lifecycle.
