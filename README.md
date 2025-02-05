# Tour Management System

> A modern web application for managing tours, users, and reviews. This system helps tour operators manage their business more effectively.

## What This Project Does

- Manage tours and their details
- Handle user accounts and authentication
- Process tour reviews and ratings
- Secure API endpoints
- Handle data efficiently and safely

## Main Features

- **Tour Management**: Add, update, and delete tour packages
- **User System**: Sign up, login, and manage user profiles
- **Reviews**: Users can leave reviews and ratings for tours
- **Security**: Protected against common web attacks
- **API Rate Limiting**: Prevents overuse of the system

## Tech Stack

- Node.js
- Express.js
- MongoDB (Database)
- Various security packages (helmet, hpp, etc.)

## How to Use

1. Clone this project to your computer
2. Create a `.env` file with your settings (see below)
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```

## Environment Variables Needed

Create a `.env` file in the root folder with these settings:
- `NODE_ENV`: development or production
- `DATABASE`: Your MongoDB connection string
- `JWT_SECRET`: Your secret key for tokens
- `JWT_EXPIRES_IN`: Token expiry time

## Project Structure

- `controllers/`: Handles business logic
- `models/`: Database models
- `routes/`: API routes
- `middleware/`: Custom middleware functions
- `utils/`: Helper functions
- `public/`: Static files
- `test/`: Test files [TBA]

## API Routes

- `/api/tours`: Tour management
- `/api/users`: User management
- `/api/reviews`: Review management

## Security Features

- Rate limiting
- Data sanitization
- Security headers
- Parameter pollution protection
- Compression for better performance
