import validateIdToken from '../middleware/auth.js';
import plansRouter from './plansRouter.js';

const initRoutes = (app, client) => {
    app.use('/v1/plan', validateIdToken, plansRouter(client));
};

export default initRoutes;