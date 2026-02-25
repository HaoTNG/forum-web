# Mini Blog API

A modern backend API for a community-driven forum/blog platform built with Node.js, TypeScript, Express, and MongoDB.

## 📋 Project Description

Mini Blog API is a RESTful backend service that powers a forum application where users can create posts, comment on posts, and interact through likes/dislikes. The platform supports multiple topics, user authentication, and role-based access control.

## ✨ Key Features

- **User Authentication**: Register, login, logout with JWT tokens and refresh token mechanism
- **Post Management**: Create, read, update, and delete posts with rich content
- **Topic-based Organization**: 100+ predefined topics for categorizing posts
- **Image Support**: Upload multiple images per post (up to 5 images)
- **Commenting System**: Nested comments with parent-child relationships
- **Engagement Features**: Like and dislike posts
- **Search Functionality**: Full-text search across posts by title, content, and topic
- **User Roles**: Support for user, moderator, and admin roles
- **Analytics**: Get popular posts, latest posts, statistics, and topic-based stats
- **File Upload**: Avatar and post image storage with multer

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: multer
- **HTTP Client**: CORS enabled
- **Development**: Nodemon, ts-node

## 📁 Project Structure

```
Zforum-backend/
├── config/
│   └── db.ts              # MongoDB connection configuration
├── src/
│   ├── app.ts             # Express app setup and middleware
│   ├── server.ts          # Server startup and route initialization
│   ├── controllers/       # Route handlers for business logic
│   │   ├── authController.ts
│   │   ├── commentController.ts
│   │   ├── postController.ts
│   │   └── userController.ts
│   ├── middlewares/       # Custom middleware
│   │   ├── authMiddleware.ts    # JWT authentication
│   │   └── errorMiddleware.ts   # Error handling
│   ├── models/            # Mongoose schemas
│   │   ├── commentModel.ts
│   │   ├── postModel.ts
│   │   └── userModel.ts
│   ├── routes/            # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── commentRoutes.ts
│   │   ├── postRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/          # Business logic services (optional)
│   └── types/             # TypeScript type definitions
├── uploads/               # User-uploaded files
│   ├── avatars/           # User profile pictures
│   └── posts/             # Post images
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Zforum-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/mini-blog
PORT=5000
FE_PORTAL_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d
```

4. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:5000`

## 📦 Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript server

## 🔑 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info (protected)

### Posts
- `GET /post` - Get all posts
- `GET /post/:id` - Get a specific post
- `GET /post/user/:id` - Get posts by a user
- `GET /posts` - Get paginated posts
- `GET /search` - Search posts
- `GET /stats` - Get overall statistics
- `GET /posts/popular` - Get popular posts
- `GET /posts/latest` - Get latest posts
- `GET /posts/topic/:topic` - Get posts by topic
- `GET /posts/topic-stats` - Get statistics by topic
- `POST /post` - Create a new post (protected, supports image upload)
- `PUT /post/:id` - Update a post (protected)
- `PUT /post/:id/like` - Like a post (protected)
- `PUT /post/:id/dislike` - Dislike a post (protected)
- `DELETE /post/:id` - Delete a post (protected)
- `DELETE /mod/:id` - Moderator delete post

### Comments
- API endpoints for comment management (see `commentRoutes.ts`)

### Users
- API endpoints for user management (see `userRoutes.ts`)

## 💾 Database Models

### User
- username (unique)
- email (unique)
- password (hashed)
- name
- avatarUrl
- role (user, moderator, admin)
- description
- refreshToken
- posts (array of post IDs)
- comments (array of comment IDs)
- score
- timestamps

### Post
- title
- content
- author (User reference)
- topic (from 100+ predefined topics)
- likes (array of user IDs)
- dislikes (array of user IDs)
- comments (array of comment IDs)
- images (array of image URLs)
- timestamps

### Comment
- content
- author (User reference)
- post (Post reference)
- parentComment (optional, for nested comments)
- timestamps

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Refresh token mechanism
- Role-based access control
- CORS configuration
- Cookie support for secure token storage

## 📤 File Upload

- Maximum 5 images per post
- Supports avatar uploads for users
- Files stored in `uploads/avatars` and `uploads/posts` directories
- Automatic unique filename generation

## 🔍 Search & Discovery

- Full-text search across post titles, content, and topics
- Weighted search (title: 5, content: 3, topic: 1)
- Topic filtering with 100+ predefined categories
- Popular posts ranking
- Latest posts listing

## 📊 Topics

The platform supports posts in 100+ different topics including:
Animals, Anime, Art, Astronomy, Programming, Gaming, Sports, Technology, and many more.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request.

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

HaoTNG

## 📧 Support

For support, please open an issue in the repository.
