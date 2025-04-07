import amqp from 'amqplib';

const queue = 'health_plan';

export const sendMsgToQ = async(msg) => {
	let connection;
	try {
		connection = await amqp.connect(process.env.RABBITMQ_PRODUCER);

		const channel = await connection.createChannel();
		await channel.assertQueue(queue, { durable: false });
		channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

		await channel.close();
	} catch (err) {
		console.error('error in sending message to queue', err);
	} finally {
		if (connection)
			await connection.close();
	}
}