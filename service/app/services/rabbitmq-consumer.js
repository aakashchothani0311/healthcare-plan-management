import amqp from 'amqplib';
import { redisRoute } from './redis-service.js';

const readMsgFromQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_CONNECTION);
        const channel = await connection.createChannel();

        process.once('SIGINT', async () => {
            await channel.close();
            await connection.close();
        });

        await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: false });
        await channel.consume(process.env.RABBITMQ_QUEUE, message => {
            if (message) {
                redisRoute(message);
                channel.ack(message);
            } 
        });
    } catch (err) {
        console.error('error in reading message from queue', err);
    }
};

export default readMsgFromQ;
