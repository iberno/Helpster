This repository contains a complete boilerplate for a Role-Based Access Control (RBAC) system, divided into two main parts:

1.  **API (Backend):** A secure backend built with Node.js (Express) and PostgreSQL. It handles user authentication (JWT), database connections, and the core role-based authorization logic.
2.  **Frontend:** A powerful administration panel built with React (Vite) and styled with Tailwind CSS. It provides a ready-to-use interface for managing users and creating custom roles with specific permissions.

This boilerplate is designed to be a robust starting point for any application requiring granular access control.

## Core Features

-   **Secure JWT Authentication:** The backend uses JSON Web Tokens for secure user authentication.
-   **PostgreSQL Database:** The API is pre-configured to work with a PostgreSQL database for storing user and role information.
-   **Dynamic Admin Panel:** The frontend is a complete administration dashboard.
-   **User Management:** Create and list users directly from the admin panel.
-   **Custom Role & Permission Management:** Create custom roles (e.g., "Content Editor", "Support Agent") and assign a granular set of permissions to each one. The `admin` role is a root user with all permissions.
-   **Protected Routes:** Both the backend and frontend have a pre-built structure for protecting routes based on user roles and permissions.

## Project Structure

```
rbac_/
├── rbac_api/             # Project for the API (Node.js, Express, PostgreSQL)
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── ...
└── rbac_front/           # Project for the Frontend (React, Vite, Tailwind CSS)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   └── admin/    # Admin panel pages
    │   ├── data/         # Mock data for permissions
    │   └── services/     # Service for API callsuração do banco de dados do Helpster concluída com sucesso!

    ├── package.json
    └── ...
```

## How to Run the Project

### 1. Backend Setup (rbac_api)

1.  Navigate to the API directory:
    ```bash
    cd rbac_api
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on the `.env.example`. This is crucial for security and configuration.
    ```bash
    cp .env.example .env
    ```
4.  Update the `.env` file with your environment variables, especially the database connection string and a strong `JWT_SECRET`.
    ```
    PORT=3000
    JWT_SECRET=your_super_secret_and_long_jwt_key
    DATABASE_URL=postgresql://admin:12345@localhost:5432/rbac_db
    ```
    **Note:** Make sure you have a running PostgreSQL instance and that the database (`rbac_db` in the example) exists.

5.  Start the API server:
    ```bash
    npm run dev
    ```
    The API will be running at `http://localhost:3000`.

### 2. Frontend Setup (rbac_front)

1.  In a new terminal, navigate to the frontend directory:
    ```bash
    cd rbac_front
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

## Important Note on Backend Functionality

The frontend administration panel is fully built with a user-friendly interface for managing users and roles. **However, the backend API currently only has the essential authentication endpoints.**

The user and role management features in the frontend (`getUsers`, `createUser`, `getRoles`, `createRole`) are currently **mocked** in the `src/services/authService.js` file.

To make the admin panel fully functional, you will need to **implement the corresponding endpoints in the backend API**.

### Next Steps for Backend Development

1.  **Expand the Database Schema:** Create new tables for `roles`, `permissions`, and a join table like `role_permissions` to link them.
2.  **Create New API Routes:** Build the following endpoints in your `rbac_api` project:
    -   `GET /api/users`: List all users.
    -   `POST /api/users`: Create a new user (admin only).
    -   `GET /api/roles`: List all roles and their permissions.
    -   `POST /api/roles`: Create a new role with a set of permissions.
    -   `GET /api/permissions`: List all available permissions in the system.
3.  **Update the Frontend Service:** Once the backend endpoints are ready, update the functions in `rbac_front/src/services/authService.js` to make real `fetch` calls to your API instead of returning mocked data.