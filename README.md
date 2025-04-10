# Chess Competition Platform

This project consists of a Next.js frontend deployed on Vercel and an Express backend deployed on Render.

## Project Structure

- `/` - Next.js frontend
- `/server` - Express backend

## Local Development

### Frontend (Next.js)

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend (Express)

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Deployment

### Frontend (Vercel)

1. Push your code to a Git repository (GitHub, GitLab, etc.).

2. Connect your repository to Vercel.

3. Configure the following environment variables in Vercel:
   - `NEXT_PUBLIC_SITE_URL`: Your Vercel deployment URL (e.g., https://co3pe.vercel.app)
   - `NEXT_PUBLIC_API_URL`: Your Render deployment URL (e.g., https://co3pe.onrender.com)
   - Other environment variables as needed

4. Deploy your application.

### Backend (Render)

1. Push your code to a Git repository (GitHub, GitLab, etc.).

2. Connect your repository to Render.

3. Configure the following environment variables in Render:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: 5000 (or the port provided by Render)
   - `NEXT_PUBLIC_SITE_URL`: Your Vercel deployment URL (e.g., https://co3pe.vercel.app)
   - Other environment variables as needed

4. Set the build command:
   ```
   npm install && npm run build
   ```

5. Set the start command:
   ```
   npm run start:prod
   ```

6. Deploy your application.

## Important Notes

- Make sure to update the CORS configuration in the server to include your Vercel deployment URL.
- Update the API URL in the frontend environment variables to point to your Render deployment URL.
- The server's `uploads` directory is not persisted in Render by default. Consider using a cloud storage service like AWS S3 or Google Cloud Storage for file uploads in production. 