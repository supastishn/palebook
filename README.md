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
- Reactions (like, love, care, haha, wow, sad, angry)
- Comment likes and threaded replies
- Shares with reference to original posts
- Saved posts (bookmarks)
- Block/unblock users and feed filtering
- Cover photos and avatars

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
 - Post composer, profile view, friends management
 - Basic saved posts list
 - Reaction toggles and comment actions

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

### E2E Tests (Playwright)
1. Start backend and frontend locally (defaults: backend on 5000, frontend on 3000)
2. In the `tests/` directory, install and run Playwright tests:
   ```bash
   cd tests
   npm install
   npx playwright install
   npm run test:e2e
   ```
   Set `E2E_BASE_URL` to point to your frontend if different from `http://localhost:3000`.

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
- POST `/api/posts/:postId/comments/:commentId/like` - Like/unlike a comment
- POST `/api/posts/:postId/comments/:commentId/reply` - Reply to a comment
- POST `/api/posts/:postId/comments/:commentId/replies/:replyId/like` - Like/unlike a reply
- DELETE `/api/posts/:postId` - Delete a post
- POST `/api/posts/:postId/react` - React to post with a type
- POST `/api/posts/:postId/share` - Share a post

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
- PUT `/api/users/cover` - Update cover photo
- GET `/api/users/search/:query` - Search users
- PUT `/api/users/privacy` - Update privacy settings
- POST `/api/users/block` - Block a user
- POST `/api/users/unblock` - Unblock a user
- POST `/api/users/saved` - Save/bookmark a post
- DELETE `/api/users/saved/:postId` - Unsave a post
- GET `/api/users/saved` - List saved posts

### Notifications
- GET `/api/notifications` - List notifications with unread count
- POST `/api/notifications/:id/read` - Mark a notification read
- POST `/api/notifications/read-all` - Mark all notifications read

### Pages
- GET `/api/pages` - List pages
- POST `/api/pages` - Create page
- POST `/api/pages/:id/follow` - Follow page
- DELETE `/api/pages/:id/follow` - Unfollow page

### Groups
- GET `/api/groups` - List groups
- POST `/api/groups` - Create group
- POST `/api/groups/:id/join` - Join group
- DELETE `/api/groups/:id/leave` - Leave group

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
