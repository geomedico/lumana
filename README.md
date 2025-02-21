# **Backend Position Technical Task**

## **Project Setup:**

Create 2 NestJS backend services (`service-a` and `service-b`).

Select any public API that supports text-based queries.

Connect the services to **MongoDB** using the official Node.js MongoDB driver.

Connect the services to **Redis** using the official Redis driver.

Choose any messaging service or transporter for **intraservice communication**.

Expose project APIs via **Swagger**.

Containerize the entire setup using **Docker Compose**.

---

## **Feature Implementation:**

### **Service A:**
- Implement an API to initiate a request to the public API to retrieve searched data and robustly insert it into the **MongoDB** database.
- Implement an API to **search the stored data** efficiently using indexes, pagination, and optimized data modeling.
- Each API execution should **publish an event** (to be consumed by **Service B**) containing details such as execution results, timestamps, etc.
- Use **RedisTimeSeries** to log API requests and their execution times.
- Implement an API to **query the time series logs**.

### **Service B:**
- **Subscribe** to events published by **Service A** and insert each incoming event into the database (acts as a logging service).
- Expose an API via **Swagger** to **retrieve event logs** by date range, ensuring robust query performance.

---

## **Requirements:**
- **Node.js** version **20** or higher.
- **pnpm** package manager installed globally.

---

## **Project Launch:**

- **Rename `.env.example` to `.env` before starting the project:**
  ```bash
  mv .env.example .env
  ```

- **Ensure the following environment variables are set in `.env` file:**
  ```env
  MONGO_URI_A=# mongodb://mongo:27017/service_a
  MONGO_URI_B=# mongodb://mongo:27017/service_b
  RABBITMQ_DEFAULT_USER=# quest
  RABBITMQ_DEFAULT_PASS=# quest
  REDIS_URI=# redis://redis:6379
  RABBITMQ_URI=# amqp://rabbitmq:5672
  PORT_A=# 3000
  PORT_B=# 3001
  ```

- **Start the services using Docker Compose:**
  ```bash
  docker-compose up --build
  ```

- **Verify running services:**
  ```bash
  docker ps
  ```

- **Stop all services:**
  ```bash
  docker-compose down
  ```

---

## **Swagger API Documentation Reference:**

- **URL**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

