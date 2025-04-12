import crypto from 'crypto';

export const generateETag = (data) => {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return `W/"${hash.digest('hex')}"`;
}

export const genPatchPlan = (oldPlan, newPlan) => {
    const patchedPlan = { ...oldPlan };

    if (newPlan.planCostShares)
        patchedPlan.planCostShares = { ...patchedPlan.planCostShares, ...newPlan.planCostShares };

    if (newPlan.linkedPlanServices){
        newPlan.linkedPlanServices.forEach(elmt => {
            let idx = patchedPlan.linkedPlanServices.findIndex(plan => plan.objectId == elmt.objectId)

            if(idx == -1)
                patchedPlan.linkedPlanServices.push(elmt);
            else
                patchedPlan.linkedPlanServices[idx] = {...patchedPlan.linkedPlanServices[idx], ...elmt};
        })
    }
    
    return patchedPlan;
}

export const selectProps = (obj, keys = []) => {
    return keys.reduce((acc, key) => {
        if (obj.hasOwnProperty(key))
            acc[key] = obj[key];
        return acc;
    }, {});
};
