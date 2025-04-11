import { Client } from '@elastic/elasticsearch';
import esPlanModel from '../model/es-model.js';

let elkClient;

export const initELK = () => {
    if(!elkClient)
        elkClient = new Client({ 
            node: process.env.ELK_NODE,
            auth: {
                username: process.env.ELK_USER,
                password: process.env.ELK_PASS
            },
            tls: { rejectUnauthorized: false }
        });
}

export const storeToElk = async (message) => {
    try {
        const jsonMsg = JSON.parse(message.content.toString());
        const { method, planId, planData } = jsonMsg;
        const idxName = esPlanModel.index;

        await chkExistingIdx(idxName);
    
        if(method == 'post')
            await addToIndex(idxName, planId, planData);
        else if(method == 'patch')
            await updateIndex(idxName, planId, planData);
        else if(method == 'delete')
            await deleteFromIndex(idxName, planId);
    } catch (err) {
        console.error('Error storing data in ELK:', err);
    }
};

const chkExistingIdx = async(index) => {
    const exists = await elkClient.indices.exists({ index });
    if (!exists.body)
        await elkClient.indices.create({ index });
};

const addToIndex = async(index, id, document) => {
    await elkClient.index({ index, id, document });
};

const updateIndex = async(index, id, doc) => {
    await elkClient.update({ index, id, doc });
};

const deleteFromIndex = async(index, id) => {
    await elkClient.delete({ index, id });
}
