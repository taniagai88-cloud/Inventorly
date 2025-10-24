# Inventorly - Inventory Management App

**Track. Tag. Simplify your inventory.**

A modern, full-featured inventory management application built with React, TypeScript, and a custom design system.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see your app.

### Build for Production
```bash
npm run build
npm run preview
```

## 📦 What's Included

- ✅ **Phone-based authentication** with SMS verification
- ✅ **Dashboard** with KPI cards and active projects
- ✅ **Inventory management** with quantity tracking
- ✅ **Item detail pages** with usage history
- ✅ **Bulk upload** capabilities
- ✅ **Reports & insights** with charts
- ✅ **Project management** for staging assignments
- ✅ **Custom design system** with full CSS variable control

## 🎨 Design System

The app uses a custom design system defined in `/styles/globals.css`:

- **Colors**: Primary, secondary, accent, muted, and more
- **Typography**: Inter font with defined sizes and weights
- **Border Radius**: Consistent rounding with `--radius` variables
- **Spacing**: Tailwind-based spacing system
- **Components**: Custom UI library in `/components/ui-custom/`

### Customizing the Design
Simply update CSS variables in `/styles/globals.css`:

```css
:root {
  --primary: rgba(35, 136, 255, 1);      /* Change primary color */
  --radius: 8px;                          /* Change border radius */
  --text-base: 14px;                      /* Change base font size */
}
```

All components will automatically update!

## 📁 Project Structure

```
├── App.tsx                    # Main app component
├── components/
│   ├── Dashboard.tsx          # Main dashboard
│   ├── InventoryLibrary.tsx   # Inventory listing
│   ├── AddItem.tsx            # Add new items
│   ├── ItemDetail.tsx         # Item detail view
│   ├── ReportsInsights.tsx    # Analytics & reports
│   ├── AssignToJob.tsx        # Assign items to projects
│   ├── BulkUpload.tsx         # Bulk CSV upload
│   ├── AppHeader.tsx          # App navigation header
│   └── ui-custom/             # Custom UI components
├── styles/
│   └── globals.css            # Design system variables
└── DEPLOYMENT_GUIDE.md        # How to deploy
```

## 🚀 Deployment

**Ready to go live?**

👉 **[START HERE - Complete Deployment Guide](/START_HERE.md)**

### Quick Deploy (Vercel CLI)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Go to production
vercel --prod
```

**Your app will be live in 5 minutes!**

### 📚 Deployment Guides
- **[START_HERE.md](/START_HERE.md)** - Overview & guide index
- **[DEPLOY_NOW.md](/DEPLOY_NOW.md)** - Quick visual guide (start here!)
- **[VERCEL_STEP_BY_STEP.md](/VERCEL_STEP_BY_STEP.md)** - Detailed instructions
- **[DEPLOYMENT_CHECKLIST.md](/DEPLOYMENT_CHECKLIST.md)** - Printable checklist
- **[TROUBLESHOOTING.md](/TROUBLESHOOTING.md)** - Common issues & fixes

## 🔧 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Motion** (Framer Motion) - Animations
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **Vite** - Build tool

## 📖 Documentation

- [Deployment Guide](/DEPLOYMENT_GUIDE.md) - How to get your app live
- [Migration Summary](/MIGRATION_SUMMARY.md) - UI library migration details
- [Component Library](/components/ui-custom/README.md) - Custom components documentation

## 🎯 Key Features

### Authentication
- Phone number verification with OTP
- Google/Email authentication option
- Secure sign-in/sign-up flow

### Inventory Management
- Add items individually or bulk upload via CSV
- Track quantities and availability
- Low stock warnings
- Out of stock indicators
- AI-powered tagging (simulated)

### Dashboard
- KPI cards (Total Items, Items in Use, ROI, Utilization)
- Active projects with timelines
- Most-used items carousel
- Quick actions

### Projects
- Create staging projects
- Assign inventory to projects
- Track contract dates
- Project status management

### Reports & Insights
- Category-based analytics
- Usage trends over time
- Item utilization rates
- ROI tracking

## 🔐 Security Notes

This is a **frontend-only application** designed for prototyping and demos. For production use:

- Implement proper backend authentication
- Use environment variables for API keys
- Add server-side validation
- Implement rate limiting
- Use HTTPS (automatic with Vercel/Netlify)

## 📝 License

Built for Inventorly. All rights reserved.

## 🤝 Contributing

This is a production application. For bugs or feature requests, please contact the development team.

---

**Ready to deploy?** Check out the [Deployment Guide](/DEPLOYMENT_GUIDE.md)!
