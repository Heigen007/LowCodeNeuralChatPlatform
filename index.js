var express = require('express');
const natural = require('natural');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

var port = process.env.PORT || 3000;
var app = express();

app.use(express.json());
app.use(cors());


app.post('/getAnswer', function (req, res) {
    console.log(req.body);
    res.send('Hello World!');
});

function createTfidf(dir) {
  const tfidf = new natural.TfIdf();
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const data = fs.readFileSync(path.join(dir, file), 'utf-8');
    tfidf.addDocument(data, file);
  });

  return { tfidf, files };
}

function findMostRelevant(tfidfData, sentence) {
  const items = [];
  tfidfData.tfidf.tfidfs(sentence, function(i, measure) {
    items.push({
      file: tfidfData.files[i],
      relevance: measure
    });
  });

  items.sort((a, b) => b.relevance - a.relevance);

  return items.length > 0 ? items[0].file : null;
}

app.listen(port, function () {
    console.log('App listening on port ' + port);
});

// Call these functions like this:
// const tfidfData = createTfidf('./contexts'); // Replace './context' with your directory if it's different
// console.log(findMostRelevant(tfidfData, 'your input sentence here')); // Replace with your sentence
