import { createClient } from 'redis';

let client;

export const initRedis = async() => {
    if(!client){
        client = createClient();
        client.on('connect', () => console.log('Reddis connected!'))
              .on('error', err => console.log('error from reddis client', err));

        await client.connect();
    }
};

export const redisRoute = (message) => {
    const jsonMsg = JSON.parse(message.content.toString());
    const { method, planId, planData } = jsonMsg;

    if(method == 'post')
        setPlan(planId, planData);
    else if(method == 'patch')
        patchPlan(planId, planData);
    else if(method == 'delete')
        deletePlan(planId);
};

const setPlan = async(planId, newPlan) => {
    const addToRedis = {};

    addToRedis[planId] = newPlan;

    if(newPlan.planCostShares)
        addToRedis[newPlan.planCostShares.objectId] = newPlan.planCostShares;

    if(newPlan.linkedPlanServices){
        const planServices = newPlan.linkedPlanServices;
        
        planServices.forEach(planSvc => {
            addToRedis[planSvc.objectId] = planSvc;

            if(planSvc.linkedService)
                addToRedis[planSvc.linkedService.objectId] = planSvc.linkedService;

            if(planSvc.planserviceCostShares)
                addToRedis[planSvc.planserviceCostShares.objectId] = planSvc.planserviceCostShares;
        });
    }

    const redisEntries = Object.entries(addToRedis).map(([key, value]) => [key, JSON.stringify(value)]);
    await client.mSet(redisEntries);
};

export const getPlan = async(planId) => {
    return await client.get(planId);
}

const patchPlan = async(planId, patchedPlan) => {
    await client.set(planId, JSON.stringify(patchedPlan));
};

const deletePlan = async(planId) => {
    const child = await getPlan(planId);
    const jsonChild = JSON.parse(child);
    const keysToDel = [planId];

    if(jsonChild?.planCostShares)
        keysToDel.push(jsonChild.planCostShares.objectId);

    if(jsonChild?.linkedPlanServices){
        jsonChild.linkedPlanServices.forEach(svc => {
            if(svc.linkedService)
                keysToDel.push(svc.linkedService.objectId);

            if(svc.planserviceCostShares)
                keysToDel.push(svc.planserviceCostShares.objectId);

            keysToDel.push(svc.objectId);
        })
    }

    if(jsonChild?.objectType == 'planservice'){
        if(jsonChild.linkedService)
            keysToDel.push(jsonChild.linkedService.objectId);

        if(jsonChild.planserviceCostShares)
            keysToDel.push(jsonChild.planserviceCostShares.objectId);
    }

    await client.del(keysToDel);
};
