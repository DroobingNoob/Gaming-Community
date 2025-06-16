# Gaming Community - Firebase Setup

## 🔥 Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `gaming-community`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Services
1. **Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose location closest to your users

2. **Authentication**
   - Go to Authentication
   - Click "Get started"
   - Enable Email/Password provider
   - Enable Google provider (optional)

3. **Storage**
   - Go to Storage
   - Click "Get started"
   - Start in production mode

4. **Hosting**
   - Go to Hosting
   - Click "Get started"
   - Follow setup instructions

### 3. Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with name: `gaming-community`
5. Copy the config object

### 4. Update Configuration
Replace the config in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

Also update `.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 5. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 6. Login and Deploy
```bash
# Login to Firebase
firebase login

# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

## 📊 Database Structure

### Games Collection
```
games/
├── {gameId}/
    ├── title: string
    ├── image: string
    ├── originalPrice: number
    ├── salePrice: number
    ├── rentPrice?: number
    ├── platform: string[]
    ├── discount: number
    ├── description: string
    ├── features: string[]
    ├── systemRequirements: string[]
    ├── type: string[]
    ├── category: 'game' | 'subscription'
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

### Testimonials Collection
```
testimonials/
├── {testimonialId}/
    ├── name: string
    ├── time: string
    ├── message: string
    ├── reply: string
    ├── avatar: string
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

## 🔐 Security Rules

The project includes:
- **Firestore Rules**: Allow public read, authenticated write
- **Storage Rules**: Allow public read, authenticated write
- **Indexes**: Optimized queries for games and testimonials

## 🚀 Features

- ✅ **Dynamic Data Loading**: All content loaded from Firebase
- ✅ **Admin Panel**: Full CRUD operations
- ✅ **Image Upload**: Firebase Storage integration
- ✅ **Real-time Updates**: Automatic data refresh
- ✅ **Responsive Design**: Works on all devices
- ✅ **Loading States**: Better user experience
- ✅ **Error Handling**: Graceful error management

## 📱 Admin Features

1. **Testimonials Management**
   - Add/Edit/Delete testimonials
   - Upload customer avatars
   - Real-time preview

2. **Games Management**
   - Add/Edit/Delete games
   - Platform selection (PS4/PS5)
   - Type selection (Permanent/Rent)
   - Image upload with Firebase Storage

3. **Subscriptions Management**
   - Add/Edit/Delete subscriptions
   - Multiple platform support
   - Pricing management

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

## 💰 Cost Optimization

Firebase free tier includes:
- **Firestore**: 50K reads, 20K writes per day
- **Storage**: 5GB storage, 1GB downloads per day
- **Hosting**: 10GB storage, 360MB/day transfer

Perfect for 75 daily users! 🎯