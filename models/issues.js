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

var memberRecoverSchema =  new mongoose.Schema({
    boss: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // the one who started the recvery
    chosenMember: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // random chosen member who needs to type the password to recover
    recoveredMember: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // the member we are recovering
    bossPasswordConfirmed: {type: Boolean}, // is the boss password submited and matching
    chosenMemberPasswordConfirmed: {type: Boolean}, // is the random member password submited and matching
    submitDate: {type: Date, default: Date.now} // the date when the recovery started
});

var issueSchema = new mongoose.Schema({
    title: {type: String,required: true},
    responsibleParty: {type: String,required: true},
    resolutionTimeframe: {type: String, required: true},
    submitDate: {type: Date, default: Date.now},
    shelvedDate: {type: Date},
    submitBy: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, required: true, default: "Open"}, // choose from ["Open", "Shelved", "Closed"]
    checklists: [issueChecklistSchema],
    comments: [issueCommentSchema],
    labels: [issueLabelsSchema],
    attachments: [issueAttachmentsSchema],
    idAttachmentCover: {type: String},
    idMembers: [issueMembersSchema],
    due: {type: Date},
    confidential: {type: Boolean},
    idLabels: [String],
    updateInfo: [mongoose.Schema.Types.Mixed],
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    }
});

mongoose.model('Issue', issueSchema);
mongoose.model('MemberRecover', memberRecoverSchema)

/* adding documents to mongodb
db.issues.save({

})
*/
