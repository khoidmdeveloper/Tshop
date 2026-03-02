# Project Guide - Tshop

Muc tieu: tai lieu nay giup thanh vien moi (hoac sau nay doc lai) hieu nhanh kien truc, chuc nang, va cach chay project ma khong can doc toan bo code.

## 1) Tong quan nhanh
- Tshop la backend Spring Boot (Java 17) cho mo hinh thuong mai dien tu co ban.
- Su dung PostgreSQL, Spring Data JPA, Spring Security (JWT), Validation, Lombok.
- Hien tai co API auth va CRUD cho Category. Cac entity khac la mo hinh du lieu, chua co controller/service tuong ung.

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
`UserRepository` ke thua `JpaRepository`, dong vai tro truy van DB cho User.

### DTO Pattern
`dto/auth/*` gom cac request/response cho auth, duoc validate bang annotation (`@NotBlank`, `@Email`, `@Size`).

### Builder Pattern (Lombok)
`User`, `AuthResponse`, `RegisterRequest`, v.v. su dung `@Builder` de khoi tao object ro rang.

### Security Filter Chain
`JwtAuthenticationFilter` (OncePerRequestFilter) doc header `Authorization: Bearer ...`, xac thuc token va dat `SecurityContext`.

### Domain Validation (Entity hooks)
`ValueValidation.requireOneOf(...)` duoc goi trong `@PrePersist`/`@PreUpdate` cua `User`, `Product`, `Order` de rang buoc gia tri status/role.

## 4) Chuc nang (function) hien tai
### Authentication
File: `controller/AuthenticationController.java`
- `POST /api/auth/register` -> tao user, tra ve access + refresh token.
- `POST /api/auth/login` -> xac thuc, tra ve token.
- `POST /api/auth/refresh` -> tao access token moi tu refresh token.

Flow:
1. Controller nhan DTO va validate.
2. `AuthenticationService`:
   - `register`: check email, ma hoa password (BCrypt), luu user, tao token.
   - `login`: authenticate qua `AuthenticationManager`, tao token.
   - `refreshToken`: validate refresh token, tao access token moi.
3. `JwtService` tao/kiem tra token voi HS256.

### Response wrapper
`ApiResponse<T>` dong goi response theo format: `success`, `message`, `data`, `timestamp`.

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

### Data initialization
File: `config/DataInitializer.java`
- Khi app start, he thong seed 3 tai khoan mac dinh neu chua ton tai theo email.
- Tai khoan:
  - admin: `admin@tshop.local` / `Admin@123` / role `admin`
  - customer 1: `customer1@tshop.local` / `Customer@123` / role `customer`
  - customer 2: `customer2@tshop.local` / `Customer@123` / role `customer`
- Co check `existsByEmail(...)` truoc khi insert nen restart app khong tao du lieu trung.

## 5) Mo hinh du lieu (entities) va quan he
### User
- Truong: email, passwordHash, role (customer/admin), fullName, phone
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
- Luu `object_key` (key tren object storage). Hien chua co service upload/download.

## 6) Cau hinh va bien moi truong
`application.properties`:
- Doc `.env` qua `spring.config.import=optional:file:./.env[.properties]`
- Cau hinh DB tu `POSTGRES_*`
- JWT tu `JWT_SECRET`, `jwt.access-token-expiration`, `jwt.refresh-token-expiration`

### CORS (SecurityConfig)
- Backend bat CORS thong qua `CorsConfigurationSource` trong `SecurityConfig`.
- Dang dung `allowedOriginPatterns("*")` (cho frontend nao cung duoc), phu hop cho du an nho/dev.
- Methods cho phep: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Headers: `*`, expose header `Authorization`, `allowCredentials=true`.
- Co permit `OPTIONS /**` de preflight request di qua Spring Security.

**Luu y quan trong**: `JwtService` dung `Decoders.BASE64.decode(secretKey)`, vi vay `JWT_SECRET` phai la chuoi Base64 hop le (toi thieu 256-bit cho HS256).

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
- Hien tai chua co controller/service cho Product, Cart, Order, Review.
- Chua co Global Exception Handler (response loi se theo mac dinh Spring).
- `Product.specs` dung JSON column trong Postgres (JPA JSON mapping).
- `ProductImage.objectKey` goi y luu key file tren MinIO/ S3, can viet service upload.

## 9) Dinh huong them (goi y cho team)
- Them `@RestControllerAdvice` de thong nhat format loi.
- Them services/ controllers cho product, cart, order.
- Them config cho MinIO (S3 client) va service luu file anh.
