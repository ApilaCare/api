var mongoose = require('mongoose');

var issueCommentSchema = new mongoose.Schema({
    author: {type: String, required: true},
    commentText: {type: String, required: true},
    createdOn: {type: Date, default: Date.now}
});

var issueChecklistSchema = new mongoose.Schema({
    author: {type: String, required: true},
    createdOn: {type: Date, default: Date.now},
    checklistName: {type: String, required: true},
    checkItemsChecked: {type: Number, required: true, default: 0},
    checkItems: [mongoose.Schema.Types.Mixed] //this should include a ["name" as string, "checked" as boolean]
});

var issueLabelsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    color: {type: String, required: true},
});

var issueMembersSchema = new mongoose.Schema({
  name: {type: String, required: true}
});

var issueAttachmentsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    source: {type: String, required: true},
    url: {type: String, required: true},
    uploadedOn: {type: Date, default: Date.now},
    uploader: {type: String, required: true},
    type: {type: String, required: true}
});

var issueSchema = new mongoose.Schema({
    title: {type: String,required: true},
    responsibleParty: {type: String,required: true},
    resolutionTimeframe: {type: String, required: true},
    submitDate: {type: Date, default: Date.now},
    submitBy: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, required: true, default: "Open"}, // choose from ["Open", "Shelved", "Closed"]
    checklists: [issueChecklistSchema],
    comments: [issueCommentSchema],
    labels: [issueLabelsSchema],
    attachments: [issueAttachmentsSchema],
    idAttachmentCover: {type: String},
    idMembers: [issueMembersSchema],
    idLabels: [String],
    updateInfo: [mongoose.Schema.Types.Mixed]
});

mongoose.model('Issue', issueSchema);

/* adding documents to mongodb
db.issues.save({

})
*/
