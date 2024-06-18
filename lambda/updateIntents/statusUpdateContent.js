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
        const currentStatusTrack = Alexa.getSlotValue(handlerInput.requestEnvelope, 'status');
        const episodeOrPage = Alexa.getSlotValue(handlerInput.requestEnvelope, 'episodeOrPage');
        const episodeOrPageNumber = Alexa.getSlotValue(handlerInput.requestEnvelope, 'episodeOrPageNumber');
        const queryContentSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'ContentTitle');
        console.log("LOG currenStatusTrack", currentStatusTrack)
        console.log("LOG episodeOrPage", episodeOrPage)
        console.log("LOG episodeOrPageNumber", episodeOrPageNumber)
        console.log("LOG queryContentSlot", queryContentSlot)
        if (!currentStatusTrack || !queryContentSlot) {
            return handlerInput.responseBuilder
                .speak(`Sorry, I didn't understand what you said. Please try again.`)
                .reprompt(`Please, try to add or update some content!`)
                .getResponse();
        }

        try {
            const data = await getSearchContentInUserCollection(token, queryContentSlot, currentStatusTrack);

            if (data.length === 0) {
                return respondWithReprompt(handlerInput,
                    `Sorry, I couldn't find a content called ${queryContentSlot}. Please try again.`,
                    `Please try to add or update another content!`)
            }

            if (data.length === 0 && data.currentStatusTrack === currentStatusTrack) {
                // Content found with existing status, inform user and offer to try again
                const speechText = `The content "${queryContentSlot}" already has the status "${currentStatusTrack}". 
            Would you like to try updating it again?`;
                return respondWithReprompt(handlerInput, speechText)
            }

            if (data.length > 1) {
                return promptUserToSelectContent(handlerInput, data, queryContentSlot, currentStatusTrack);
            }

            const { id } = data[0]?.content;

            if (!id) {
                const speechText = `Sorry, I couldn't find content related to "${queryContentSlot}". Please try again.`;
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