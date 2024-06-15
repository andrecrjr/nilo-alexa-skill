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

const respondWithReprompt = (handlerInput, speechText, repromptText) => {
    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
};

function wordToNumber(text) {
    const units = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9
    };
    const teens = {
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
        'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19
    };
    const tens = {
        'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
        'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    };
    const multiplesOfHundred = {
        'hundred': 100, 'thousand': 1000
    };

    // Combine all dictionaries into one for easier access
    const numberWords = { ...units, ...teens, ...tens, ...multiplesOfHundred };

    // Split the text into words
    const words = text.split(/\s+/);
    // Convert words to numbers
    const convertedWords = words.map(word => {
        const lowerCaseWord = word.toLowerCase();
        // Check if the word is a number word
        if (numberWords[lowerCaseWord] !== undefined) {
            return numberWords[lowerCaseWord];
        } else {
            // If not, return the word as is
            return word;
        }
    });

    // Join the converted words back into a string
    return convertedWords.join(' ');
}

const respond = (handlerInput, speechText) => {
    return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
};

module.exports = {
    updateDynamicEntitiesStatusTrack,
    updateDynamicEntityUserContentQuery,
    wordToNumber,
    respond,
    respondWithReprompt
}