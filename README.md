# 💸 RupeeWise — Daily Transaction Tracker & Expense Management App

**RupeeWise** is a modern, responsive, mobile-first Daily Transaction Tracker and Personal Finance Management system built with **React 19, TypeScript, Tailwind CSS, Lucide Icons, and Recharts**. It is crafted to deliver a polished personal finance experience for daily financial operations across **Cash, UPI / Online, Debit Card, Credit Card, and Bank Transfers**.

---

## ✨ Features Overview

### 1. 📊 Real-Time Financial Dashboard
- **8 Core Financial Snapshots**:
  - **Today's Expense**: Real-time daily outflow with day-over-day tracking
  - **Today's Income**: Real-time daily inflows
  - **Today's Balance**: Net cash flow for the current day
  - **Cash in Hand Balance**: Physical cash wallet accounting (Cash in minus Cash out)
  - **This Month Expense**: Total calendar month expenditure
  - **This Month Income**: Total calendar month earnings
  - **Online / UPI Spending**: Monthly total & percentage of expenses paid via UPI
  - **Card Spending**: Aggregate Debit Card & Credit Card spends
- **1-Tap Quick Log**: Instant micro-expense shortcuts (☕ Chai ₹40, 🛺 Auto ₹120, 🍲 Lunch ₹250, 🥦 Groceries ₹350)
- **Visual Financial Analytics**:
  - **Daily Expense Bar Chart**: Interactive 7-day, 14-day, and 30-day spending trends with custom tooltips and average daily run-rate
  - **Category-wise Donut Chart**: Proportional distribution with center total and interactive legends
  - **Payment Mode Spending Chart**: Visual distribution across UPI, Cash, Cards, and Bank Transfers
  - **Monthly Income vs Expense Trend**: 6-month historical cash flow comparison with net savings
- **Budget Alerts Banner**: Instant warnings when any category exceeds 80% or 100% of its budget

### 2. ⚡ Mobile-First Transaction Logging ("+ Add Transaction")
- High-efficiency modal with keyboard support and auto-focus
- **Transaction Types**: Segmented toggle for **Expense** vs **Income**
- **Numeric Validation**: Strict positive amounts with quick increment denomination chips (+₹50, +₹100, +₹500, +₹1,000, +₹2,000)
- **Payment Methods**: 1-tap badges for **Cash, UPI, Debit Card, Credit Card, Bank Transfer, Other**
- **Categories**: Visual selector with colorful badges and Lucide icons
- **Date & Time**: Defaults to current time with quick "Now" and "Yesterday" shortcuts
- **Optional Metadata**: Merchant / Payee, Description / Note, and Reference ID / UTR number

### 3. 📜 Transaction History, Search & Filtering
- **Multi-Factor Filtering**:
  - Text search (searches across merchant, notes, category, and reference ID)
  - Date period filter (All Time, Today, Yesterday, This Week, This Month, Last Month, This Year, and Custom Date Range)
  - Category filter (dynamically synced with custom categories)
  - Payment method filter (Cash, UPI, Debit Card, Credit Card, Bank Transfer, Other)
  - Type filter (All, Income, Expense)
  - Sorting options (Newest First, Oldest First, Highest Amount, Lowest Amount)
- **Grouped Date Headers**: Transactions organized by relative days ("Today", "Yesterday", "Sat, 03 Oct") with daily subtotals
- **Filtered Summary Bar**: Real-time calculation of filtered income, filtered expense, and filtered net balance
- **Bulk Operations**: Multi-select transactions for batch deletion with confirmation safeguards

### 4. 🧾 Transaction Details & Quick Actions
- Receipt-style detail modal showing full transaction metadata
- **1-Click Duplicate**: Instantly duplicates any previous transaction with today's timestamp for rapid re-entry
- **Edit**: In-place modification of any field with immediate dashboard update
- **Delete**: Double-confirmation dialog modal with destructive styling

### 5. 🎯 Monthly Category Budgets & Warnings
- Category budget manager (Food, Groceries, Fuel, Shopping, Entertainment, etc.)
- Overall monthly budget health indicator and progress bar
- **3-Tier Visual Warning System**:
  - 🟢 **On Track** (< 80% used)
  - 🟡 **Approaching Limit** (80% – 99% used) with amber warning badge
  - 🔴 **Over Budget** (≥ 100% used) with red alert badge showing exact overspent amount

