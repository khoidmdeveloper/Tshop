# Tshop FE

Frontend React + Vite cho du an Tshop. FE nay giao tiep voi backend `../Tshop` qua cac endpoint `/api`.

## Current Scope

### Customer flow
- Browse san pham theo danh muc va tim kiem
- Xem chi tiet san pham
- Gio hang local cho guest, dong bo voi backend khi user da dang nhap
- Checkout voi GHN shipping + VNPay redirect flow
- Trang callback `/payment/vnpay-return`
- Account gom `Profile` va `Orders`

### Admin flow
- Dashboard
- Product management
- Order management
- Customer management
- Settings

### Important notes
- Account khong con wishlist tab trong route active hien tai
- Pagination dang duoc dung cho product list, admin product list, order history
- Khi doi trang qua pagination, FE tu dong scroll len dau trang
- Trong repo van co mot so page/component chua duoc mount vao router; tai lieu nay chi mo ta route dang active

## Tech Stack

- React 19
- Vite 7
- React Router DOM 6
- Zustand 5
- Tailwind CSS 4
- Radix UI + shadcn-style primitives
- Lucide React
- React Select
- Recharts

## Environment

Tao `.env` tu `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Active Route Map

Routes duoc dinh nghia trong `src/App.jsx`.

| Path | Screen |
| --- | --- |
| `/` | Home |
| `/products` | Product catalog |
| `/products/:id` | Product detail |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/account` | Account |
| `/terms` | Terms |
| `/privacy` | Privacy |
| `/auth/login` | Login |
| `/auth/signup` | Signup |
| `/auth/forgot` | Forgot password |
| `/auth/reset` | Reset password |
| `/payment/vnpay-return` | VNPay callback result |
| `/admin` | Admin dashboard |
| `/admin/products` | Admin products |
| `/admin/orders` | Admin orders |
| `/admin/customers` | Admin customers |
| `/admin/settings` | Admin settings |

## Frontend Architecture

### API layer

API modules nam trong `src/lib/api/`:

- `http-client.js`: request wrapper, response unwrap, auth retry, refresh token flow
- `auth-api.js`: login, register, refresh, logout
- `profile-api.js`: current user profile get/update
- `product-api.js`: product list, detail, create
- `category-api.js`: category list
- `cart-api.js`: get/add/update/remove/clear cart
- `order-api.js`: checkout, order list, order detail, cancel order
- `shipping-api.js`: provinces, districts, wards, shipping fee
- `payment-api.js`: VNPay return verification helper

### State

Store nam trong `src/lib/store.js`:

- `useAuthStore`: session, localStorage persistence, refresh token flow
- `useCartStore`: local cart cho guest va server cart sync khi authenticated

### Shared utilities

- `src/lib/utils.js`: class merge, date, price format
- `src/lib/number.js`: shared `toNumber`
- `src/lib/pagination.js`: page math cho UI pagination
- `src/components/common/pagination-nav.jsx`: pagination wrapper dung chung

## Current Feature Notes

### Product catalog
- Data lay tu backend `GET /api/products`
- Search + category filter gui len backend
- Price range + sort dang xu ly tren FE
- Catalog dang paginate tren FE

### Product detail
- Data lay tu backend `GET /api/products/{id}`
- Ho tro gallery image va add-to-cart

### Cart
- Guest cart luu trong Zustand
- User da dang nhap se goi backend cart API
- Sau login, FE tu dong load lai cart tu server

### Checkout
- Shipping address dung GHN master data + shipping fee API
- Checkout goi `POST /api/orders/checkout`
- Neu backend tra `paymentUrl`, FE redirect sang VNPay
- Neu profile da co saved shipping address day du, checkout mac dinh dung profile address; user co the doi sang mot dia chi khac cho order hien tai
- Order review khong con hien free shipping gia; shipping chi hien khi quote thanh cong, con lai se hien `Calculated at checkout`, `Calculating...` hoac loi tu backend
- FE doi GHN shipping fee VND sang currency noi bo bang `VITE_VND_EXCHANGE_RATE` (fallback `25000`)
- FE gui `/api/shipping/fee` theo backend DTO: `toDistrictId`, `toWardCode`, `weight`, `insuranceValue`
- `weight` duoc tinh bang tong so luong item * 500g; `insuranceValue` duoc tinh tu cart total quy doi sang VND
- Neu backend/GHN khong quote duoc fee, FE khong dat shipping ve `0` nua; user se thay loi va submit checkout se bi chan
- GHN pickup location khong con doc tu env `GHN_FROM_*`; backend gui `ShopId` header va de GHN tu resolve pickup address cua shop

### Account
- Tab active: `Profile`, `Orders`
- Profile goi `GET/PUT /api/profile`
- Order history goi `GET /api/orders`
- Order history co pagination va co the cancel order
- Order history normalize status lowercase tu backend; unpaid VNPay timeout duoc hien thi thanh payment failure thay vi pending vo han
- Profile luu shipping address co cau truc voi `address`, `provinceId/provinceName`, `districtId/districtName`, `wardCode/wardName`

### Admin products
- Load categories + products tu backend
- Ho tro tao product moi bang multipart form:
  - `payload` JSON
  - `thumbnail`
  - optional `images[]`

## Recent Notes

- 2026-05-13: VNPay callback browser flow da doi. Backend verify tai `/api/payment/vnpay-return` roi redirect ve route FE `/payment/vnpay-return`.
- 2026-05-13: Order history da normalize `status` / `paymentStatus` tu backend de xu ly dung cac gia tri lowercase nhu `pending`, `confirmed`, `cancelled`.
- 2026-05-13: Account profile bo `Account Preference`, them saved shipping address editor dung GHN location selectors va dung profile address lam default checkout source.
- 2026-05-13: Cart summary bo promo code mock va shipping hardcoded; shipping fee chi duoc quote tai checkout.
- 2026-05-15: Backend GHN config duoc rut gon ve `GHN_URL`, `GHN_TOKEN`, `GHN_SHOP_ID`; pickup address cua shop duoc GHN resolve tu `ShopId` header khi quote/create shipping.
- 2026-05-15: Checkout shipping fee payload duoc can chinh voi backend DTO; FE khong gui `items` vao `/api/shipping/fee` nua ma gui `weight` va `insuranceValue`.

## Backend Contract Snapshot

Base path: `/api`

### Public endpoints used by FE
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/shipping/provinces`
- `GET /api/shipping/districts`
- `GET /api/shipping/wards`
- `POST /api/shipping/fee`
- `GET /api/payment/vnpay-return`
- `GET /api/payment/vnpay-ipn`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Authenticated endpoints used by FE
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/{itemId}`
- `DELETE /api/cart/items/{itemId}`
- `DELETE /api/cart`
- `POST /api/orders/checkout`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `PUT /api/orders/{id}/cancel`
- `GET /api/categories`
- `POST /api/products` for admin product create

## Project Layout

```text
fe/Tshop-fe/
|-- index.html
|-- package.json
|-- .env.example
|-- public/
`-- src/
    |-- App.jsx
    |-- main.jsx
    |-- pages/
    |-- components/
    |   |-- common/
    |   |-- home/
    |   |-- products/
    |   |-- cart/
    |   |-- checkout/
    |   |-- account/
    |   |-- admin/
    |   `-- ui/
    `-- lib/
        |-- api/
        |-- pagination.js
        |-- number.js
        |-- store.js
        `-- utils.js
```

## Development Notes

- Alias `@/` map toi `src/`
- Static asset nam trong `public/`
- Build output nam trong `dist/`
- Neu thay doi route active, cap nhat lai bang route map nay
