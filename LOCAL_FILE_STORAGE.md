# 📁 Local File Storage System

A comprehensive local file storage solution for your clinic API, perfect for development and testing without external costs.

## 🚀 **Features**

### **Core Functionality**
- ✅ **File Upload** - Secure file uploads with validation
- ✅ **File Management** - List, delete, copy, and organize files
- ✅ **Metadata Storage** - Rich file information and tagging
- ✅ **Static File Serving** - Direct file access via URLs
- ✅ **Storage Statistics** - Monitor usage and cleanup
- ✅ **Security** - JWT authentication and file validation

### **File Types Supported**
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Documents**: PDF, Word, Excel, Text files
- **Archives**: ZIP, RAR, 7Z files

### **File Size Limits**
- **Default**: 5MB maximum per file
- **Configurable**: Via `MAX_FILE_SIZE` environment variable

## 🏗️ **Architecture**

### **Directory Structure**
```
uploads/
├── pets/
│   ├── {petId}/
│   │   ├── photos/
│   │   ├── documents/
│   │   └── medical-records/
├── clinics/
│   ├── {clinicId}/
│   │   ├── logos/
│   │   ├── photos/
│   │   └── documents/
├── users/
│   ├── {userId}/
│   │   ├── avatars/
│   │   └── documents/
└── temp/
    └── {sessionId}/
```

### **Metadata Files**
Each uploaded file gets a corresponding `.json` metadata file:
```json
{
  "originalName": "pet-photo.jpg",
  "contentType": "image/jpeg",
  "size": 1024000,
  "uploadedBy": "clinic-api",
  "uploadedAt": "2024-01-15T10:30:00.000Z",
  "category": "pets",
  "tags": ["profile", "cute"],
  "description": "Pet profile photo"
}
```

## 🔧 **API Endpoints**

### **File Upload**
```http
POST /api/v1/file-upload/upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Body:
- file: <file>
- category: string (required)
- subcategory: string (optional)
- tags: string[] (optional)
- description: string (optional)
```

**Example Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "http://localhost:3000/api/v1/files/pets/123/photos/1705312200000-abc123-pet-photo.jpg",
    "path": "pets/123/photos/1705312200000-abc123-pet-photo.jpg",
    "size": 1024000,
    "contentType": "image/jpeg",
    "originalName": "pet-photo.jpg",
    "metadata": {
      "originalName": "pet-photo.jpg",
      "contentType": "image/jpeg",
      "size": 1024000,
      "uploadedBy": "clinic-api",
      "uploadedAt": "2024-01-15T10:30:00.000Z",
      "category": "pets",
      "tags": ["profile", "cute"],
      "description": "Pet profile photo"
    }
  }
}
```

### **List Files**
```http
GET /api/v1/file-upload/files/{category}/{subcategory}?limit=10&offset=0
Authorization: Bearer <jwt-token>
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "http://localhost:3000/api/v1/files/pets/123/photos/1705312200000-abc123-pet-photo.jpg",
      "path": "pets/123/photos/1705312200000-abc123-pet-photo.jpg",
      "size": 1024000,
      "contentType": "image/jpeg",
      "originalName": "pet-photo.jpg",
      "metadata": { ... }
    }
  ],
  "total": 1
}
```

### **Get File Info**
```http
GET /api/v1/file-upload/files/{category}/{subcategory}/{filename}
Authorization: Bearer <jwt-token>
```

### **Delete File**
```http
DELETE /api/v1/file-upload/files/{category}/{subcategory}/{filename}
Authorization: Bearer <jwt-token>
```

### **Copy File**
```http
POST /api/v1/file-upload/files/{category}/{subcategory}/{filename}/copy
Authorization: Bearer <jwt-token>

Body:
{
  "newCategory": "backup",
  "newSubcategory": "archive"
}
```

### **Storage Statistics**
```http
GET /api/v1/file-upload/stats
Authorization: Bearer <jwt-token>
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 25,
    "totalSize": 52428800,
    "categories": {
      "pets": {
        "count": 15,
        "size": 31457280
      },
      "clinics": {
        "count": 10,
        "size": 20971520
      }
    }
  }
}
```

### **Cleanup Old Files**
```http
POST /api/v1/file-upload/cleanup
Authorization: Bearer <jwt-token>

Body:
{
  "daysOld": 30
}
```

### **Download File**
```http
GET /api/v1/file-upload/download/{category}/{subcategory}/{filename}
Authorization: Bearer <jwt-token>
```

### **Static File Access**
```http
GET /api/v1/files/{category}/{subcategory}/{filename}
```
*No authentication required for public file access*

## 📱 **Mobile App Integration**

### **Upload Pet Photo**
```typescript
const formData = new FormData();
formData.append('file', photoFile);
formData.append('category', 'pets');
formData.append('subcategory', petId);
formData.append('tags', JSON.stringify(['profile', 'cute']));
formData.append('description', 'Pet profile photo');

