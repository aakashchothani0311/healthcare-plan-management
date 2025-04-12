import Ajv from 'ajv';

const postSchema = {
    type: 'object',
    properties: {
        planCostShares: {
            type: 'object',
            properties: {
                deductible: { type: 'number' },
                copay: { type: 'number' },
                _org: { type: 'string' },
                objectId: { type: 'string' },
                objectType: { type: 'string' }
            },
            required: ['deductible', 'copay', '_org', 'objectId', 'objectType']
        },
        linkedPlanServices: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    linkedService: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            _org: { type: 'string' },
                            objectId: { type: 'string' },
                            objectType: { type: 'string' },
                        },
                        required: ['name', '_org', 'objectId', 'objectType']
                    },
                    planserviceCostShares: {
                        type: 'object',
                        properties: {
                            deductible: { type: 'number' },
                            copay: { type: 'number' },
                            _org: { type: 'string' },
                            objectId: { type: 'string' },
                            objectType: { type: 'string' },
                        },
                        required: ['deductible', 'copay', '_org', 'objectId', 'objectType'],
                    },
                    _org: { type: 'string' },
                    objectId: { type: 'string' },
                    objectType: { type: 'string' }
                },
                required: ['linkedService', 'planserviceCostShares', '_org', 'objectId', 'objectType'],
            }
        },
        planType: { type: 'string' },
        _org: { type: 'string' },
        objectId: { type: 'string' },
        objectType: { type: 'string' },
        creationDate: { type: 'string' }
    },
    required: ['planCostShares', 'linkedPlanServices', 'planType', '_org', 'objectId', 'objectType', 'creationDate']
};

const patchSchema = {
    type: 'object',
    properties: {
        planCostShares: {
            type: 'object',
            properties: {
                deductible: { type: 'number' },
                copay: { type: 'number' },
                _org: { type: 'string' },
                objectId: { type: 'string' },
                objectType: { type: 'string' }
            },
            required: ['deductible', 'copay', '_org', 'objectId', 'objectType']
        },
        linkedPlanServices: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    linkedService: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            _org: { type: 'string' },
                            objectId: { type: 'string' },
                            objectType: { type: 'string' }
                        },
                        required: ['name', '_org', 'objectId', 'objectType']
                    },
                    planserviceCostShares: {
                        type: 'object',
                        properties: {
                            deductible: { type: 'number' },
                            copay: { type: 'number' },
                            _org: { type: 'string' },
                            objectId: { type: 'string' },
                            objectType: { type: 'string' },
                        },
                        required: ['deductible', 'copay', '_org', 'objectId', 'objectType'],
                    },
                    _org: { type: 'string' },
                    objectId: { type: 'string' },
                    objectType: { type: 'string' }
                },
                required: ['_org', 'objectId', 'objectType'],
            }
        },
        planType: { type: 'string' },
        _org: { type: 'string' },
        objectId: { type: 'string' },
        objectType: { type: 'string' },
        creationDate: { type: 'string' }
    },
    required: ['planType', '_org', 'objectId', 'objectType', 'creationDate']
};

const ajv = new Ajv();
export const postValidate = ajv.compile(postSchema);
export const patchValidate = ajv.compile(patchSchema);
  