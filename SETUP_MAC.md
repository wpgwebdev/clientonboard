# Running Client Onboarding Portal on Mac

## Prerequisites

Before running this project locally on your Mac, you'll need to install the following:

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (version 18 or higher)
```bash
brew install node
```

### 3. Install PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
```

## Project Setup

### 1. Download Project from Replit

**Option A: Download as ZIP**
1. In your Replit project, click the three dots menu
2. Select "Download as ZIP"
3. Extract the ZIP file to your desired location on Mac

**Option B: Clone via GitHub (if connected)**
1. If your Replit project is connected to GitHub, clone it:
```bash
git clone [your-github-repo-url]
cd [project-folder]
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in your project root:
```bash
touch .env
```

Add the following environment variables to `.env`:
```
# Database Configuration
DATABASE_URL=postgresql://localhost/onboarding_portal

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Development Environment
NODE_ENV=development
PORT=5000
```

### 4. Set Up PostgreSQL Database

Create a new database:
```bash
createdb onboarding_portal
```

If you get permission errors, create a PostgreSQL user first:
```bash
createuser -s $(whoami)
```

### 5. Push Database Schema
```bash
npm run db:push
```

If you encounter any issues, force the push:
```bash
npm run db:push --force
```

## Running the Project

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

## Configuration for Local Development

The project is already configured to work on Mac with the following settings:

- **Host Configuration**: Automatically uses `localhost` when not running on Replit
- **Database**: Uses PostgreSQL with Drizzle ORM
- **Port**: Runs on port 5000 by default
- **File Uploads**: Handles file uploads and AI-generated content locally

## Troubleshooting

### Database Connection Issues
If you can't connect to PostgreSQL:
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if stopped
brew services start postgresql@15

# Check your database exists
psql -l
```

### Port Issues
If port 5000 is already in use:
```bash
# Kill any process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change the port in your .env file
PORT=3000
```

### OpenAI API Issues
- Make sure your OpenAI API key is valid and has sufficient credits
- The AI features (logo generation, content creation) require a valid OpenAI API key
- Without the API key, the basic wizard functionality will still work

### Node.js Version Issues
Make sure you're using Node.js 18 or higher:
```bash
node --version
```

If you need to update:
```bash
brew upgrade node
```

## Features That Work Locally

✅ **Complete Onboarding Wizard** - All 11 steps work locally  
✅ **Database Persistence** - PostgreSQL stores all data locally  
✅ **AI-Powered Features** - Logo generation and content creation (with OpenAI API key)  
✅ **File Uploads** - Image and logo upload functionality  
✅ **PDF Export** - Download creative briefs as PDF files  
✅ **Progressive Saving** - Automatic data saving as users complete steps  
✅ **Contact Information** - Full contact form with database persistence

## Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schema
- `attached_assets/` - Static assets and uploaded files

The project runs as a single application serving both frontend and backend on the same port for simplified local development.