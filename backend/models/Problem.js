const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    expectedOutput: {
        type: String,
        required: true
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: ''
    }
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    statement: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    timeLimit: {
        type: Number,
        default: 2000, // milliseconds
        required: true
    },
    memoryLimit: {
        type: Number,
        default: 256, // megabytes
        required: true
    },
    testCases: [testCaseSchema],
    constraints: {
        type: String,
        default: ''
    },
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Problem', problemSchema); 