### 6. 🔁 Recurring Transactions & Automation
- Setup recurring rules for monthly Rent, Netflix/Prime subscriptions, Salaries, Broadband, EMIs
- Supported frequencies: **Daily, Weekly, Monthly, Yearly**
- Automated next due date calculation
- **1-Click "Process Due"**: Converts due recurring schedules into recorded transactions and automatically advances next due date
- Active / Paused state toggle

### 7. 📑 Financial Statements & Reports (CSV & PDF)
- Period selectors: Today, This Week, This Month, Last Month, This Year, Custom Date Range
- **KPI Metrics**: Total Income, Total Expenses, Net Savings, Savings Rate %, Top Spending Category, Largest Single Expense
- **Payment Method Audit Breakdown**: Exact spending through UPI, Cash, Cards, and Net Banking
- **Export CSV**: Complete spreadsheet export with clean columns
- **Export PDF Report**: Branded statement with summary header, KPI cards, itemized transaction table, and pagination via `jspdf` & `jspdf-autotable`
- **Print View**: Clean `@media print` layout without navigation chrome

### 8. ⚙️ Settings, Custom Categories & Data Persistence
- **Default Currency**: ₹ INR with selector for $, €, £, AED, SGD with localized formatting
- **Theme Modes**: Reactive Dark Mode & Light Mode
- **Audio Feedback**: Subtle Web Audio API chimes for transaction logging and deletions
- **Budget Threshold Control**: Adjustable warning slider (50% – 95%)
- **Category Manager**: Create custom categories with custom Lucide icons and vibrant color palettes
- **Data Backup & Restore**: Full JSON export and import for seamless device transfer or cloud backup
- **Sample Data**: 1-click restore to realistic sample dataset

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + `@tailwindcss/vite`
- **Styling**: Tailwind CSS v4 (Mobile-first responsive design, dark mode, custom scrollbars)
- **Charts**: Recharts (ResponsiveContainer, BarChart, PieChart, Donut, Tooltips)
- **Icons**: Lucide React
- **Export Engine**: `jspdf` & `jspdf-autotable`
- **Storage**: Browser LocalStorage with automatic schema serialization and sample data seeding
- **Linter**: Oxlint
=======
# galaxy-finance
A secure mobile personal finance app for tracking bank, cash, and online transactions, managing budgets, viewing financial insights, and organizing personal finances with a modern 3D galaxy-inspired UI.
# 🌌 Galaxy Finance

A modern mobile personal finance management application designed to help users track their **bank accounts, cash, income, expenses, budgets, and financial activity** in one place.

Galaxy Finance combines a clean mobile experience with a **3D galaxy-inspired interface**, financial analytics, secure authentication, and an AI-powered assistant.

> **Project Status:** 🚧 Active Development

---

## ✨ Features

### 💰 Finance Management

* Add and manage multiple bank accounts
* Track cash balance
* Add income and expenses
* Categorize transactions
* Add transaction descriptions and notes
* View total available balance
* Track monthly financial activity
* Transfer money between own accounts

### 📅 Transaction Calendar

* View transactions by date
* Daily income and expense summary
* Monthly transaction overview
* Quickly access transaction details

### 📊 Financial Dashboard

* Total available money
* Total income
* Total expenses
* Bank balances
* Cash balance
* Monthly spending overview
* Financial statistics and insights

### 📈 Reports & Analytics

* Income vs. expense analysis
* Category-wise spending
* Monthly financial trends
* Transaction history
* Budget tracking

### 🤖 AI Finance Assistant

* Ask questions about your financial activity
* Get spending insights
* Understand monthly expenses
* Search and manage financial data using natural language

The AI assistant is designed with permission-based access and should not perform destructive financial actions without user confirmation.

### 🔐 Authentication & Security

* User registration
* Login
* Email verification
* Phone verification
* OTP-based password recovery
* Secure authentication
* Secure local token storage
* Optional biometric authentication
* User-specific data isolation

### 🔔 Notifications

* Transaction notifications
* Budget alerts
* Financial reminders
* Push notification support

