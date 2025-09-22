# Palebook - Decentralized Facebook Clone

A modern, decentralized social media platform built with React.js and Express.js.

## Features

### Backend (Express.js)
- JWT-based authentication system
- User registration and login
- Post creation with image uploads
- Friend system (send/accept/reject requests)
- Real-time notifications with Socket.IO
- Privacy settings for posts and profiles
- RESTful API design
- MongoDB integration with Mongoose
- Rate limiting and security middleware

### Frontend (React.js)
- Modern UI with styled-components
- Redux Toolkit for state management
- React Router for navigation
- React Hook Form for form handling
- React Query for data fetching
- Responsive design
- Real-time updates
- Infinite scrolling for posts
- Image upload and preview

## Project Structure

```
palebook/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── friends.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   ├── services/
    │   ├── utils/
    │   ├── App.js
    │   └── index.js
    ├── public/
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/palebook
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user
- GET `/api/auth/verify` - Verify token

### Posts
- POST `/api/posts` - Create a new post
- GET `/api/posts/feed` - Get user feed
- GET `/api/posts/user/:userId` - Get user posts
- POST `/api/posts/:postId/like` - Like/unlike a post
- POST `/api/posts/:postId/comment` - Add comment to post
- DELETE `/api/posts/:postId` - Delete a post

### Friends
- POST `/api/friends/request` - Send friend request
- POST `/api/friends/accept` - Accept friend request
- POST `/api/friends/reject` - Reject friend request
- GET `/api/friends/requests` - Get friend requests
- GET `/api/friends` - Get friends list
- DELETE `/api/friends/:friendId` - Remove friend

### Users
- GET `/api/users/:userId` - Get user profile
- PUT `/api/users/profile` - Update user profile
- GET `/api/users/search/:query` - Search users
- PUT `/api/users/privacy` - Update privacy settings

## Technologies Used

### Backend
- Express.js - Web framework
- MongoDB + Mongoose - Database
- Socket.IO - Real-time communication
- JWT - Authentication
- Bcrypt.js - Password hashing
- Multer - File upload handling
- Express Validator - Input validation
- Express Rate Limit - Rate limiting
- Helmet - Security headers
- CORS - Cross-origin resource sharing
- Morgan - Request logging

### Frontend
- React 18 - UI library
- React Router DOM - Routing
- Redux Toolkit - State management
- React Redux - React-Redux bindings
- Redux Persist - State persistence
- React Query - Data fetching
- Styled Components - CSS-in-JS
- React Hook Form - Form handling
- Axios - HTTP client
- Socket.IO Client - Real-time communication
- Date-fns - Date utilities
- React Infinite Scroll - Infinite scrolling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the GPLV3 License.
