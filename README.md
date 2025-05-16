# Custody Microservices - Wallet & Asset Services

This project demonstrates a microservices architecture built with Node.js, TypeScript, MongoDB, RabbitMQ, Nginx, and Docker. It consists of two primary services (`wallet-service` and `asset-service`), an API Gateway, and an Nginx reverse proxy.

## Table of Contents

-   [Architecture](#architecture)
-   [Services](#services)
-   [Prerequisites](#prerequisites)
-   [Setup](#setup)
-   [Running the Application](#running-the-application)
-   [API Endpoints](#api-endpoints)
-   [Postman Collection](#postman-collection)
-   [Environment Variables](#environment-variables)

## Architecture

![Custody Microservices Architecture](docs/diagrams/architecture.png)

-   **Nginx**: Listens on port `85` and routes incoming HTTP requests to the API Gateway.
-   **API Gateway**: Single entry point for clients; forwards requests to microservices.
-   **wallet-service**: Manages wallet creation, retrieval and deletion.
-   **asset-service**: Manages asset inventory operations.
-   **RabbitMQ**: Handles asynchronous RPC messaging between services.
-   **MongoDB**: Persists service data.

## Services

1. **wallet-service** (port 8081)

    - `src/server.ts`: Express server setup
    - `src/routes/wallet.routes.ts`: REST endpoints
    - `src/controllers/wallet.controller.ts`: Business logic
    - `src/services/wallet.service.ts`: Data operations
    - `src/services/rabbitmq.service.ts`: RPC Messaging integration

2. **asset-service** (port 8082)

    - `src/server.ts`, `routes/asset.routes.ts`, `controllers/asset.controller.ts`, etc.
    - Handles CRUD for assets and publishes events via RabbitMQ.

3. **gateway** (port 8080 by default)
    - `index.ts`: Entry point; forwards requests to back-end services.

## Prerequisites

-   Node.js v14+ and npm
-   TypeScript (installed globally or as a project dependency)
-   Docker & Docker Compose
-   Postman (or any API client) to test endpoints

## Setup

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd ali-bugra-akdogan-node.js-custody
    ```

2. **Environment files**

    `.env.example` files are provided in the `wallet-service` and `asset-service` folders. Copy to `.env` and update the values:

    ```ini
    MONGODB_URI=
    RABBITMQ_URL=
    PORT=
    NODE_ENV=
    ```

3. **Build and start containers**

    ```bash
    docker-compose up --build
    ```

## Running the Application

-   Nginx proxy available at: `http://localhost:85`
-   API Gateway: `http://localhost:8080`
-   wallet-service: `http://localhost:8081`
-   asset-service: `http://localhost:8082`

Use Postman or any HTTP client to interact with the APIs.

## API Endpoints

### Wallet Service

-   `GET    /api/v1/wallets` - List all wallets
-   `GET    /api/v1/wallets/:id` - Retrieve a wallet by ID
-   `POST   /api/v1/wallets` - Create a new wallet
-   `DELETE /api/v1/wallets/:id` - Delete a wallet

### Asset Service

-   `POST /api/v1/assets/deposit` - Deposit assets
-   Body: `{ address: string, name: string, amount: number }`
-   `POST /api/v1/assets/withdraw` - Withdraw assets
-   Body: `{ address: string, name: string, amount: number }`
-   `POST /api/v1/assets/transfer-schedule` - Schedule an asset transfer
-   Body: `{ fromAddress: string, toAddress: string, name: string, amount: number, executeInSeconds: number }`

## Postman Collection

A Postman collection is provided at `docs/postman/Custody Services Gateway.postman_collection.json`. Import it to quickly test all wallet and asset endpoints—environment variables (e.g., `gateway_base_url`, `address`, `fromAddress`, etc.) are already configured and ready to use.

## Environment Variables

Each service expects the following in its `.env` file:

```ini
MONGODB_URI=mongodb://mongodb:27017/<dbName>
RABBITMQ_URL=amqp://rabbitmq:5672
PORT=<service-port>
NODE_ENV=production
```

> Note: RabbitMQ is not defined in the default `docker-compose.yml`. You must provide a running RabbitMQ instance or extend the compose file.

### Demo Environment Variables

For quick evaluation, the `.env.example` files include demo connection strings pointing to free CloudAMQP and MongoDB Atlas instances. You can use these or replace with your own credentials.

#### Wallet Service (`wallet-service/.env`)

```ini
NODE_ENV="development"
PORT=8081
MONGO_URI="mongodb+srv://dev-user:nKMCsr73cgEvYvj@dev-projects.hd5ff8o.mongodb.net/?retryWrites=true&w=majority&appName=dev-projects"
MESSAGE_BROKER_URL="amqps://cwbjazij:yGuPuf-RBKpdYnuK2_kp6zOHx03p4cG7@seal.lmq.cloudamqp.com/cwbjazij"
```

#### Asset Service (`asset-service/.env`)

```ini
NODE_ENV="development"
PORT=8082
MONGO_URI="mongodb+srv://dev-user:nKMCsr73cgEvYvj@dev-projects.hd5ff8o.mongodb.net/?retryWrites=true&w=majority&appName=dev-projects"
MESSAGE_BROKER_URL="amqps://cwbjazij:yGuPuf-RBKpdYnuK2_kp6zOHx03p4cG7@seal.lmq.cloudamqp.com/cwbjazij"
```

> **Warning:** Do not commit real credentials. Remove or overwrite these before pushing to a public repository.
