import { postValidate, patchValidate } from '../model/plan.js';
import sendMsgToQ from '../services/rabbitmq-producer.js';
import { getPlan } from '../services/redis-service.js';
import { generateETag, genPatchPlan } from '../utils/helper.js';
import { setResponse, setError } from '../utils/responseHandler.js';

export const post = async(req, res) => {
    try {
        const newPlan = {...req.body};
        const valid = postValidate(newPlan);

        if(valid){
            const planId = newPlan.objectId;
            const plan = await getPlan(planId);

            if(plan != null){
                setError({ name: 'Conflict', message: 'Plan already exists. Can not be added again.' }, res);
            } else {
                res.setHeader('etag', generateETag(newPlan));
                sendMsgToQ({ method: 'post', planId: planId, planData: newPlan });
                setResponse(newPlan, res, 201);
            }
        } else
            setError({ name: 'TypeError', message: 'Plan can not be created. ' + postValidate.errors[0].instancePath + ': ' + postValidate.errors[0].message }, res);
    } catch (error) {
        setError(error, res);
    }
}

export const get = async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await getPlan(planId);

        if(plan != null){
            const planJson = JSON.parse(plan);
            const eTag = generateETag(planJson);
            const headerETag = req.headers['if-none-match'];

            res.setHeader('etag', eTag);
            if(headerETag && headerETag == eTag)
                setResponse('', res, 304);
            else
                setResponse(planJson, res);
        } else
            setError({ name: 'InvalidId', message: 'Plan ' + planId + ' does not exist.' }, res);
    } catch (error) {
        setError(error, res);
    }
};

export const patch = async (req, res, client) => {
    try {
        const newPlan = {...req.body};
        const valid = patchValidate(newPlan);

        if(valid){
            const planId = req.params.id;
            const plan = await getPlan(planId);
    
            if(plan != null) {
                const oldPlan = JSON.parse(plan);

                const eTag = generateETag(oldPlan);
                const headerETag = req.headers['if-match'];

                if(!headerETag)
                    setError({ name: 'TypeError', message: 'If-Match not provided.' }, res);
                else if(headerETag && headerETag != eTag)
                    setResponse('', res, 412);
                else if(headerETag && headerETag == eTag){
                    const patchedPlan = genPatchPlan(oldPlan, newPlan);

                    if(generateETag(patchedPlan) == eTag)
                        setError({ name: 'Conflict', message: 'Plan already exists. Can not perform patch again.' }, res);
                    else {
                        const postValid = postValidate(patchedPlan);

                        if(postValid){
                            res.setHeader('etag', generateETag(patchedPlan));
                            sendMsgToQ({ method: 'patch', planId: planId, planData: patchedPlan });
                            setResponse(patchedPlan, res);
                        } else
                            setError({ name: 'TypeError', message: 'Patch operation unsuccessful. ' + postValidate.errors[0].instancePath + ': ' + postValidate.errors[0].message }, res);
                    }
                }
            } else
                setError({ name: 'InvalidId', message: 'No plan(s) found with the id: ' + planId }, res);
        } else
            setError({ name: 'TypeError', message: 'Patch operation unsuccessful. ' + patchValidate.errors[0].instancePath + ': ' + patchValidate.errors[0].message }, res);
    } catch (error) {
        setError(error, res);
    }
};

export const del = async (req, res) => {
    try {
        const planId = req.params.id;
        const planToDelete = await getPlan(planId);

        if(planToDelete != null){
            sendMsgToQ({ method: 'delete', planId: planId });
            setResponse('Plan deleted', res);
        } else
            setError({ name: 'InvalidId', message: 'Plan ' + planId + ' does not exist or is already deleted.' }, res);
    } catch (error) {
        setError(error, res);
    }
};
