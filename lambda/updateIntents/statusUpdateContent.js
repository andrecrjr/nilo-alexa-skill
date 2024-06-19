const Alexa = require('ask-sdk-core');
const { respond, respondWithReprompt } = require("../utils");
const { getSearchContentInUserCollection, updateTrackingStatus } = require('../request');

const StatusUpdateContentIntentHandler = {

    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StatusUpdateContent');
    },
    async handle(handlerInput) {

        const token = handlerInput.requestEnvelope.context.System.user.accessToken;
        const contentType = Alexa.getSlotValue(handlerInput.requestEnvelope, 'contentType');
        const currentStatusTrack = Alexa.getSlotValue(handlerInput.requestEnvelope, 'status');
        const queryContentSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'genericContent');

        try {
            const data = await getSearchContentInUserCollection(token, queryContentSlot, contentType);

            if (data.length === 0) {
                return respondWithReprompt(handlerInput,
                    `Sorry, I couldn't find a content called ${queryContentSlot}. 
                    Maybe you would want to add ${queryContentSlot} to your collection, then say it 'I want to add ${queryContentSlot}'`,
                    `Please try to add or update another content!`)
            }

            if (data[0].currentStatusTrack === currentStatusTrack) {
                // Content found with existing status, inform user and offer to try again
                const speechText = `The content "${queryContentSlot}" already has the status "${currentStatusTrack}". 
            Would you like to update another content again?`;
                return respondWithReprompt(handlerInput, speechText)
            }

            const { id } = data[0]?.content;

            if (!id) {
                const speechText = `Sorry, I couldn't find content related to "${queryContentSlot}". Please try add the content to your progress collection.`;
                return respond(handlerInput, speechText)
            }
            // Update content status
            const updateResult = await updateTrackingStatus(token, id, currentStatusTrack);

            if (!updateResult) {
                // Update failed
                const speechText = `There was a problem updating the status of your content. Please try again later.`;
                return respond(handlerInput, speechText);
            }
            // Update successful
            const speechText = `Your content "${queryContentSlot}" has been successfully updated to the status "${currentStatusTrack}".`;
            return respond(handlerInput, speechText)
        } catch (error) {
            return respond(handlerInput, `There was an error processing your request. Please try again later.`)
        }
    }
}

const promptUserToSelectContent = (handlerInput, data, queryContentSlot, currentStatusTrack) => {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let speechText = `Found ${data.length} items for "${queryContentSlot}". Please tell me which number you will choose: `;
    data.forEach((item, index) => {
        speechText += ` Content ${index + 1}: ${item.content.title} with status ${item.currentStatusTrack}. `;
    });
    sessionAttributes.searchData = { data, currentStatusTrack, mode: "Updating" };
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    speechText += "Which content you would like to update? Tell me like 'Number 2'.";

    return respondWithReprompt(handlerInput, speechText, `Please say for example: 'Number 4'`);
};

module.exports = {
    StatusUpdateContentIntentHandler,
    promptUserToSelectContent
}