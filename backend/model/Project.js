const mongoose = require("mongoose");

const ContributionSchema = new mongoose.Schema({
    contributor: String,
    amount: Number,
    date: { type: Date, default: Date.now },
});

const ProjectSchema = new mongoose.Schema({
    projectNumber: Number,
    owner: String,
    name: String,
    url: String,
    fundingGoal: Number,
    totalFunds: Number,
    isCompleted: Boolean,
    deadline: Date,
    isExpired: Boolean,
    isWithdrawn: Boolean,
    contributions: [ContributionSchema],
});

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
module.exports = Project;