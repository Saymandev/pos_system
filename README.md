# Restaurant POS System

A comprehensive Point of Sale system built with Next.js, featuring real-time updates and advanced restaurant management capabilities.

## 🚀 Features

### Core Functionality
- **Dashboard** - Real-time overview with total orders, sales, and live activity
- **Point of Sale (POS)** - Full-screen interface with live inventory updates
- **Menu Management** - Categories and items with pagination and real-time sync
- **Order Management** - Track all orders with advanced filtering, sorting, and pagination
- **User Management** - Staff access control with role-based permissions and pagination

### 🔄 Real-Time Features (Socket.io)
- **Live Order Updates** - New orders appear instantly across all connected devices
- **Real-Time Inventory** - Item availability changes sync immediately to POS terminals
- **Live Dashboard Stats** - Sales figures and order counts update in real-time
- **Settings Synchronization** - System settings broadcast to all active users
- **Connection Status** - Visual indicators showing live update connectivity
- **Multi-User Support** - Multiple staff members can work simultaneously

### POS Interface
- **Categories Sidebar** - Easy navigation between menu categories
- **Items Grid** - Visual item selection with images and real-time availability
- **Shopping Cart** - Real-time cart management with quantity controls
- **Payment Processing** - Support for Cash, Card, and Due payments
- **Receipt Generation** - Automatic receipt printing and invoicing
- **Live Updates** - Instant item availability changes and menu updates

### 📊 Advanced Management
- **Pagination System** - Efficient handling of large datasets (1000+ items/orders)
- **Server-Side Filtering** - Fast search and filtering across all data
- **Intelligent Sorting** - Multiple sort options with real-time updates
- **Bulk Operations** - Manage multiple items efficiently
- **Export Capabilities** - Download data for reporting and analysis

