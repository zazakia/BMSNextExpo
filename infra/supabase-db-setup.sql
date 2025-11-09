-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'STAFF');
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CARD', 'MIXED');

-- Create tables
CREATE TABLE IF NOT EXISTS "public"."User" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "email" text NOT NULL,
  "passwordHash" text NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'STAFF',
  "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."Product" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" text NOT NULL,
  "description" text,
  "sku" text NOT NULL,
  "price" double precision NOT NULL,
  "costPrice" double precision NOT NULL,
  "category" text NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."InventoryItem" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "productId" uuid NOT NULL,
  "quantity" integer NOT NULL DEFAULT 0,
  "lowStockAt" integer NOT NULL DEFAULT 10,
  "location" text,
  "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."SalesTransaction" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "products" jsonb NOT NULL,
  "totalAmount" double precision NOT NULL,
  "paymentType" "PaymentType" NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesTransaction_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "public"."InventoryItem" 
  ADD CONSTRAINT "InventoryItem_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE;

ALTER TABLE "public"."SalesTransaction" 
  ADD CONSTRAINT "SalesTransaction_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "public"."User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "public"."Product"("sku");

-- Create other indexes
CREATE INDEX IF NOT EXISTS "InventoryItem_productId_idx" ON "public"."InventoryItem"("productId");
CREATE INDEX IF NOT EXISTS "SalesTransaction_userId_idx" ON "public"."SalesTransaction"("userId");
CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "public"."Product"("name");

-- Enable RLS
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SalesTransaction" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- This will be implemented in the next step (supabase-rls.sql)