> Remote push notifications require an **Expo Development Build / production build** on Android and should not be assumed to work through Expo Go.

### 📱 Mobile Experience

* Android support
* iOS support
* Mobile-first UI
* Dark Mode
* Light Mode
* Galaxy Mode
* System theme support
* Responsive layouts
* Smooth animations
* 3D galaxy-inspired visual design

### 📡 Offline Support

* Local transaction access
* Offline transaction queue
* Automatic synchronization when connectivity returns
* Conflict-aware data synchronization

---

## 🛠️ Tech Stack

### Mobile Application

* React Native
* Expo
* Expo Router
* TypeScript
* React Native Reanimated
* Expo Secure Store
* Expo Notifications
* Expo Local Authentication

### Backend

* Node.js
* Express.js
* REST API
* Authentication APIs
* Database integration

### Database

The final database implementation may use:

* PostgreSQL
* MongoDB

depending on the backend configuration.

### AI

* AI-powered financial assistant
* Natural-language financial queries
* Controlled access to user financial data
* Confirmation required for sensitive/destructive operations

---

## 🏗️ Project Architecture

```text
Galaxy Finance
│
├── Mobile App
│   ├── Authentication
│   ├── Dashboard
│   ├── Banks
│   ├── Cash
│   ├── Transactions
│   ├── Calendar
│   ├── Budgets
│   ├── Reports
│   ├── AI Assistant
│   └── Settings
│
├── Backend API
│   ├── Authentication
│   ├── Users
│   ├── Banks
│   ├── Transactions
│   ├── Budgets
│   ├── Reports
│   └── AI
│
└── Database
    ├── Users
    ├── Accounts
    ├── Transactions
    ├── Categories
    └── Budgets
```

---

## 💵 Financial Calculation Rules

Galaxy Finance follows consistent accounting rules.

### Bank Balance

```text
Bank Balance =
Opening Balance
+ Income
- Expenses
+ Adjustments
```

### Cash Balance

```text
Cash Balance =
Opening Cash
+ Cash Income
- Cash Expenses
+ Adjustments
```

### Total Available Money

```text
Total Available =
Bank Balances
+ Cash
+ Other Available Accounts
```

### Net Change

```text
Net Change =
Total Income - Total Expenses
```

Transfers between the user's own accounts should **not** be counted as income or expenses.

---

## 🔒 Security Rules

Galaxy Finance should never store sensitive banking credentials such as:

* UPI PIN
* ATM PIN
* CVV
* Internet banking password
* Card PIN

Sensitive authentication data must be handled using secure authentication mechanisms.

The application should also implement:

* Input validation
* API authorization
* User data isolation
* Secure token handling
* Rate limiting
* Protected API endpoints
* Secure local storage
* Error handling without exposing sensitive information
>>>>>>> 65ed9759e68191fb8c19778fb407feae323e3cdb

---

## 🚀 Getting Started

<<<<<<< HEAD
### Prerequisites
- Node.js (v18 or newer recommended, tested on Node v24)
- npm (v9 or newer)

### Installation
```bash
# Clone the repository / navigate to project directory
cd "c:/Users/priya/Full-stack/Project/5. Daily transaction app"

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
=======
### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/galaxy-finance.git
```

```bash
cd galaxy-finance
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npx expo start
>>>>>>> 65ed9759e68191fb8c19778fb407feae323e3cdb
```

---

<<<<<<< HEAD
## 🧪 Verification & Test Suite

Run the automated verification suite testing calculations, budget logic, payment method filters, recurring schedules, and export serialization:

```bash
node scripts/verify-app.js
```

