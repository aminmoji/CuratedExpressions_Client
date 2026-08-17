# Curated Expressions — Client

React frontend for **Curated Expressions**, a full-stack art marketplace project built during boot camp in 2023.

This repository is kept close to the original implementation. The documentation and repository hygiene have been cleaned up, but the project has not been rewritten to make it look newer than it is.

## Features

- Browse artwork listings
- View individual artwork details
- User signup and login
- User dashboard
- Create, edit, and delete artwork listings
- Upload multiple artwork images to Firebase Storage
- Store login state with a JWT returned by the backend

## Tech stack

- React 18
- React Router
- React Bootstrap
- Firebase Storage
- JavaScript
- JWT decoding
- REST API backend

## Related repository

Backend API:

https://github.com/aminmoji/CuratedExpressions_Server

## Local setup

```bash
git clone https://github.com/aminmoji/CuratedExpressions_Client.git
cd CuratedExpressions_Client
npm install
cp .env.example .env
npm start
```

Fill in the Firebase values in `.env` before testing image uploads.

The original frontend is configured to call the Curated Expressions backend from `src/components/Main.js` and related components.

## Environment variables

See `.env.example`:

```text
REACT_APP_API_KEY
REACT_APP_AUTH_DOMAIN
REACT_APP_PROJECT_ID
REACT_APP_STORAGE_BUCKET
REACT_APP_MESSAGING_SENDER_ID
REACT_APP_APP_ID
REACT_APP_BUCKET_URL
```

## Project status

Historical portfolio / learning project.

The project reflects the stack and implementation used when it was originally built. Future fixes should focus on correctness, security, and maintainability rather than disguising the project's age.
