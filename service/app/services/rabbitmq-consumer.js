import amqp from 'amqplib';
import { redisRoute } from './redis-service.js';
import { storeToElk } from './elk-service.js';

const readMsgFromQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_CONNECTION);
        const channel = await connection.createChannel();

        process.once('SIGINT', async () => {
            await channel.close();
            await connection.close();
        });

        await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: false });
        await channel.consume(process.env.RABBITMQ_QUEUE, message => messageHandler(channel, message));
    } catch (err) {
        console.error('error reading message from queue', err);
    }
};

const messageHandler = (channel, message) => {
    if (message) {
        redisRoute(message);
        storeToElk(message);
        channel.ack(message);
    } 
}

export default readMsgFromQ;