Output:
```
🧪 Starting RupeeWise Comprehensive Verification Test Suite...

✅ Formatter Tests Passed
✅ Income, Expense, and Net Balance Verified: In=+₹89500, Out=-₹24909, Net=+₹64591
✅ Payment Method Spending Classification Passed (UPI, Cash, Cards, Bank Transfer)
✅ Cash Wallet Balance Logic Passed
✅ Budget Warning Threshold Logic (Normal, Approaching 80%, Exceeded 100%) Passed
✅ CSV Export Generation Logic Passed
✅ Recurring Transaction Next Due Date Calculation Passed
✅ Data Backup & Restore JSON Serialization Passed

🎉 ALL 8 CORE FINANCIAL VERIFICATION TESTS PASSED SUCCESSFULLY!
=======
## 📱 Running on Android

For basic UI development:

```bash
npx expo start
```

For native functionality such as remote push notifications, use an **Expo Development Build** instead of relying on Expo Go.

Install the development client:

```bash
npx expo install expo-dev-client
```

Then:

```bash
npx expo run:android
>>>>>>> 65ed9759e68191fb8c19778fb407feae323e3cdb
```

---

<<<<<<< HEAD
## 📱 Mobile Experience

On mobile screens, RupeeWise features a bottom navigation bar:
- **Dashboard**: Quick metrics, 1-tap log, recent transactions, and charts
- **Transactions**: Full searchable list with filters and date groupings
- **+ Add**: Large, centered floating action button for 5-second transaction logging
- **Budgets**: Category budget progress and alerts
- **Reports**: Date-filtered statements and PDF/CSV downloads
- **Settings**: Backup, restore, currency, theme, and custom categories
=======
## 🔔 Push Notifications

Android remote push notification functionality is not fully supported through Expo Go for newer Expo SDK versions.

Therefore, Galaxy Finance should use:

```text
React Native
      ↓
Expo
      ↓
Expo Development Build
      ↓
expo-notifications
      ↓
Android / iOS
```

Expo Go should gracefully disable unsupported remote notification functionality instead of causing the application to crash.

---

## ⚙️ Environment Variables

Create a `.env` file for local development.

Example:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_API_VERSION=v1
```

Backend environment variables should be stored separately and must **never be committed to GitHub**.

Add sensitive files to `.gitignore`:

```gitignore
.env
.env.local
.env.production
node_modules/
.expo/
dist/
build/
```

---

## 🧪 Testing

Before releasing a build, test the complete flow:

```text
Install App
   ↓
Register
   ↓
Email / Phone Verification
   ↓
Login
   ↓
Add Bank
   ↓
Add Cash
   ↓
Add Income
   ↓
Add Expense
   ↓
Check Balance
   ↓
Check Calendar
   ↓
Check Reports
   ↓
Test AI Assistant
   ↓
Logout
   ↓
Login Again
   ↓
Verify Data Persistence
   ↓
Test Offline Mode
   ↓
Reconnect
   ↓
Verify Synchronization
```

---

## 🗺️ Roadmap

### Phase 1 — Core App

* [x] Project setup
* [ ] Authentication
* [ ] Dashboard
* [ ] Bank management
* [ ] Cash management
* [ ] Transaction management

### Phase 2 — Finance Tools

* [ ] Calendar
* [ ] Categories
* [ ] Budgets
* [ ] Reports
* [ ] Financial analytics

### Phase 3 — Smart Features

* [ ] AI finance assistant
* [ ] Smart spending insights
* [ ] Budget alerts
* [ ] Financial reminders
* [ ] Advanced analytics

### Phase 4 — Production

* [ ] Offline synchronization
* [ ] Push notifications
* [ ] Biometric authentication
* [ ] Performance optimization
* [ ] Security audit
* [ ] Production Android build
* [ ] Production iOS build
* [ ] App Store / Play Store release

---

## 🎨 Design Philosophy

Galaxy Finance uses a **space/galaxy-inspired visual system** while keeping financial information easy to understand.

The interface focuses on:

* Clear financial numbers
* Minimal navigation
* Smooth animations
* Visual hierarchy
* Dark-space aesthetics
* Accessible typography
* Fast interaction
* Mobile-first design

Visual effects should never compromise financial readability or application performance.

---

## ⚠️ Important Disclaimer

Galaxy Finance is a personal finance management software project.

The application does not provide professional financial, investment, tax, banking, or legal advice.

Users should verify important financial information with their bank or qualified financial professional.

---

## 👨‍💻 Development

This project is currently under active development.

Contributions, bug reports, feature suggestions, and improvements are welcome.

### Suggested contribution workflow

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, then:

```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

---

## 📄 License

This project is currently intended for educational and development purposes.

A formal open-source license can be added before public distribution.

---

## 🌌 Galaxy Finance

**Track your money. Understand your spending. Control your future.**
>>>>>>> 65ed9759e68191fb8c19778fb407feae323e3cdb
