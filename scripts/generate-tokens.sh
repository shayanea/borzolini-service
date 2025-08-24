#!/bin/bash

# Token Generator Script Wrapper
# This script provides a convenient way to generate JWT tokens for testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if required tools are available
check_dependencies() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm not found, trying npm..."
        if ! command -v npm &> /dev/null; then
            print_error "Neither pnpm nor npm is installed"
            exit 1
        fi
        PACKAGE_MANAGER="npm"
    else
        PACKAGE_MANAGER="pnpm"
    fi
}

# Function to check if we're in the right directory
check_project_structure() {
    if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
        print_error "This script must be run from the project root directory"
        print_info "Please navigate to the project root and try again"
        exit 1
    fi
}

# Function to check environment setup
check_environment() {
    if [[ ! -f ".env" ]] && [[ ! -f "config.env.local" ]]; then
        print_warning "No environment file found (.env or config.env.local)"
        print_info "Make sure you have configured your environment variables"
        print_info "You can copy config.env.example and configure it"
    fi
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}🔐 Token Generator - Generate JWT tokens for testing${NC}"
    echo "=" | tr '\n' '=' | head -c 60; echo
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Available commands:"
    echo ""
    echo "  list                                    - List all existing users"
    echo "  generate <email> <password>             - Generate tokens for existing user"
    echo "  create <email> <password> <firstName> <lastName> [role] - Create new user and generate tokens"
    echo "  help                                    - Show this help message"
    echo ""
    echo "Examples:"
    echo ""
    echo "  # List existing users"
    echo "  $0 list"
    echo ""
    echo "  # Generate tokens for existing user"
    echo "  $0 generate admin@borzolini.com Password123!"
    echo ""
    echo "  # Create new user and generate tokens"
    echo "  $0 create test@example.com Password123! John Doe user"
    echo ""
    echo "Note: Default password for seeded users is \"Password123!\""
    echo ""
}

# Function to run the TypeScript script
run_script() {
    local command="$1"
    shift
    
    if [[ "$PACKAGE_MANAGER" == "pnpm" ]]; then
        pnpm run generate-tokens "$command" "$@"
    else
        npm run generate-tokens "$command" "$@"
    fi
}

# Main execution
main() {
    print_info "Checking dependencies and environment..."
    
    check_dependencies
    check_project_structure
    check_environment
    
    print_success "Environment check completed"
    echo ""
    
    local command="$1"
    
    case "$command" in
        "list")
            print_info "Listing existing users..."
            run_script list
            ;;
        "generate")
            if [[ $# -lt 3 ]]; then
                print_error "Usage: $0 generate <email> <password>"
                exit 1
            fi
            print_info "Generating tokens for user: $2"
            run_script generate "$2" "$3"
            ;;
        "create")
            if [[ $# -lt 5 ]]; then
                print_error "Usage: $0 create <email> <password> <firstName> <lastName> [role]"
                exit 1
            fi
            print_info "Creating new user and generating tokens: $2"
            run_script create "$2" "$3" "$4" "$5" "${6:-user}"
            ;;
        "help"|"--help"|"-h"|"")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