### Technical Features
- **Real-Time Updates** - Socket.io for instant synchronization
- **Pagination** - Handle unlimited items, orders, and users efficiently
- **Custom Server** - Optimized Socket.io integration with Next.js
- **Smart API Design** - Separate endpoints for POS vs management
- **Server Actions** - Next.js 14 App Router with server actions
- **Authentication** - JWT-based staff authentication with role management
- **Database** - PostgreSQL with Prisma ORM and optimized queries
- **Responsive Design** - Tailwind CSS for modern, mobile-friendly UI

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Real-Time**: Socket.io for live updates and notifications
- **Backend**: Next.js API Routes, Custom Socket.io Server
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom components
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: React Context API + Socket.io
- **Icons**: Heroicons
- **Notifications**: React Hot Toast + Real-time alerts

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## ⚡ Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd restaurant-pos-system
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb restaurant_pos
   
   # Configure environment variables
   cp .env.example .env.local
   # Edit .env.local with your database URL
   ```

3. **Database Migration and Seed**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start Development Server (with Socket.io)**
   ```bash
   # Start with real-time features
   npm run dev
   
   # Or use standard Next.js (without real-time)
   npm run dev:next
   ```

5. **Access the Application**
   - Open http://localhost:3000
   - Login with demo credentials:
     - **Admin**: admin@restaurant.com / admin123
     - **Staff**: staff@restaurant.com / staff123
   - Look for "Live Updates Active" indicator in bottom-right

## 🔄 Real-Time Features Guide

### Socket.io Integration
The system automatically connects to Socket.io when users log in. Features include:

- **🟢 Live Updates Active** - Green indicator shows real-time connection
- **🟡 Connecting...** - Yellow indicator during connection attempts
- **Auto-Reconnection** - Automatically reconnects if connection drops

### Real-Time Events
- **New Orders** - Instantly appear on dashboard with sound notification
- **Item Changes** - POS screens update immediately when items are modified
- **Settings Updates** - System-wide settings sync across all devices
- **User Activity** - See when other staff members join/leave

## 📊 Pagination System

### Efficient Data Handling
- **Orders**: 25 per page (configurable: 10, 25, 50, 100)
- **Items**: 25 per page (configurable: 10, 25, 50, 100)
- **Users**: 25 per page (configurable: 10, 25, 50)
- **POS System**: All items loaded (required for instant access)

### Smart Loading
- **Server-Side Filtering** - Fast search across thousands of records
- **Client-Side Refinement** - Instant filtering for current page
- **Optimized Queries** - Only loads necessary data
- **Real-Time Updates** - Socket.io events update current page data

## 🗂 Project Structure

```
restaurant-pos-system/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── categories/    # Category management
│   │   ├── items/         # Item management (paginated)
│   │   │   └── pos/       # Dedicated POS endpoint (all items)
│   │   ├── orders/        # Order processing (paginated)
│   │   ├── users/         # User management (paginated)
│   │   └── dashboard/     # Dashboard statistics
│   ├── dashboard/         # Real-time dashboard
│   ├── pos/              # Point of Sale with live updates
│   ├── items/            # Item management with pagination
│   ├── orders/           # Order management with pagination
│   ├── users/            # User management with pagination
│   ├── login/            # Authentication page
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # UI components + Pagination
│   │   ├── Pagination.tsx       # Reusable pagination component
│   │   ├── ConnectionStatus.tsx # Live update indicator
│   │   └── LiveUpdateTest.tsx   # Real-time event viewer
│   └── pos/             # POS-specific components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   ├── CartContext.tsx  # Shopping cart state
│   ├── SettingsContext.tsx # System settings
│   └── SocketContext.tsx   # Real-time connection state
├── lib/                 # Utility functions
│   ├── db.ts           # Database connection
│   ├── auth.ts         # Authentication utilities
│   ├── socket.ts       # Socket.io client utilities
│   ├── socketEmitter.ts # Server-side event broadcasting
│   └── utils.ts        # Helper functions
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Sample data
├── server.js           # Custom Socket.io server
└── package.json        # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables (.env.local)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_pos"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App
NODE_ENV="development"
PORT=3000
```

### Socket.io Configuration
The system automatically configures Socket.io with:
- **Auto-reconnection** - Handles connection drops gracefully
- **Room Management** - Users join appropriate rooms for targeted updates
- **Event Broadcasting** - Real-time events sent to all connected clients
- **Fallback Support** - Works even without WebSocket support

### Database Schema
The system uses the following main models:
- **User** - Staff authentication and roles
- **Category** - Menu categories with colors
- **Item** - Menu items with pricing and availability
- **Order** - Customer orders with payment info
- **OrderItem** - Individual items within orders
- **Settings** - System-wide configuration

## 🎯 Usage Guide

### Staff Login
1. Navigate to `/login`
2. Use provided demo credentials or create new staff accounts
3. Access granted based on user role (Admin/Manager/Staff)
4. **Look for "Live Updates Active" indicator** after login

### Processing Orders (POS)
1. Go to `/pos` for the full-screen POS interface
2. **Real-time menu loading** - All items sync instantly
3. Select category from the left sidebar
4. Click items to add to cart (right sidebar)
5. **Live availability updates** - Items auto-disable if unavailable
6. Adjust quantities using +/- buttons
7. Click "Checkout" to process payment
8. Select payment method and complete order
9. **Order broadcasts live** to all connected dashboards
10. Receipt automatically generated

### Menu Management with Real-Time Updates
1. **Categories**: Create and organize menu categories
2. **Items**: Add items with pricing, descriptions, and images
3. **Live Availability**: Toggle item availability - **POS screens update instantly**
4. **Pagination**: Browse through thousands of items efficiently
5. **Real-time Sync**: All changes broadcast to connected POS terminals

### Order Tracking with Pagination
1. View all orders in `/orders` with pagination
2. **Real-time updates**: New orders appear automatically
3. Filter by date range, status, payment method, or amount
4. Sort by order number, date, total, or status
5. Server-side search across thousands of orders
6. Export order data for reporting

### User Management
1. **Paginated user list** - Handle unlimited staff members
2. **Real-time status** - See active/inactive users
3. **Role-based permissions** - Admin, Manager, Staff levels
4. **Bulk operations** - Manage multiple users efficiently

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **HTTP-only Cookies** - Prevent XSS attacks
- **Role-based Access** - Different permission levels
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **Socket.io Security** - Authenticated connections only
- **Rate Limiting** - API endpoint protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Staff login
- `POST /api/auth/logout` - Staff logout
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (broadcasts update)
- `PATCH /api/categories/[id]` - Update category (broadcasts update)
- `DELETE /api/categories/[id]` - Delete category

### Items
- `GET /api/items` - List items (paginated, with filters)
  - Query params: `page`, `limit`, `search`, `categoryId`, `isAvailable`, `sortBy`, `sortOrder`
- `GET /api/items/pos` - Get ALL items for POS (no pagination)
- `POST /api/items` - Create item (broadcasts to POS)
- `PATCH /api/items/[id]` - Update item (broadcasts to POS)
- `DELETE /api/items/[id]` - Delete item

### Orders
- `GET /api/orders` - List orders (paginated, with filters)
  - Query params: `page`, `limit`, `status`, `paymentType`, `startDate`, `endDate`
- `POST /api/orders` - Create new order (broadcasts to dashboard)

### Users
- `GET /api/users` - List users (paginated, with filters)
  - Query params: `page`, `limit`, `search`, `role`, `isActive`, `sortBy`, `sortOrder`
- `POST /api/users` - Create user
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get real-time statistics

### Settings
- `GET /api/settings` - Get system settings
- `POST /api/settings` - Update settings (broadcasts to all users)

## 🧪 Development Scripts

```bash
# Development with Real-Time Features
npm run dev          # Start with Socket.io server (recommended)
npm run dev:next     # Start standard Next.js server

