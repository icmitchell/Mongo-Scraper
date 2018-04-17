var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NewArticle = new Schema({
  headline: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: false,
  },
  link: {
    type: String,
    required: false
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", NewArticle);
module.exports = Article;
