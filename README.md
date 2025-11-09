# Business Management System (BMS)

A comprehensive business management solution with web and mobile clients, backed by Supabase (Postgres) with Prisma as ORM.

## Table of Contents
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Project Structure

```
.
├── apps/
│   ├── web/                  # Next.js web application
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # UI components
│   │   │   ├── styles/      # Global styles
│   │   │   └── lib/         # Utility functions
│   │   ├── package.json
│   │   ├── vercel.json
│   │   └── ...
│   └── mobile/              # React Native + Expo mobile app
│       ├── src/
│       │   ├── app/         # Expo Router screens
│       │   ├── components/  # UI components
│       │   ├── lib/         # Utility functions
│       │   └── api/         # API client
│       ├── app.json
│       ├── package.json
│       ├── eas.json
│       └── ...
├── packages/
│   ├── api/                 # Shared API client and domain services
│   │   ├── src/
│   │   │   ├── inventory.ts
│   │   │   ├── pos.ts
│   │   │   ├── purchasing.ts
│   │   │   ├── accounting.ts
│   │   │   ├── reporting.ts
│   │   │   ├── branchManagement.ts
│   │   │   ├── expenseTracking.ts
│   │   │   ├── advancedReporting.ts
│   │   │   ├── paymentIntegrations.ts
│   │   │   ├── offlineSync.ts
│   │   │   ├── auth.ts
│   │   │   └── supabaseClient.ts
│   ├── db/                  # Prisma schema and database utilities
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── prisma.config.ts
│   │   ├── package.json
│   │   └── ...
│   └── ui/                  # Shared UI components
├── infra/                   # Infrastructure configuration
│   ├── supabase-config.md
│   ├── supabase-db-setup.sql
│   ├── supabase-rls.sql
│   ├── auth-providers.md
│   └── environment-configs.md
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # CI/CD pipeline
├── package.json
└── turbo.json
```

## Technologies

### Frontend
- **Web**: Next.js, React, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo, TypeScript
- **State Management**: React Query

### Backend
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

### Development & Deployment
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (web), Expo EAS (mobile)

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (for local development with Supabase)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/bms-next-expo.git
cd bms-next-expo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env.local
```

4. Start the local Supabase instance:
```bash
docker-compose up -d
```

5. Initialize the database:
```bash
cd packages/db
npx prisma generate
npx prisma db push
cd ../../
```

6. Start the development server:
```bash
npm run dev
```

This will start both the web and mobile applications in development mode.

### Production Deployment

Please refer to the [environment-specific configurations](infra/environment-configs.md) document for detailed instructions on deploying to different environments.

## Features

- **User Management**: Role-based access control (Admin, Manager, Staff)
- **Inventory Management**: Multi-UOM support, stock tracking
- **Point of Sale (POS)**: Transaction processing, receipt generation
- **Purchasing**: Purchase orders, goods receipt
- **Accounting**: Chart of accounts, journal entries
- **Reporting**: Sales reports, inventory reports, financial reports
- **Multi-Branch Support**: Manage multiple locations
- **Offline Mode**: Continue operations when connectivity is limited

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the tests
5. Submit a pull request

For more detailed information, please see our [Contributing Guide](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.