const response = await fetch('/api/v1/file-upload/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
const imageUrl = result.data.url;
```

### **Display Pet Photo**
```typescript
// Use the URL directly in Image component
<Image 
  source={{ uri: imageUrl }}
  style={styles.petPhoto}
  resizeMode="cover"
/>
```

### **List Pet Photos**
```typescript
const response = await fetch(`/api/v1/file-upload/files/pets/${petId}/photos`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const result = await response.json();
const photos = result.data;
```

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Local Storage Configuration
LOCAL_STORAGE_PATH=./uploads          # Upload directory path
MAX_FILE_SIZE=10485760                # Maximum file size in bytes (10MB)
FRONTEND_URL=http://localhost:3000    # Base URL for file URLs
```

### **File Size Limits**
```typescript
// Default: 5MB
const maxFileSize = 5 * 1024 * 1024;

// Configurable via environment
const maxFileSize = configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024);
```

### **Allowed MIME Types**
```typescript
const allowedMimeTypes = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
];
```

## 🔒 **Security Features**

### **Authentication**
- **JWT Required**: All file operations require valid JWT token
- **User Context**: Files are associated with authenticated users
- **Role-Based Access**: Can be extended with role-based permissions

### **File Validation**
- **Size Limits**: Prevents large file uploads
- **Type Validation**: Only allows safe file types
- **Virus Scanning**: Ready for future antivirus integration

### **Access Control**
- **Public Files**: Static file serving for public access
- **Private Files**: Protected by authentication
- **Metadata Protection**: File information is secured

## 📊 **Storage Management**

### **Automatic Cleanup**
```typescript
// Clean up files older than 30 days
const deletedCount = await localStorageService.cleanupOldFiles(30);
console.log(`Deleted ${deletedCount} old files`);
```

### **Storage Monitoring**
```typescript
// Get storage statistics
const stats = await localStorageService.getStorageStats();
console.log(`Total files: ${stats.totalFiles}`);
console.log(`Total size: ${stats.totalSize} bytes`);
```

### **File Organization**
```typescript
// Organize files by category and subcategory
await localStorageService.uploadFile(file, 'pets', petId, {
  tags: ['profile', 'cute'],
  description: 'Pet profile photo'
});
```

## 🚀 **Usage Examples**

### **Upload Clinic Logo**
```typescript
const formData = new FormData();
formData.append('file', logoFile);
formData.append('category', 'clinics');
formData.append('subcategory', clinicId);
formData.append('tags', JSON.stringify(['logo', 'branding']));
formData.append('description', 'Clinic logo');

const response = await fetch('/api/v1/file-upload/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData,
});
```

### **Upload Pet Medical Record**
```typescript
const formData = new FormData();
formData.append('file', medicalRecordFile);
formData.append('category', 'pets');
formData.append('subcategory', `${petId}/medical-records`);
formData.append('tags', JSON.stringify(['medical', 'vaccination']));
formData.append('description', 'Vaccination record');

const response = await fetch('/api/v1/file-upload/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData,
});
```

### **List All Pet Photos**
```typescript
const response = await fetch(`/api/v1/file-upload/files/pets/${petId}/photos`, {
  headers: { 'Authorization': `Bearer ${token}` },
});

const result = await response.json();
const photos = result.data.map(file => file.url);
```

### **Delete Old File**
```typescript
const response = await fetch(`/api/v1/file-upload/files/pets/${petId}/photos/${filename}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

## 🔄 **Migration to Cloud Storage**

When you're ready to move to production:

### **Supabase Storage (Recommended)**
```typescript
// Replace LocalStorageService with SupabaseStorageService
const { data, error } = await supabase.storage
  .from('pets')
  .upload(`${petId}/photos/${fileName}`, file);
```

### **AWS S3**
```typescript
// Replace with S3 upload
const s3Client = new S3Client({ region: 'us-east-1' });
await s3Client.send(new PutObjectCommand({
  Bucket: 'your-bucket',
  Key: `pets/${fileName}`,
  Body: file.buffer,
}));
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **File Upload Fails**
```bash
# Check file size
ls -la uploads/

# Check permissions
chmod 755 uploads/

# Check disk space
df -h
```

#### **File Not Found**
```bash
# Verify file exists
ls -la uploads/pets/123/photos/

# Check metadata file
cat uploads/pets/123/photos/filename.json
```

#### **Permission Denied**
```bash
# Fix directory permissions
chmod -R 755 uploads/
chown -R $USER:$USER uploads/
```

### **Debug Mode**
```typescript
// Enable detailed logging
const logger = new Logger(LocalStorageService.name);
logger.debug(`File path: ${filePath}`);
logger.debug(`Full path: ${fullPath}`);
```

## 📈 **Performance Optimization**

### **File Caching**
- **Browser Cache**: Files are cached for 1 hour
- **CDN Ready**: Easy to integrate with CDN services
- **Compression**: Ready for gzip/brotli compression

### **Batch Operations**
```typescript
// Upload multiple files efficiently
const uploadPromises = files.map(file => 
  localStorageService.uploadFile(file, category, subcategory)
);
const results = await Promise.all(uploadPromises);
```

### **Lazy Loading**
```typescript
// Load file metadata only when needed
const fileInfo = await localStorageService.getFileInfo(filePath);
if (fileInfo) {
  // Use file info
}
```

## 🎯 **Best Practices**

### **File Naming**
- Use descriptive names: `pet-profile-photo.jpg`
- Include timestamps: `2024-01-15-pet-photo.jpg`
- Avoid special characters: Use hyphens instead of spaces

### **Organization**
- Group by entity: `pets/{petId}/photos/`
- Use subcategories: `clinics/{clinicId}/logos/`
- Keep temp files separate: `temp/{sessionId}/`

### **Security**
- Validate file types on both client and server
- Set appropriate file size limits
- Use authentication for sensitive operations
- Implement rate limiting for uploads

---

## 🎉 **Summary**

Your local file storage system provides:

✅ **Complete file management** - Upload, download, delete, copy  
✅ **Rich metadata** - File information, tags, descriptions  
✅ **Security** - JWT authentication and file validation  
✅ **Performance** - Efficient storage and caching  
✅ **Scalability** - Easy migration to cloud storage  
✅ **Zero cost** - No external service fees  

**Ready to use immediately for development and testing!** 🚀
