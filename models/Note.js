var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NewNote = new Schema({
	noteBody: {
		type: String,
		required: true
	}
});

var Note = mongoose.model("Note", NewNote);
module.exports = Note;
