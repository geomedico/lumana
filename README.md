# **Backend Position Technical Task**

## **Project Setup:**


Create 2 nestjs backend services (i.e - service A, B).

Select any public API that supports text-based queries.

Connect the services to mongodb using the official nodejs mongo driver.

Connect the services to redis using the official redis driver.

Choose any messaging service or transporter for the intraservice communication.

Project APIs should be exposed via swagger.

Docker compose the entire setup.


Feature Implementation:

Service A:

Implement API to Initiate request to the public API to retrieve searched data and insert robustly to mongo database.

Implement API to search the stored data. Search should be performed robustly - make use of indexes, efficient pagination, model the data efficiently, etc.

Each execution of those API should publish an event (will be consumed by service B) with information of the executed operation (i.e result, timestamp, etc.).

Use RedisTimeSeries to log API requests and their execution time.

Implement API to query the timeseries logs.

Service B:

Subscribe to "events" (Published by service A) and insert each incoming event to db (i.e this is a logging service).

Expose 1 APIs via swagger to get all event logs by date range. Perform the query robustly/

---

## **Requirements**

- **Node.js** version **20** or higher.
- **pnpm** package manager installed globally.


## **Project launch**

- **bash command**: `docker-compose up --build`

## **Swagger API Document Annotation References**

- **url:**: `http://localhost:3000/api-docs`

