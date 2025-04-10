import { createClient } from 'redis';

let client;

export const initRedis = async() => {
    if(!client){
        client = createClient();
        client.on('connect', () => console.log('Reddis connected!'))
              .on('error', err => console.log('Redis client error', err));

        await client.connect();
    }
};

export const redisRoute = (message) => {
    const jsonMsg = JSON.parse(message.content.toString());
    const method = jsonMsg.method;
    const planId = jsonMsg.planId
    const plan = jsonMsg.planData;

    if(method == 'post')
        setPlan(planId, plan);
    else if(method == 'patch')
        patchPlan(planId, plan);
    else if(method == 'delete')
        deletePlan(planId);
};

const setPlan = async(planId, newPlan) => {
    await client.set(planId, JSON.stringify(newPlan));
};

export const getPlan = async(planId) => {
    return await client.get(planId);
}

const patchPlan = async(planId, patchedPlan) => {
    await client.set(planId, JSON.stringify(patchedPlan));
};

const deletePlan = async(planId) => {
    await client.del(planId);
};
