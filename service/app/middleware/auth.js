import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { setError } from '../controllers/responseHandler.js';

const validateIdToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return setError({name: 'Unauthorized', message: 'No token provided.'}, res);

    const idToken = authHeader.split(' ')[1];

    const decodedHeader = jwt.decode(idToken, { complete: true })?.header;
    if (!decodedHeader || !decodedHeader.kid)
        return setError({ name: 'Unauthorized', message: 'Invalid token structure.' }, res);

    try {
        const client = jwksClient({ jwksUri: process.env.VALIDATE_TOKEN_URL });
        const key = await getKey(client, decodedHeader.kid);
        if (!key)
            return setError({ name: 'Unauthorized', message: 'Public key not found.' }, res);

        jwt.verify(idToken, key, { algorithms: ['RS256'] }, (err) => {
            if (err)
                return setError({ name: 'Unauthorized', message: 'Invalid token.' }, res);
    
            next();
        });
    } catch (error) {
        return setError({ name: 'Unauthorized', message: 'Authorization failed.' }, res);
    }
};

const getKey = (client, kid) => {
    return new Promise((resolve, reject) => {
        client.getSigningKey(kid, (err, key) => {
            if (err) 
                return reject(err);
            resolve(key.publicKey || key.rsaPublicKey);
        });
    });
};

export default validateIdToken;
