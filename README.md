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

If deploying to a public host, make sure the host exposes the configured `PORT` environment variable. The production server serves both `/api/*` and the frontend app from the same origin, so no separate frontend hosting is required.

### Notes

- Use `npm install` once before deploying.
- For a cloud provider, set `PORT` to the assigned port if needed.
- If you want, I can繼續幫你把這個部署到具體的雲端平台（例如 Render、Railway、Vercel + serverless 或 Docker 主機）。
