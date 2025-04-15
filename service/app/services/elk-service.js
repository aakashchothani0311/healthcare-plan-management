import { Client } from '@elastic/elasticsearch';
import esPlanModel from '../model/es-model.js';
import { selectProps } from '../utils/helper.js';

let elkClient;

export const initELK = () => {
    if(!elkClient)
        elkClient = new Client({ 
            node: process.env.ELK_NODE,
            auth: { username: process.env.ELK_USER, password: process.env.ELK_PASS },
            tls: { rejectUnauthorized: false }
        });
}

export const storeToElk = async (message) => {
    try {
        const jsonMsg = JSON.parse(message.content.toString());
        const { method, planId, planData } = jsonMsg;
        const idxName = esPlanModel.index;

        await chkExistingIdx();
    
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

const chkExistingIdx = async() => {
    const exists = await elkClient.indices.exists({ index: esPlanModel.index });
    if (!exists)
        await elkClient.indices.create({ index: esPlanModel.index, body: esPlanModel.body });
};

const addToIndex = async(index, planId, document) => {
    const bulkOps = [];

    const planProps = selectProps(document, ['planType', '_org', 'objectId', 'objectType', 'creationDate']);
    bulkOps.push(
        { index: { _index: index, _id: planId } },
        { ...planProps, join_field: 'plan'}
    );

    if (document.planCostShares) {
        const planCostShareProps = selectProps(document.planCostShares, ['deductible', 'copay', '_org', 'objectId', 'objectType']);
        bulkOps.push(
            { index: { _index: index, _id: document.planCostShares.objectId, routing: planId } },
            { ...planCostShareProps, join_field: { name: 'planCostShares', parent: planId } }
        );
    }

    if (Array.isArray(document.linkedPlanServices)) {
        for (const svc of document.linkedPlanServices) {
            const planSvcId = svc.objectId;

            const linkedPlanServicesProps = selectProps(svc, ['_org', 'objectId', 'objectType']);
            bulkOps.push(
                { index: { _index: index, _id: planSvcId, routing: planId } },
                { ...linkedPlanServicesProps, join_field: { name: 'linkedPlanServices', parent: planId } }
            );

            if (svc.linkedService) {
                const linkedServiceProps = selectProps(svc.linkedService, ['name', '_org', 'objectId', 'objectType']);
                bulkOps.push(
                    { index: { _index: index, _id: svc.linkedService.objectId, routing: planId } },
                    { ...linkedServiceProps, join_field: { name: 'linkedService', parent: planSvcId } }
                );
            }

            if (svc.planserviceCostShares) {
                const planserviceCostSharesProps = selectProps(svc.planserviceCostShares, ['deductible', 'copay', '_org', 'objectId', 'objectType']);
                bulkOps.push(
                    { index: { _index: index, _id: svc.planserviceCostShares.objectId, routing: planId } },
                    { ...planserviceCostSharesProps, join_field: { name: 'planserviceCostShares', parent: planSvcId } }
                );
            }
        }
    }

    await elkClient.bulk({ refresh: true, body: bulkOps });
};

const updateIndex = async(index, planId, document) => {
    const bulkOps = [];

    const planProps = selectProps(document, ['planType', '_org', 'objectId', 'objectType', 'creationDate']);
    bulkOps.push(
        { update: { _index: index, _id: planId } },
        { doc: { ...planProps }, doc_as_upsert: true }
    );

    if (document.planCostShares) {
        const planCostShareProps = selectProps(document.planCostShares, ['deductible', 'copay', '_org', 'objectId', 'objectType']);
        bulkOps.push(
            { update: { _index: index, _id: document.planCostShares.objectId, routing: planId } },
            { doc: {...planCostShareProps, join_field: { name: 'planCostShares', parent: planId } }, doc_as_upsert: true }
        );
    }

    if (Array.isArray(document.linkedPlanServices)) {
        for (const svc of document.linkedPlanServices) {
            const planSvcId = svc.objectId;

            const linkedPlanServicesProps = selectProps(svc, ['_org', 'objectId', 'objectType']);
            bulkOps.push(
                { update: { _index: index, _id: planSvcId, routing: planId } },
                { doc: { ...linkedPlanServicesProps, join_field: { name: 'linkedPlanServices', parent: planId } }, doc_as_upsert: true }
            );

            if (svc.linkedService) {
                const linkedServiceProps = selectProps(svc.linkedService, ['name', '_org', 'objectId', 'objectType']);
                bulkOps.push(
                    { update: { _index: index, _id: svc.linkedService.objectId, routing: planId } },
                    {doc: { ...linkedServiceProps, join_field: { name: 'linkedService', parent: planSvcId } }, doc_as_upsert: true }
                );
            }

            if (svc.planserviceCostShares) {
                const planserviceCostSharesProps = selectProps(svc.planserviceCostShares, ['deductible', 'copay', '_org', 'objectId', 'objectType']);
                bulkOps.push(
                    { update: { _index: index, _id: svc.planserviceCostShares.objectId, routing: planId } },
                    { doc: { ...planserviceCostSharesProps, join_field: { name: 'planserviceCostShares', parent: planSvcId } }, doc_as_upsert: true }
                );
            }
        }
    }

    await elkClient.bulk({ refresh: true, body: bulkOps });
};

const deleteFromIndex = async (index, objectId) => {
    const toDelete = [];

    await findChildNodes(index, objectId, toDelete);

    if (!toDelete.length)
        return;

    await elkClient.bulk({ body: toDelete });
};

const findChildNodes = async (index, id, toDelete) => {
    const { hits } = await elkClient.search({ index, size: 10,
        body: {
            query: { term: { 'objectId': id } }
        }
    });
    
    if (!hits.hits.length) return;
    
    const doc = hits.hits[0];
    const joinField = doc._source.join_field;
    const docType = typeof joinField === 'object' ? joinField.name : joinField;

    toDelete.unshift({ delete: { _id: doc._id, _index: doc._index, routing: doc._routing } });
    
    const childTypes = getChildTypes(docType);
    if (!childTypes.length) return;
  
    const children = await elkClient.search({ index, size: 10,
        body: {
            query: {
                has_parent: {
                    parent_type: docType,
                    query: { term: { objectId: id } }
                }
            }
        }
    });

    for (const child of children.hits.hits)
        await findChildNodes(index, child._source.objectId, toDelete);
};

const getChildTypes = (parentType) => {
    return esPlanModel.body.mappings.properties.join_field.relations[parentType] || [];
};