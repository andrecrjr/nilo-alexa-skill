const updateDynamicEntities = (statusHistory) => {
    return {
        type: 'Dialog.UpdateDynamicEntities',
        updateBehavior: 'REPLACE',
        types: [
            {
                name: 'StatusTrack',
                values: statusHistory.map(status => ({
                    id: status,
                    name: {
                        value: status,
                        synonyms: []
                    }
                }))
            }
        ]
    };
};

module.exports = {
    updateDynamicEntities
}