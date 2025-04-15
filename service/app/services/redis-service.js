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

    if(newPlan.planCostShares) {
        addToRedis[newPlan.planCostShares.objectId] = newPlan.planCostShares;
        addToRedis[`ref:${newPlan.planCostShares.objectId}`] = planId;
    }
        
    if(newPlan.linkedPlanServices) {
        const planServices = newPlan.linkedPlanServices;
        
        planServices.forEach(planSvc => {
            addToRedis[planSvc.objectId] = planSvc;
            addToRedis[`ref:${planSvc.objectId}`] = planId;

            if(planSvc.linkedService){
                addToRedis[planSvc.linkedService.objectId] = planSvc.linkedService;
                addToRedis[`ref:${planSvc.linkedService.objectId}`] = planSvc.objectId;
            }          

            if(planSvc.planserviceCostShares) {
                addToRedis[planSvc.planserviceCostShares.objectId] = planSvc.planserviceCostShares;
                addToRedis[`ref:${planSvc.planserviceCostShares.objectId}`] = planSvc.objectId;
            }        
        });
    }

    const redisEntries = Object.entries(addToRedis).map(([key, value]) => [key, JSON.stringify(value)]);
    await client.mSet(redisEntries);
};

export const getPlan = async(planId) => {
    return await client.get(planId);
}

const patchPlan = async(planId, patchedPlan) => {
    await setPlan(planId, patchedPlan);
};

const deletePlan = async(planId) => {
    const keysToDel = [planId];

    const newPlan = await removeFromParent(planId, planId, keysToDel);
   // console.log('newPlan', newPlan);

    const child = await getPlan(planId);
    const jsonChild = JSON.parse(child);

    if(jsonChild?.planCostShares) {
        keysToDel.push(jsonChild.planCostShares.objectId);
        keysToDel.push(`ref:${jsonChild.planCostShares.objectId}`);
    }
        
    if(jsonChild?.linkedPlanServices){
        jsonChild.linkedPlanServices.forEach(svc => {
            if(svc.linkedService){
                keysToDel.push(svc.linkedService.objectId);
                keysToDel.push(`ref:${svc.linkedService.objectId}`);
            }

            if(svc.planserviceCostShares){
                keysToDel.push(svc.planserviceCostShares.objectId);
                keysToDel.push(`ref:${svc.planserviceCostShares.objectId}`);
            }
            
            keysToDel.push(svc.objectId);
            keysToDel.push(`ref:${svc.objectId}`);
        })
    }

    if(jsonChild?.objectType == 'planservice'){
        if(jsonChild.linkedService) {
            keysToDel.push(jsonChild.linkedService.objectId);
            keysToDel.push(`ref:${jsonChild.linkedService.objectId}`);
        }

        if(jsonChild.planserviceCostShares){
            keysToDel.push(jsonChild.planserviceCostShares.objectId);
            keysToDel.push(`ref:${jsonChild.planserviceCostShares.objectId}`);
        }
    }

  //  console.log('keysToDel', keysToDel);

    await client.del(keysToDel);

    if(jsonChild.objectType != 'plan')
        await setPlan(newPlan.objectId, newPlan);
};

const removeFromParent = async (planId, idToDel, keysToDel) => {
    const parentRef = await client.get(`ref:${planId}`);

    if(parentRef != null) {
        const parent = await getPlan(JSON.parse(parentRef));
        const jsonParent = JSON.parse(parent);

        return removeFromParent(jsonParent.objectId, idToDel, keysToDel);
    } else {
        const plan = await getPlan(planId);
        const jsonPlan = JSON.parse(plan);

        if(jsonPlan.planCostShares?.objectId == idToDel){
            keysToDel.push(`ref:${idToDel}`);
            delete jsonPlan.planCostShares;
        }
        
        if (Array.isArray(jsonPlan.linkedPlanServices)) {
            jsonPlan.linkedPlanServices = jsonPlan.linkedPlanServices.filter(svc => {
                if (!svc) return true;

                // if (svc.objectId === idToDel)
                //     return false;
        
                if (svc.linkedService?.objectId === idToDel){
                    delete svc.linkedService;
                    keysToDel.push(`ref:${idToDel}`);
                }
                   
        
                if (svc.planserviceCostShares?.objectId === idToDel){
                    delete svc.planserviceCostShares;
                    keysToDel.push(`ref:${idToDel}`);
                }
                    
                if(svc.objectId == idToDel)
                    keysToDel.push(`ref:${idToDel}`);

                return svc.objectId !== idToDel;
            });
        }

        return jsonPlan;
    }
}
