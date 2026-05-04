<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/790a2da2-139d-4527-a53a-84b4b88afd4b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Public Domain

1. Build the frontend:
   `npm run build`
2. Start the production server:
   `npm run start:prod`
3. Or build and run in a Docker container:
   `docker build -t professor-pro .`
   `docker run -p 8080:8080 professor-pro`

The app will then be available on the public host and the backend API will serve both `/api/*` and the frontend static site from the same origin.
