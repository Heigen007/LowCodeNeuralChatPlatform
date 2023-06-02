require('dotenv').config();

var express = require('express');
const natural = require('natural');
const cors = require('cors');
const { Configuration, OpenAIApi } = require("openai");
const makeRequestQuestion = require('./askGpt.js');

var port = process.env.PORT || 3000;
var app = express();
const configuration = new Configuration({
    apiKey: process.env['API_KEY'],
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(cors());

app.post('/getAnswer', async function (req, res) {
    const { BDContent, Question } = req.body;
    const relevantContext = findMostRelevantContext(Question, BDContent);
    console.log(Question, relevantContext.context);
    var result = await makeRequestQuestion(relevantContext.content, Question, openai);
    res.send({ result: result, context: relevantContext.context});
});

function createTfidf(contexts) {
    const tfidf = new natural.TfIdf();

    contexts.forEach((context, index) => {
        tfidf.addDocument(context, index.toString());
    });

    return { tfidf, contexts };
}

function findMostRelevant(tfidfData, sentence) {
    const items = [];
    tfidfData.tfidf.tfidfs(sentence, function(i, measure) {
        items.push({
            context: tfidfData.contexts[i],
            relevance: measure
        });
    });

    items.sort((a, b) => b.relevance - a.relevance);

    return items.length > 0 ? items[0] : null;
}

function findMostRelevantContext(question, bdContent) {
    const tfidfData = createTfidf(bdContent.Context);
    const mostRelevant = findMostRelevant(tfidfData, question);
    const mostRelevantContextIndex = bdContent.Context.findIndex(context => context === mostRelevant.context);
    const mostRelevantContent = bdContent.Content[mostRelevantContextIndex];

    return {
        context: mostRelevant.context,
        content: mostRelevantContent
    };
}

app.listen(port, function () {
    console.log('App listening on port ' + port);
});