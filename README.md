# NihongoTracker

A comprehensive Japanese immersion tracking application that gamifies your language learning journey. Track your progress across various media types, compete with friends, and visualize your improvement over time.

## Features

### 📊 Immersion Tracking

- **Multiple Media Types**: Track anime, manga, visual novels, reading materials, videos, and audio content
- **Detailed Logging**: Record episodes watched, pages read, character counts, and time spent
- **Media Integration**: Search and assign specific media from AniList, VNDB, and other sources
- **Auto-categorization**: Smart grouping of similar logs for easy media assignment

### 🎮 Gamification

- **XP & Leveling System**: Separate progression for reading and listening skills
- **Streak Tracking**: Maintain daily immersion streaks with visual feedback
- **Leaderboards**: Compete with friends and the community
- **Achievement System**: Unlock titles and track milestones

### 📈 Statistics & Analytics

- **Comprehensive Stats**: Reading speed (characters/hour), total immersion time, progress trends
- **Visual Charts**: Interactive graphs showing your improvement over time
- **Monthly Comparisons**: Track progress month-over-month with percentage changes
- **Media Breakdown**: Detailed analysis by content type

### 🔗 Platform Integration

- **AniList Sync**: Import and sync anime/manga progress
- **VNDB Integration**: Track visual novel progress
- **YouTube Support**: Log Japanese YouTube content consumption

### 👥 Social Features

- **Public Profiles**: Share your progress with the community
- **Friend System**: Follow other learners' progress
- **Privacy Controls**: Make logs private or public as desired
- **Media Matcher**: Collaborative tool to assign media to logs

## Technology Stack

### Frontend

- **React 18** with TypeScript
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** + **DaisyUI** for styling
- **Zustand** for state management
- **Chart.js** for data visualization
- **Vite** for build tooling

### Backend

- **Node.js** with **Express**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcrypt** for password hashing
- **GraphQL** for external API integration
- **Firebase** for file storage

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Firebase account (for file storage)
- API keys for AniList, VNDB, YouTube (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ElaxDev/NihongoTracker.git
   cd NihongoTracker
   ```

2. **Backend Setup**

   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Environment Variables**

   Backend `.env`:

   ```env
   PORT=5000
   TOKEN_SECRET=your_jwt_secret
   DATABASE_URL=mongodb://localhost:27017/nihongotracker
   FIREBASE_API_KEY=your_firebase_key
   FIREBASE_PROJECT_ID=your_project_id
   YOUTUBE_API_KEY=your_youtube_key
   NODE_ENV=development
   ```

### Usage

1. **Create an Account**: Register with username and password
2. **Start Logging**: Begin tracking your immersion activities
3. **Assign Media**: Use the media matcher to link logs to specific content
4. **View Progress**: Check your stats and progress charts
5. **Join the Community**: Follow other learners and compete on leaderboards

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Logs

- `GET /api/logs` - Get user logs with filtering
- `POST /api/logs` - Create new immersion log
- `DELETE /api/logs/:id` - Delete specific log
- `POST /api/logs/assign` - Assign media to logs

### Media

- `GET /api/search/:type` - Search for media by type
- `GET /api/media/:type/:id` - Get specific media details

### Users

- `GET /api/users/:username` - Get user profile
- `GET /api/users/:username/stats` - Get user statistics
- `GET /api/ranking` - Get community leaderboards

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- ESLint configuration provided
- Use TypeScript for type safety
- Follow existing naming conventions
- Write meaningful commit messages

## Project Structure

NihongoTracker/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── screens/          # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand state management
│   │   ├── api/             # API client functions
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets
├── Backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   └── routes/          # API route definitions
│   └── build/               # Compiled TypeScript
└── README.md

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the Issues page
2. Create a new issue with detailed information
3. Join our Discord community (link in repository)
