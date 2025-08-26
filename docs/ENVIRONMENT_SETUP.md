# 🔧 Environment Configuration Setup Guide

This guide helps you configure your `config.env.local` file with the correct values for local development.

## 📋 **Current Status**

✅ **Already Configured:**
- Database settings (local PostgreSQL)
- File storage (local, 5MB limit)
- JWT secrets (updated with secure values)
- Port and basic configuration

⚠️ **Needs Your Input:**
- OpenAI API key
- Email credentials (optional)
- Any other API keys you want to test

## 🚀 **Step-by-Step Setup**

### **1. OpenAI API Key (Required for AI Features)**

Get your API key from: https://platform.openai.com/api-keys

```bash
# Update this line in config.env.local:
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Example:**
```bash
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### **2. Email Configuration (Optional)**

If you want to test email functionality:

```bash
# Gmail setup (requires App Password):
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Or use a test email service:
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password (not your regular password)

### **3. Test Your Configuration**

After updating the values:

```bash
# 1. Restart your server
pnpm run start:dev

# 2. Check if OpenAI is working
curl -X POST http://localhost:3001/api/v1/ai-health/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"pet_id": "test-pet-id"}'

# 3. Check Swagger UI
open http://localhost:3001/api/docs
```

## 🔍 **Configuration Validation**

### **OpenAI Test**
```bash
# Check if OpenAI is properly configured
node -e "
require('dotenv').config({ path: './config.env.local' });
const apiKey = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key:', apiKey ? '✅ Set' : '❌ Not set');
if (apiKey && apiKey !== 'your-openai-api-key-here') {
  console.log('Format:', apiKey.startsWith('sk-') ? '✅ Valid' : '❌ Invalid');
  console.log('Length:', apiKey.length, 'characters');
} else {
  console.log('⚠️  Still using placeholder value');
}
"
```

### **Database Test**
```bash
# Check database connection
pnpm run start:dev
# Look for: "Database connection established" in logs
```

### **File Storage Test**
```bash
# Check uploads directory
ls -la uploads/
# Should show the directory exists
```

## 📁 **File Structure**

```
config.env.local          # Your local configuration (this file)
config.env.example        # Example configuration (reference)
.env                      # Default environment (if exists)
```

## 🚨 **Security Notes**

✅ **Safe for Local Development:**
- JWT secrets (auto-generated)
- Database passwords (local only)
- API keys (your own keys)

❌ **Never Commit:**
- Real API keys
- Production secrets
- Database credentials

## 🔄 **Switching Between Configurations**

### **Local Development (Current)**
```bash
USE_LOCAL_DB=true
LOCAL_STORAGE_PATH=./uploads
```

### **Supabase (Future)**
```bash
USE_LOCAL_DB=false
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## 🐛 **Troubleshooting**

### **Port Already in Use**
```bash
# Kill processes on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in config.env.local
PORT=3002
```

### **Database Connection Failed**
```bash
# Check if PostgreSQL is running
docker compose ps

# Start PostgreSQL
docker compose up -d postgres
```

### **OpenAI API Errors**
```bash
# Check API key format
echo $OPENAI_API_KEY | grep -E "^sk-[a-zA-Z0-9]{20,}"

# Verify key is valid
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

## 📚 **Next Steps**

1. **Update OpenAI API key** in `config.env.local`
2. **Restart your server**: `pnpm run start:dev`
3. **Test AI endpoints** in Swagger UI
4. **Verify file upload** functionality
5. **Check database** connections

## 🎯 **Quick Test Commands**

```bash
# Test server startup
pnpm run start:dev

# Test database
pnpm run migrate:show

# Test build
pnpm run build

# Test Swagger generation
pnpm run docs:generate
```

---

## ✅ **Configuration Checklist**

- [ ] OpenAI API key updated
- [ ] Server starts without errors
- [ ] Database connects successfully
- [ ] File uploads work
- [ ] AI endpoints respond
- [ ] Swagger UI accessible

**Your environment is almost ready! Just update the OpenAI API key and you'll have a fully functional local development setup.** 🚀
