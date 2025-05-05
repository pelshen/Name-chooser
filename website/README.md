# Windsurf Project

A modern serverless web application built with React (using React Router v7 for routing), featuring Slack authentication, DynamoDB session storage, and a frontend styled with Tailwind CSS. Local development supports HTTPS for secure testing. Vite is used for fast development and builds.

## Features
- **Slack Login/Logout**: Authenticate users via Slack OAuth, with a seamless login/logout experience and session management.
- **Session Storage**: Uses DynamoDB for storing user sessions securely.
- **Serverless Backend**: Powered by AWS Lambda and managed with the Serverless Framework.
- **Modern UI**: Built with React, React Router v7, and Tailwind CSS.
- **Local HTTPS**: Supports local HTTPS development for secure cookie handling and OAuth flows.

## Local Development

1. **Install Dependencies**
   ```sh
   npm install
   ```

2. **Set Up Local HTTPS**
   - Generate trusted local certificates using [mkcert](https://github.com/FiloSottile/mkcert) (do **not** check these files into version control):
     1. **Install mkcert** (see [mkcert GitHub](https://github.com/FiloSottile/mkcert) for full instructions)
        - On macOS: `brew install mkcert`
        - On Windows: [Download from releases](https://github.com/FiloSottile/mkcert/releases) and add to PATH
        - On Linux: follow instructions on the mkcert repo
     2. **Install the local CA** (run once):
        ```sh
        mkcert -install
        ```
     3. **Generate certificates for localhost:**
        ```sh
        mkcert localhost
        ```
        This will create `localhost.pem` and `localhost-key.pem` in your directory.
     4. **Rename or copy these files as `cert.pem` and `key.pem` in your project root:**
        ```sh
        copy localhost.pem cert.pem
        copy localhost-key.pem key.pem
        # or use 'cp' on macOS/Linux
        ```
   - Add both files to your `.gitignore`:
     ```gitignore
     cert.pem
     key.pem
     ```

3. **Run the Dev Server**
   ```sh
   npm run dev
   ```
   - This starts both the Remix frontend and the Serverless backend (with DynamoDB Local).
   - Access your app at: [https://localhost:3000](https://localhost:3000)

## Deployment

1. **Build the App**
   ```sh
   npm run build
   ```
2. **Deploy to AWS**
   ```sh
   serverless deploy
   ```
   - Make sure your AWS credentials and environment variables are set up correctly.

## Security Notes
- **cert.pem** and **key.pem** are for local development only. Never commit these files to version control.
- Sessions are stored securely in DynamoDB and managed with secure, HTTP-only cookies.

## Environment Variables
- `SESSION_TABLE`: DynamoDB table for sessions
- `AWS_REGION`: AWS region (default: eu-west-2)
- `IS_OFFLINE`: Set to `true` for local development
- Slack OAuth credentials (see `.env.example` if available)

## Useful Scripts
- `npm run dev` — Start local dev environment (frontend + backend)
- `npm run build` — Build for production
- `npm start` — Run production build locally
- `serverless deploy` — Deploy to AWS

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

---

For more details, see the code and comments throughout the project.