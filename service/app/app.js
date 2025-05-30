import cors from 'cors';
import express from 'express';
import initRoutes from './routers/index.js';
import readMsgFromQ from './services/rabbitmq-consumer.js';
import { initRedis } from './services/redis-service.js';
import { initELK } from './services/elk-service.js';

const init = async (app) => {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded());

    readMsgFromQ();
    initRedis();
    initELK();
    
    initRoutes(app);
}

export default init;
