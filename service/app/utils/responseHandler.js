import { sendMsgToQ } from'../services/rabbitmq-producer.js';

export const setResponse = (data, response, statusCode = 200) => {
    response.status(statusCode).json(data);
}

export const setError = (error, response) => {
    if(error.name === 'TypeError') {
        response.status(400).json({
            error: {
                code: 'Bad Request',
                message: error.message,
            }
        });
    } else if (error.name === 'Unauthorized') {
        sendMsgToQ("test");
        response.status(401).json({
            error: {
                code: 'Authorization Error',
                message: error.message
            }
        });
    } else if (error.name === 'InvalidId') {
        response.status(404).json({
            error: {
                code: 'Invalid ID',
                message: error.message
            }
        });
    } else if (error.name === 'Conflict') {
        response.status(409).json({
            error: {
                code: 'Conflict Error',
                message: error.message
            }
        });
    }else {
        response.status(500).json({
            error: {
                code: 'InternalServerError',
                message: 'An error occurred while processing the request. Please try again later or contact the administrator.'
            }
        });
    }
};