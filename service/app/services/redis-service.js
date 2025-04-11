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
