# Fresh Fit Admin

A comprehensive admin dashboard for managing the Fresh Fit fitness and wellness platform. Built with React and Vite for optimal performance and developer experience.

## Overview

Fresh Fit Admin is a powerful web application that enables administrators to manage all aspects of the Fresh Fit platform, including user fitness programs, nutrition plans, community challenges, and platform analytics.

## Features

### 📊 Dashboard

- Overview of user activity and engagement

### 💪 Exercise Management

- Create, edit, and organize workout routines
- Manage exercise libraries and exercise set
- Set difficulty levels and equipment requirements
- Upload instructional videos and images

### 🍎 Meal Management

- Design and manage nutrition plans
- Create meal recipes with nutritional information
- Organize meals by categories and dietary preferences
- Manage ingredient databases

### 🏆 Challenge Management

- Create and monitor fitness challenges
- Set challenge parameters and rewards

### 👨‍⚕️ Specialist Management

- Manage fitness trainers and nutritionist profiles
- Track specialist performance and user ratings

### 📈 Statistics & Analytics

- Comprehensive platform usage analytics
- User engagement and retention metrics
- Exercise and meal popularity tracking

### 📋 Reports

- Get user detail reports

### 🏘️ Community Management

- Monitor user interactions and content
- Moderate community posts

### ⚙️ Settings

- Platform configuration management
- System preferences and customization
- API and integration management

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Package Manager**: Yarn
- **Language**: TypeScript

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 16.0 or higher)
- Yarn (version 1.22 or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/DNM03/fresh-fit-admin.git
cd fresh-fit-admin
```

2. Install dependencies using Yarn:

```bash
yarn install
```

3. Create a `.env` file in the root directory and configure your environment variables:

```env
VITE_API_URL=your_api_base_url
VITE_MEDIA_API_URL=example_media_api_url
VITE_MEDIA_BACKUP_URL=example_backup_url
VITE_API_PRODUCTION_URL=example_production_api_url
VITE_SERPER_API_KEY=example_key
VITE_FOOD_SEARCH_OAUTH_KEY=example_key
VITE_FOOD_SEARCH_OAUTH_SECRET=example_secret
```

## Development

To start the development server:

```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## Build

To build the application for production:

```bash
yarn build
```

The built files will be generated in the `dist` directory.

## Preview Production Build

To preview the production build locally:

```bash
yarn preview
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors automatically
- `yarn type-check` - Run TypeScript type checking

## Project Structure

```
fresh-fit-admin/
├── public/                 # Static assets
├── src/
│   ├── assets
│   ├── components/        # Reusable UI components
│   ├── constants
│   ├── features
│   ├── hooks
│   ├── lib
│   ├── pages/            # Application pages
│   │   ├── challenges/
│   │   ├── community/
│   │   ├── dashboard/
│   │   ├── exercises/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── meals/
│   │   ├── report/
│   │   ├── settings/
│   │   ├── specialist
│   │   └── statistics
│   ├── router/            # Custom React hooks
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application component
├── package.json
├── vite.config.ts
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Development Guidelines

- Follow React best practices and hooks patterns
- Use TypeScript for type safety
- Write clean, self-documenting code
- Ensure responsive design for all components
- Test thoroughly before submitting pull requests

## Support

For support and questions about the Fresh Fit Admin application, please contact the development team or create an issue in the repository.

## License

This project is proprietary software for Fresh Fit platform administration.

---

**Fresh Fit Admin** - Empowering administrators to create exceptional fitness experiences.
