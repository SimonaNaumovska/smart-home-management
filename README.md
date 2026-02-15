# 🏠 Smart Household Operating System

**The complete household management system with multi-device sync, AI suggestions, and enterprise-grade backend!**

---

## ✨ ALL Features Included

### 🔐 **Authentication & Multi-Device Sync**

- **Household accounts** with email/password
- **Real-time synchronization** across ALL devices (phones, tablets, computers)
- **Offline support** - works without internet, syncs when reconnected
- **Cloud backup** - never lose your data

### 📦 **Inventory Management**

- **Food & Beverage** with expiration tracking
- **Cleaning & Supplies** management
- **11 fields per item**: Name, Category, Quantity, Unit, Min Stock, Purchased Date, Use By, Storage Location, To Buy?, Frequently Used?
- **Dashboard view** with filtering, sorting, and inline editing
- **Stock level indicators**: None/Low/Medium/High
- **Expiration warnings**: Red for expired, yellow for expiring soon

### 📱 **Smart Scanning Features**

- **📸 Receipt Scanner** - Scan grocery receipts with your phone camera
  - Automatic item extraction with OCR (Tesseract.js)
  - Supports Macedonian Cyrillic text
  - Smart parsing: Item name + quantity + price
  - Bulk add to inventory in seconds
- **📷 Barcode Scanner** - Scan product barcodes for instant lookup
  - Camera-based scanning with html5-qrcode
  - OpenFoodFacts database integration (global product info)
  - Auto-fills: Product name, brand, quantity, unit
  - Supports all barcode formats (EAN, UPC, etc.)
  - Editable before adding to inventory

### 🍽️ **Consumption Logging**

- **Track who uses what** - log consumption by household member
- **Auto-deduct** from inventory
- **Usage history** with timestamps
- **User activity stats** (last 7 days)

### 🧹 **Chores Management**

- **14-column dashboard** like a spreadsheet
- **Auto-calculate next due dates** based on frequency
- **Status tracking**: OVERDUE, DUE TODAY, DUE TOMORROW, OK
- **Product consumption** tracking per chore
- **Priority levels**: High, Normal, Low
- **Room organization**: Kitchen, Bathroom, Bedroom, Living Room, etc.

### 📊 **Analytics Dashboard**

- **Low stock alerts**
- **Out of stock warnings**
- **Expiring items** notifications
- **User activity** summaries
- **Recent activity feed** with all logs

### 🤖 **AI Smart Layer**

- **5 suggestion types** with priority system:
  - Data corrections (high priority)
  - Shopping list generation (medium)
  - Meal suggestions based on available ingredients (low)
  - Consumption pattern detection (medium)
  - Waste reduction alerts (high)
- **Intelligent meal planning** from 6 meal patterns
- **Over-consumption detection**
- **High usage warnings**

### 👥 **Multi-User Support**

- **Color-coded user profiles** (10 avatars, 6 colors)
- **Active user indicator** always visible
- **Per-user activity tracking**
- **Shared household management**

### 💾 **Data Backup & Export**

- **Automatic cloud backup** (if Firebase configured)
- **Export to JSON** for local backups
- **Import from JSON** for data migration
- **localStorage fallback** if no Firebase

---

## 🚀 Quick Start

### Option 1: Local Mode (No Setup Required)

```bash
npm install
npm run dev
```

Open browser → App works with localStorage!

### Option 2: Cloud Sync Mode (5-Minute Setup)

1. **Follow FIREBASE_SETUP.md** (comprehensive guide included)
2. Create Firebase project (free tier)
3. Update `src/firebase/config.ts` with credentials
4. Restart app → Cloud sync enabled!

---

## 📁 Project Structure

```
src/
├── App.tsx                          # Main app component
├── AppWithFirebase.tsx              # Firebase wrapper
├── main.tsx                         # Entry point
│
├── components/
│   ├── FoodForm.tsx                 # Food item form (green theme)
│   ├── CleaningForm.tsx             # Cleaning item form (blue theme)
│   ├── ProductList.tsx              # Simple product list view
│   ├── InventoryDashboard.tsx       # Advanced dashboard with filters
│   ├── ReceiptScanner.tsx           # Receipt OCR scanning (Tesseract.js)
│   ├── BarcodeScanner.tsx           # Barcode scanning (html5-qrcode)
│   ├── UserManagement.tsx           # Household member management
│   ├── ChoresDashboard.tsx          # 14-column chore management
│   ├── ChoreSystem.tsx              # Original chore component
│   ├── ConsumptionLogger.tsx        # Food consumption logging
│   ├── AnalyticsDashboard.tsx       # Alerts and user stats
│   ├── AISuggestions.tsx            # AI-powered suggestions
│   ├── AuthScreen.tsx               # Sign up/sign in screen
│   ├── OfflineIndicator.tsx         # Offline mode banner
│   └── DataBackup.tsx               # Export/import functionality
│
├── firebase/
│   ├── config.ts                    # Firebase configuration
│   ├── auth.ts                      # Authentication functions
│   └── database.ts                  # Firestore CRUD operations
│
└── types/
    └── Product.ts                   # TypeScript interfaces
```

---

## 🎯 How It Works

### **Local Mode (Default)**

- Data saved in **browser localStorage**
- Works offline always
- No setup required
- Single-device only

### **Cloud Mode (Firebase)**

1. User creates household account
2. Signs in → All data syncs to Firestore
3. Real-time listeners update ALL devices
4. Offline support with sync queue
5. Auto-backup every change

---

## 🔄 Data Flow

