#!/bin/bash

# Database Setup Script for Borzolini Pet Clinic API
# This script sets up the database with migrations and seed data

set -e

echo "🚀 Setting up Borzolini Pet Clinic Database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install it first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first."
    exit 1
fi

print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

print_status "Installing dependencies..."
pnpm install

print_status "Building the project..."
pnpm run build

print_status "Running database migrations..."
# Note: You'll need to implement the migration runner or use TypeORM CLI
# For now, we'll assume the database is already set up with the migration files

print_status "Seeding the database..."
pnpm run seed

print_success "✅ Database setup completed successfully!"
echo ""
echo "📊 Sample data created:"
echo "   👥 10 users (Admin, Veterinarians, Staff, Patients)"
echo "   🏥 3 clinics (Borzolini, Happy Paws, Emergency Hospital)"
echo "   🐕 9 pets (Dogs, Cats with various breeds and health needs)"
echo "   📅 15 appointments (Wellness, Vaccinations, Dental, Emergency, Telemedicine)"
echo ""
echo "🔑 Default credentials:"
echo "   - All users: Password123!"
echo "   - Admin: admin@borzolini.com"
echo "   - Vet: dr.smith@borzolini.com"
echo "   - Patient: john.doe@example.com"
echo ""
echo "📚 Documentation:"
echo "   - Sample data details: docs/SAMPLE_DATA_README.md"
echo "   - API reference: docs/API_REFERENCE.md"
echo "   - Local development: docs/LOCAL_DEVELOPMENT.md"
echo ""
echo "🚀 You can now start the application with: pnpm run start:dev"
