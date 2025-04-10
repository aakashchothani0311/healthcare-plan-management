import amqp from "amqplib";

export const readMsgFromQ = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_CONNECTION);
        const channel = await connection.createChannel();

        process.once("SIGINT", async () => {
            await channel.close();
            await connection.close();
        });

        await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: false });
        await channel.consume(process.env.RABBITMQ_QUEUE, { noAck: true }, message => {
            if (message)
                console.log(' [x] Received ', JSON.parse(message.content.toString()));
        });

        console.log(" [*] Waiting for messages. To exit press CTRL+C");
    } catch (err) {
        console.warn(err);
    }
};