```
User Action
    ↓
React State Update (immediate UI update)
    ↓
localStorage Save (backup)
    ↓
Firebase Sync (if configured)
    ↓
Real-time Listener → Update Other Devices
```

---

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Firebase** (Auth + Firestore)
- **localStorage** (fallback/offline)
- **Tesseract.js** - Receipt OCR scanning (Macedonian + English)
- **html5-qrcode** - Barcode scanning from camera
- **OpenFoodFacts API** - Global product database
- **Flexbox** layouts
- **No external UI library** (pure CSS)

---

## 📊 Navigation Tabs

1. **📦 Inventory** - Food & cleaning items management
2. **🍽️ Consumption** - Log food usage
3. **🧹 Chores** - Task management dashboard
4. **📊 Analytics** - Alerts and user activity
5. **🤖 AI Smart** - Intelligent suggestions
6. **👥 Members** - Household user management
7. **⚙️ Settings** - Backup, export, Firebase status

---

## 💾 Data Persistence

### localStorage (Always Active)

- Products → `products` key
- Users → `users` key
- Chores → `chores` key
- Consumption Logs → `consumptionLogs` key
- Active User → `activeUser` key

### Firestore Structure (When Firebase Configured)

```
households/{householdId}/
  ├── products/{productId}
  ├── users/{userId}
  ├── chores/{choreId}
  ├── consumptionLogs/{logId}
  └── activeUsers/{deviceId}
```

---

## 🎨 Color Themes

- **Inventory**: Green `#4CAF50`
- **Consumption**: Purple `#9C27B0`
- **Chores**: Orange `#FF9800`
- **Analytics**: Cyan `#00BCD4`
- **AI**: Pink `#E91E63`
- **Members**: Deep Purple `#673AB7`
- **Settings**: Blue Grey `#607D8B`

---

## 🔐 Security

### Firebase Security Rules (Implemented)

- Only authenticated users access data
- Users can only access their household
- All sub-collections protected
- No public read/write access

### localStorage

- Stored only in your browser
- Cleared when browser cache cleared
- Not accessible to other websites

---

## 📱 Multi-Device Usage

### Same Household, Multiple Devices:

1. Sign in with **same email/password** on all devices
2. Each device syncs instantly
3. Each person selects their profile in "Members" tab
4. System tracks who does what

### Example Family Setup:

- **Mom's Phone**: Signs in as `smithfamily@email.com`
- **Dad's Tablet**: Signs in as `smithfamily@email.com`
- **Kitchen Computer**: Signs in as `smithfamily@email.com`
- All 3 devices show same data, sync in real-time!

---

## 🚀 Deployment Options

### 1. **Firebase Hosting** (Recommended)

```bash
npm run build
firebase deploy
```

Free hosting with your Firebase project!

### 2. **Vercel**

```bash
npm run build
vercel deploy
```

### 3. **Netlify**

Drag and drop `dist` folder after build

---

## 📚 Documentation Files

- **README.md** (this file) - Complete overview
- **FIREBASE_SETUP.md** - Step-by-step Firebase guide
- **package.json** - Dependencies and scripts

---

## 💡 Tips & Tricks

### 1. **Start Local, Upgrade Later**

- Use app with localStorage first
- Set up Firebase when ready for multi-device

### 2. **Export Backups Regularly**

- Go to Settings → Export Backup
- Save JSON file to computer
- Import on new device if needed

### 3. **Active User Selection**

- Always select your profile in Members tab
- System tracks consumption/chores by user
- Makes analytics meaningful

### 4. **Stock Level Management**

- Set realistic "Min Stock" levels
- Get alerts when items run low
- Use "To Buy" toggle for shopping list

### 5. **Chore Frequency**

- Daily = 1 day
- Weekly = 7 days
- Monthly = 30 days
- System auto-calculates next due date

---

## 🎯 Use Cases

### **Family Household**

- Track shared groceries
- Assign chores to kids
- See who ate what
- Get shopping lists

### **Roommates**

- Split household tasks
- Track shared supplies
- Fair consumption monitoring
- Prevent arguments!

### **Solo Living**

- Track food expiration
- Never forget chores
- Optimize shopping
- Reduce waste

---

## 🔧 Configuration

### Firebase Config Location:

`src/firebase/config.ts`

### Required Firebase Products:

- ✅ Authentication (Email/Password)
- ✅ Firestore Database
- ❌ Storage (not needed)
- ❌ Functions (not needed)
- ❌ Hosting (optional)

---

## 📈 Scalability

### Current Limits (Firebase Free Tier):

- **Users**: Unlimited households
- **Data**: 1GB storage
- **Reads**: 50,000/day
- **Writes**: 20,000/day

**Perfect for household use!** Even large families won't hit limits.

---

## 🎓 Learning Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎉 You're All Set!

**You now have:**
✅ Complete household management system
✅ Multi-device real-time sync
✅ AI-powered suggestions
✅ Cloud backup
✅ Offline support
✅ Enterprise-grade authentication
✅ 7 major feature modules
✅ 17 React components
✅ Complete Firebase integration
✅ localStorage fallback
✅ Production-ready code

**Start managing your household like a pro! 🚀**

---

## 🆘 Support

### App not loading?

- Check browser console for errors
- Clear browser cache
- Verify Firebase config if using cloud mode

### Data not syncing?

- Check internet connection
- See offline indicator at top
- Verify Firebase rules are set correctly

### Firebase errors?

- Re-check FIREBASE_SETUP.md steps
- Verify API key in config.ts
- Check Firebase Console for issues

---

**Built with ❤️ for smart households everywhere!**
