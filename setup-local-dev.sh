#!/bin/bash

echo "🚀 Setting up Borzolini Clinic Local Development Environment"
echo "=========================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp config.env.local .env.local
    echo "✅ .env.local created. Please edit it with your configuration."
else
    echo "✅ .env.local already exists"
fi

# Start PostgreSQL database
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres -d borzolini_clinic; do
    echo "⏳ Database is not ready yet. Waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the project
echo "🔨 Building the project..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ Project built successfully"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm run migrate:run

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migrations failed. Please check for errors."
    exit 1
fi

# Generate Swagger documentation
echo "📚 Generating Swagger documentation..."
pnpm run docs:generate

if [ $? -eq 0 ]; then
    echo "✅ Swagger documentation generated"
else
    echo "⚠️ Swagger generation failed, but continuing..."
fi

echo ""
echo "🎉 Local development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your configuration (especially JWT secrets)"
echo "2. Start the development server: pnpm run start:dev"
echo "3. Access the API at: http://localhost:3001/api/v1"
echo "4. Access Swagger UI at: http://localhost:3001/api/docs"
echo "5. Access PgAdmin at: http://localhost:5050 (admin@borzolini.com / admin123)"
echo ""
echo "🐘 PostgreSQL is running on localhost:5432"
echo "📊 Database: borzolini_clinic"
echo "👤 Username: postgres"
echo "🔑 Password: postgres"
echo ""
echo "🔄 To switch back to Supabase later:"
echo "   - Set USE_LOCAL_DB=false in .env.local"
echo "   - Configure Supabase credentials"
echo "   - Run migrations on Supabase"
echo ""
echo "Happy coding! 🚀"
