import { createClient } from 'redis';

let client;

export const initRedis = async() => {
    if(!client){
        client = createClient();
        client.on('connect', () => console.log('Reddis connected!'))
              .on('error', err => console.log('Redis client error', err));

        await client.connect();
    }
    return client;
};

export const redisRoute = (message) => {
    if(message.method == 'post')
        setPlan(message.planId, message.planData);
    else if(message.method == 'patch')
        patchPlan(message.planId, message.planData);
    else if(message.method == 'delete')
        deletePlan(planId);
};

const setPlan = async(planId, newPlan) => {
    await client.set(planId, JSON.stringify(newPlan));
};

const patchPlan = async(planId, patchedPlan) => {
    await client.set(planId, JSON.stringify(patchedPlan));
};

const deletePlan = async(planId) => {
    await client.del(planId);
};