# Production
npm run build        # Build for production
npm run start        # Start production with Socket.io

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Customization

### Real-Time Features
- Modify Socket.io events in `lib/socketEmitter.ts`
- Customize client-side handlers in `contexts/SocketContext.tsx`
- Add new real-time features in component `useEffect` hooks

### Pagination Settings
- Adjust default page sizes in `components/ui/Pagination.tsx`
- Modify API pagination limits in respective route files
- Customize pagination UI components

### Styling
- Modify `tailwind.config.js` for custom colors and spacing
- Update `app/globals.css` for global styles
- Component-specific styles in individual files
- Real-time indicator styles in `components/ui/ConnectionStatus.tsx`

### Business Logic
- Modify tax rates in `contexts/CartContext.tsx`
- Update receipt template in `components/pos/PaymentModal.tsx`
- Customize order number generation in `lib/utils.ts`
- Add new real-time events in API routes

## 📈 Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   DATABASE_URL=your-production-db-url
   NEXTAUTH_SECRET=secure-random-string
   PORT=3000
   ```

2. **Database Migration**
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npm run start  # Starts with Socket.io support
   ```

4. **Socket.io Production Considerations**
   - Ensure WebSocket support on hosting platform
   - Configure load balancer for sticky sessions
   - Monitor Socket.io connection metrics

## 🚀 Performance Features

### Optimizations Implemented
- **Server-Side Pagination** - Handles unlimited data efficiently
- **Smart API Design** - Separate endpoints for different use cases
- **Real-Time Efficiency** - Targeted Socket.io room broadcasting
- **Database Optimization** - Indexed queries and efficient joins
- **Client-Side Caching** - Intelligent state management
- **Lazy Loading** - Components load as needed

### Scalability
- **Multi-User Support** - Unlimited concurrent users
- **Large Datasets** - Tested with 10,000+ items and orders
- **Real-Time Performance** - Instant updates across all devices
- **Database Scaling** - PostgreSQL with connection pooling

## 🆘 Troubleshooting

### Socket.io Issues
- **Connection Problems**: Check browser console for WebSocket errors
- **Real-Time Not Working**: Verify server started with `npm run dev` (not `npm run dev:next`)
- **Performance Issues**: Monitor Socket.io connection count

### Pagination Issues
- **Slow Loading**: Check database indexes and query performance
- **Missing Data**: Verify API endpoint pagination parameters
- **Search Problems**: Check server-side filtering implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test real-time features thoroughly
4. Ensure pagination works with large datasets
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation above
2. Review the code comments
3. Test real-time features in multiple browser tabs
4. Create an issue in the repository

---

**Built with ❤️ for modern restaurant operations**
*Featuring real-time updates, efficient pagination, and scalable architecture* 