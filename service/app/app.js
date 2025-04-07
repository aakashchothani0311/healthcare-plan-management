import cors from 'cors';
import express from 'express';
import { createClient } from 'redis';
import initRoutes from './routers/index.js';

const init = async (app) => {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded());

    const client = createClient();
    client.on('connect', () => console.log('Reddis connected!'))
          .on('error', err => console.log('Redis client error', err));
    await client.connect();

    initRoutes(app, client);
}

export default init;
