# LeakCode

A comprehensive online coding platform with AI-powered code review, problem-solving, and real-time code execution.

## Features

- **User Authentication**: Register, login, and JWT-based session management
- **Problem Management**: Browse and solve coding problems with different difficulty levels
- **Code Editor**: Syntax-highlighted code editor with C++ support
- **Test Case Runner**: Run test cases and see results in real-time
- **AI Code Review**: Get intelligent feedback on your code without revealing solutions
- **Code Persistence**: Your code is automatically saved per problem
- **Progress Tracking**: Track solved problems and submission history

## AI Code Review Feature

The platform includes an intelligent AI code review system that provides:

- **Context-Aware Feedback**: Reviews code specifically for the given problem
- **Educational Guidance**: Provides hints and suggestions without giving away solutions
- **Best Practices**: Suggests improvements in code structure and efficiency
- **Encouraging Tone**: Supportive feedback to help learners grow

### Setting up AI Review

1. Get a free Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env` file in the `backend` directory with:
   ```
   GOOGLE_API_KEY=your_api_key_here
   MONGODB_URI=mongodb://localhost:27017/leakcode
   JWT_SECRET=your_jwt_secret_here
   PORT=8000
   ```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- Google AI API key (for AI review feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LeakCode
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file with your configuration
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Seed the Database**
   ```bash
   cd backend
   node seedProblems.js
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Usage

1. **Register/Login**: Create an account or login to access the platform
2. **Browse Problems**: View available coding problems on the dashboard
3. **Solve Problems**: Click "Solve" to open the problem page with code editor
4. **Write Code**: Use the syntax-highlighted editor to write your solution
5. **Test Your Code**: Run test cases to verify your solution
6. **Get AI Review**: Click "Get Review" for intelligent feedback on your code
7. **Submit Solution**: Submit your final solution to check against all test cases

## Problem Types

The platform includes various problem types:
- **Easy**: Basic algorithms and data structures
- **Medium**: More complex problem-solving scenarios
- **Hard**: Advanced algorithmic challenges

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Prism.js
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: Google Gemini AI for code review
- **Authentication**: JWT tokens
- **Code Execution**: C++ compiler (g++)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get specific problem
- `POST /api/problems/:id/run` - Run test cases
- `POST /api/problems/:id/submit` - Submit solution
- `POST /api/problems/:id/review` - Get AI code review
- `POST /api/problems/:id/save-code` - Save user code


## Docker Support

The backend includes Docker configuration for containerized deployment.

> **Best Practice:**
> - Add `.env` to your `.dockerignore` so it is NOT copied into the image.
> - Pass your environment variables at runtime using the `--env-file` option.

```sh
# Build the Docker image (does NOT include your .env)
docker build -t leakcode-backend .

# Run the container with your .env file
# (Make sure .env is in your project root, NOT copied into the image)
docker run --env-file .env -p 8000:8000 leakcode-backend
```

