import validateIdToken from '../middleware/auth.js';
import plansRouter from './plansRouter.js';

const initRoutes = (app) => {
    app.use('/v1/plan', validateIdToken, plansRouter());
};

export default initRoutes;
