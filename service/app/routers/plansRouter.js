import express from 'express';
import * as planController from '../controllers/planController.js';

const plansRouter = () => {
    const router = express.Router();

    router.route('/')
        .post((req, res) => planController.post(req, res));

    router.route('/:id')
        .get((req, res) => planController.get(req, res))
        .patch((req, res) => planController.patch(req, res))
        .delete((req, res) => planController.del(req, res));

    return router;
};

export default plansRouter;
