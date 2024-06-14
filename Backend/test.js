var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var result = sentiment.analyze("I don't think this is working");
console.dir(result);

/*
var frLanguage = {
    labels: { 'stupide': -2 },
    scoringStrategy: {
      apply: function(tokens, cursor, tokenScore) {
        if (cursor > 0) {
          var prevtoken = tokens[cursor - 1];
          if (prevtoken === 'pas') {
            tokenScore = -tokenScore;
          }
        }
        return tokenScore;
      }
    }
  };
  sentiment.registerLanguage('fr', frLanguage);
   
  var result = sentiment.analyze('Le chat n\'est pas stupide', { language: 'fr' });
  console.dir(result); 
*/