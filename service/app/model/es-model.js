const esPlanModel = {
    index: 'healthcare-plans',
    body: {
        mappings: {
            properties: {
                planType: { type: 'keyword' },
                _org: { type: 'keyword' },
                objectId: { type: 'keyword' },
                objectType: { type: 'keyword' },
                creationDate: { type: 'date', format: 'dd-MM-yyyy' },
                
                planCostShares: {
                    properties: {
                        deductible: { type: 'integer' },
                        copay: { type: 'integer' },
                        _org: { type: 'keyword' },
                        objectId: { type: 'keyword' },
                        objectType: { type: 'keyword' }
                    }
                },

                linkedPlanServices: {
                    type: 'nested',
                    properties: {
                        linkedService: {
                            properties: {
                                _org: { type: 'keyword' },
                                objectId: { type: 'keyword' },
                                objectType: { type: 'keyword' },
                                name: { type: 'text' }
                            }
                        },

                        planserviceCostShares: {
                            properties: {
                                deductible: { type: 'integer' },
                                copay: { type: 'integer' },
                                _org: { type: 'keyword' },
                                objectId: { type: 'keyword' },
                                objectType: { type: 'keyword' }
                            }
                        }
                    }
                },

                join_field: {
                    type: 'join',
                    relations: {
                        plan: ['linkedPlanServices', 'planCostShares'],
                        linkedPlanServices: ['linkedService', 'planserviceCostShares']
                    }
                }
            }
        }
    }
};

export default esPlanModel;
