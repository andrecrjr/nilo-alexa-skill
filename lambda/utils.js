const updateDynamicEntitiesStatusTrack = (statusHistory) => {
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

const updateDynamicEntityUserContentQuery = (userContents) => {
    return {
        type: 'Dialog.UpdateDynamicEntities',
        updateBehavior: 'REPLACE',
        types: [
            {
                name: 'ContentQuery',
                values: userContents.map(content => ({
                    id: content.id,
                    name: {
                        value: content.name,
                        synonyms: []
                    }
                }))
            }
        ]
    };
};

module.exports = {
    updateDynamicEntitiesStatusTrack,
    updateDynamicEntityUserContentQuery
}