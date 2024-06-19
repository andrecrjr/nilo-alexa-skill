const Alexa = require('ask-sdk-core');

const ReadCollectionContentIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadCollectionContent');
    },
    async handle(handlerInput) {

    },

}