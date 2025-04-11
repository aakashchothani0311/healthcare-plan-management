const esPlanModel = {
    index: 'healthcare-plans',
  
    joinField: {
        name: 'relation',
        relations: {
            plan: ['planCostShare', 'planService']
        }
    },
  
    getPlanDocument: (plan) => {
        if (!plan.objectId || !plan.planType || !plan.creationDate)
            throw new Error('Invalid plan data: missing objectId, planType, or creationDate');
    
        return { ...plan, relation: 'plan' };
    },

    getPlanCostShareDocument: (costShare, parentId) => {
        if (!costShare.objectId || costShare.copay == null || costShare.deductible == null)
            throw new Error('Invalid planCostShare data: missing objectId, copay, or deductible');
  
        return {
            ...costShare,
            relation: { name: 'planCostShare', parent: parentId },
        };
    },
  
    getPlanServiceDocument: (service, parentId) => {
        if (!service.objectId || !service.linkedService || !service.planserviceCostShares)
            throw new Error('Invalid planService data: missing objectId, linkedService, or planserviceCostShares');
    
        return {
            ...service,
            relation: { name: 'planService', parent: parentId },
        };
    }
};

export default esPlanModel;
  