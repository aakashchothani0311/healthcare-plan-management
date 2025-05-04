## Healthcare Plan Management
This project was built to complete the requirements of "INFO7255 Advanced Big-Data Applications and Indexing Techniques" course which I took at Northeastern University as part of my Master's degree.

This project implements a backend system for managing healthcare plans, incorporating secure API access, caching, message queues, and real-time logging and analytics. 

## Tech Stack & Tools
- Express.js
- Redis
- GraphQL
- ELK Stack (ElasticSearch, Logstash, Kibana)
- RabbitMQ
- OAuth 2.0
- Docker
- Postman

## Setup
#### Docker (for RabbitMQ & ELK):


#### Server:
1. Navigate to the server directory: `cd service`.
2. Run `npm install` to install the required node modules.
3. Add a .env file to configure the application PORT and other configruations and credentials. A .env.example file is profided for reference.
4. Start the server with `npm start`, which will run the server on the port specified in .env file.

## Node packages that will be installed
- **ajv:** for JSON schema validation.
- **amqlib:** for RabbitMQ messaging.
- **cors:** to enable Cross-Origin Resource Sharing for secure API access.
- **crypto:** to generate ETags using SHA-256 hashing.
- **debug:** to provide a debugging utility for Node.js applications.
- **dotenv:** to load environment variables from a .env file.
- **express:** a web application framework for Node.js.
- **@elastic/elasticsearch:** for connecting to Elasticsearch
- **jsonwebtoken:** for creating and verifying JWTs.
- **jwks-rsa:** to retrieve signing keys from a JWKS endpoint.
- **redis:** for Redis caching and messaging.
