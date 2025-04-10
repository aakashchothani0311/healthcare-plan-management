import amqp from 'amqplib';

export const sendMsgToQ = async(msg) => {
	let connection;
	try {
		connection = await amqp.connect(process.env.RABBITMQ_CONNECTION);

		const channel = await connection.createChannel();
		await channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: false });
		channel.sendToQueue(process.env.RABBITMQ_QUEUE, Buffer.from(JSON.stringify(msg)));

		await channel.close();
	} catch (err) {
		console.error('error in sending message to queue', err);
	} finally {
		if (connection)
			await connection.close();
	}
}