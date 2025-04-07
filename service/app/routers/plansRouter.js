import express from 'express';
import * as planController from '../controllers/planController.js';

const plansRouter = (client) => {
    const router = express.Router();

    router.route('/')
        .post((req, res) => planController.post(req, res, client));

    router.route('/:id')
        .get((req, res) => planController.get(req, res, client))
        .patch((req, res) => planController.patch(req, res, client))
        .delete((req, res) => planController.del(req, res, client));

    return router;
};

export default plansRouter;
