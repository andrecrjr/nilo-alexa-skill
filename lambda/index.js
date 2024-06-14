/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const { getUserAuth, getDynamicStatusSlotHistory, getSearchContentInUserCollection, updateTrackingStatus } = require('./request');
const { updateDynamicEntities, updateUserContentQuery, updateDynamicEntitiesStatusTrack, updateDynamicEntityUserContentQuery } = require('./utils');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {

        const token = handlerInput.requestEnvelope.context.System.user.accessToken;
        const userData = await getUserAuth(token);
        const newSlotsFromService = await getDynamicStatusSlotHistory(token);
        const newUserCollectionFromService = await getSearchContentInUserCollection(token, "")
        const dynamicStatusTracker = updateDynamicEntitiesStatusTrack(newSlotsFromService.map(type => type.statusTracker.statusHistory).flat())

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.userData = { ...userData, ...{ collections: newUserCollectionFromService.map(item => ({ id: item.content.id, name: item.content.title })) } };

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        const speakOutput = `Welcome to Alexandria Content Tracker, ${userData.username}! 
        I'm here to assist you in keeping track of your books and manga and other contents. What would you like to update today?`;
        const speakReprompt = `For example, you can say "Update the title of the book to page 45", or "Mark chapter 3 of the manga as read".`

        return handlerInput.responseBuilder.addDirective(dynamicStatusTracker)
            .speak(speakOutput)
            .reprompt(speakReprompt)
            .getResponse();
    }
};

const StatusUpdateContentIntentHandler = {

    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StatusUpdateContent');
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const token = handlerInput.requestEnvelope.context.System.user.accessToken;
        const currentStatusTrack = Alexa.getSlotValue(handlerInput.requestEnvelope, 'status');
        const queryContentSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'QueryContent');
        const { id, currentStatusTrack: statusUser } = await getSearchContentInUserCollection(token, queryContentSlot);

        if (!id) {
            // Content not found
            const speechText = `Sorry, I couldn't find content related to "${queryContentSlot}". Please try again.`;
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }

        if (statusUser === currentStatusTrack) {
            // Content found with existing status, inform user and offer to try again
            const speechText = `The content "${queryContentSlot}" already has the status "${currentStatusTrack}". 
            Would you like to try updating it again?`;
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
        }

        // Update content status
        const updateResult = await updateTrackingStatus(token, id, currentStatusTrack);

        if (!updateResult) {
            // Update failed
            const speechText = `There was a problem updating the status of your content. Please try again later.`;
            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        }

        // Update successful
        const speechText = `Your content "${queryContentSlot}" has been successfully updated to the status "${currentStatusTrack}".`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
}

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const userData = sessionAttributes.userData || 'ID não encontrado.';

        return handlerInput.responseBuilder
            .speak(`Olá denovo ${userData.username}`)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        StatusUpdateContentIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();