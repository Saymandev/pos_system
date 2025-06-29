# Restaurant POS System

A comprehensive Point of Sale system built with Next.js, designed specifically for restaurant operations.

## 🚀 Features

### Core Functionality
- **Dashboard** - Overview with total orders, sales, and recent activity
- **Point of Sale (POS)** - Full-screen interface for order processing
- **Menu Management** - Categories and items with pricing
- **Order Management** - Track all orders with filtering and pagination
- **User Management** - Staff access control with role-based permissions

### POS Interface
- **Categories Sidebar** - Easy navigation between menu categories
- **Items Grid** - Visual item selection with images and pricing
- **Shopping Cart** - Real-time cart management with quantity controls
- **Payment Processing** - Support for Cash, Card, and Due payments
- **Receipt Generation** - Automatic receipt printing

### Technical Features
- **Server Actions** - Next.js 14 App Router with server actions
- **Real-time Updates** - Cart state management with React Context
- **Authentication** - JWT-based staff authentication
- **Database** - PostgreSQL with Prisma ORM
- **Responsive Design** - Tailwind CSS for modern UI

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: React Context API
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

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

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open http://localhost:3000
   - Login with demo credentials:
     - **Admin**: admin@restaurant.com / admin123
     - **Staff**: staff@restaurant.com / staff123

## 🗂 Project Structure

```
restaurant-pos-system/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── categories/    # Category management
│   │   ├── items/         # Item management
│   │   ├── orders/        # Order processing
│   │   └── dashboard/     # Dashboard statistics
│   ├── dashboard/         # Dashboard page
│   ├── pos/              # Point of Sale interface
│   ├── login/            # Authentication page
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # UI components
│   └── pos/             # POS-specific components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── CartContext.tsx  # Shopping cart state
├── lib/                 # Utility functions
│   ├── db.ts           # Database connection
│   ├── auth.ts         # Authentication utilities
│   └── utils.ts        # Helper functions
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Sample data
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
```

### Database Schema
The system uses the following main models:
- **User** - Staff authentication and roles
- **Category** - Menu categories with colors
- **Item** - Menu items with pricing and availability
- **Order** - Customer orders with payment info
- **OrderItem** - Individual items within orders

## 🎯 Usage Guide

### Staff Login
1. Navigate to `/login`
2. Use provided demo credentials or create new staff accounts
3. Access granted based on user role (Admin/Manager/Staff)

### Processing Orders (POS)
1. Go to `/pos` for the full-screen POS interface
2. Select category from the left sidebar
3. Click items to add to cart (right sidebar)
4. Adjust quantities using +/- buttons
5. Click "Checkout" to process payment
6. Select payment method and complete order
7. Receipt automatically generated

### Menu Management
1. **Categories**: Create and organize menu categories
2. **Items**: Add items with pricing, descriptions, and images
3. **Availability**: Toggle item availability for POS

### Order Tracking
1. View all orders in `/orders`
2. Filter by date range, status, or amount
3. Export order data for reporting

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **HTTP-only Cookies** - Prevent XSS attacks
- **Role-based Access** - Different permission levels
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM prevents SQL injection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Staff login
- `POST /api/auth/logout` - Staff logout
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Items
- `GET /api/items` - List items (with filters)
- `POST /api/items` - Create item

### Orders
- `GET /api/orders` - List orders (paginated)
- `POST /api/orders` - Create new order

### Dashboard
- `GET /api/dashboard/stats` - Get statistics

## 🧪 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for custom colors and spacing
- Update `app/globals.css` for global styles
- Component-specific styles in individual files

### Business Logic
- Modify tax rates in `contexts/CartContext.tsx`
- Update receipt template in `components/pos/PaymentModal.tsx`
- Customize order number generation in `lib/utils.ts`

## 📈 Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   DATABASE_URL=your-production-db-url
   NEXTAUTH_SECRET=secure-random-string
   ```

2. **Database Migration**
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npm run start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation above
2. Review the code comments
3. Create an issue in the repository

---

**Built with ❤️ for restaurant operations** 