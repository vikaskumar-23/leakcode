const express = require('express');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { aiCodeReview } = require('../aiCodeReview');

const router = express.Router();

// Helper function to normalize output
const normalizeOutput = (output) => {
    if (!output) return '';
    return output
        .trim() // Remove leading/trailing whitespace
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n') // Convert remaining carriage returns
        .replace(/\n+/g, '\n') // Replace multiple newlines with single
        .trim(); // Trim again after normalization
};

// Get all problems with user's solved status
router.get('/', auth, async (req, res) => {
    try {
        const problems = await Problem.find({ isActive: true })
            .select('title difficulty tags createdAt')
            .sort({ createdAt: -1 });

        // Get user's solved problems
        const user = await User.findById(req.user._id).populate('solvedProblems.problemId');
        const solvedProblemIds = user.solvedProblems.map(sp => sp.problemId._id.toString());

        // Add solved status to each problem
        const problemsWithStatus = problems.map(problem => ({
            ...problem.toObject(),
            isSolved: solvedProblemIds.includes(problem._id.toString())
        }));

        res.json(problemsWithStatus);
    } catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single problem by ID with user's saved code
router.get('/:id', auth, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Get visible test cases only (first 3, not hidden)
        const visibleTestCases = problem.testCases
            .filter(tc => !tc.isHidden)
            .slice(0, 3);

        // Get user's saved code for this problem
        const user = await User.findById(req.user._id);
        const userCodeEntry = user.userCode.find(uc => uc.problemId.toString() === req.params.id);
        const savedCode = userCodeEntry ? userCodeEntry.code : '';

        // Check if the user has solved this problem
        const isSolved = user.solvedProblems.some(sp => sp.problemId.toString() === req.params.id);

        const problemData = {
            ...problem.toObject(),
            testCases: visibleTestCases,
            savedCode: savedCode,
            isSolved
        };

        res.json(problemData);
    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save user code for a problem
router.post('/:id/save-code', auth, async (req, res) => {
    try {
        const { code } = req.body;
        const problemId = req.params.id;

        const user = await User.findById(req.user._id);
        const existingCodeIndex = user.userCode.findIndex(uc => uc.problemId.toString() === problemId);

        if (existingCodeIndex !== -1) {
            // Update existing code
            user.userCode[existingCodeIndex].code = code;
            user.userCode[existingCodeIndex].lastUpdated = new Date();
        } else {
            // Add new code entry
            user.userCode.push({
                problemId,
                code,
                lastUpdated: new Date()
            });
        }

        await user.save();
        res.json({ message: 'Code saved successfully' });
    } catch (error) {
        console.error('Save code error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit solution
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const { code, language = 'cpp' } = req.body;
        const problemId = req.params.id;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Save the code first
        const user = await User.findById(req.user._id);
        const existingCodeIndex = user.userCode.findIndex(uc => uc.problemId.toString() === problemId);

        if (existingCodeIndex !== -1) {
            user.userCode[existingCodeIndex].code = code;
            user.userCode[existingCodeIndex].lastUpdated = new Date();
        } else {
            user.userCode.push({
                problemId,
                code,
                lastUpdated: new Date()
            });
        }

        // Get all test cases (including hidden ones)
        const allTestCases = problem.testCases;
        
        const results = [];
        let allPassed = true;

        // Run all test cases
        for (let i = 0; i < allTestCases.length; i++) {
            const testCase = allTestCases[i];
            try {
                const { generateFile } = require('../generateFile');
                const { generateInputFile } = require('../generateInputFile');
                const { executeCpp } = require('../executeCpp');

                const filePath = generateFile(language, code);
                const inputPath = generateInputFile(testCase.input);
                const output = await executeCpp(filePath, inputPath);

                // Normalize outputs for comparison
                const normalizedOutput = normalizeOutput(output);
                const normalizedExpected = normalizeOutput(testCase.expectedOutput);

                const passed = normalizedOutput === normalizedExpected;
                results.push({
                    testCase: i + 1,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: output, // Keep original output for display
                    normalizedOutput: normalizedOutput, // Add normalized for debugging
                    normalizedExpected: normalizedExpected, // Add normalized for debugging
                    passed,
                    isHidden: testCase.isHidden
                });

                if (!passed) {
                    allPassed = false;
                }
            } catch (error) {
                results.push({
                    testCase: i + 1,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: 'Error',
                    passed: false,
                    isHidden: testCase.isHidden,
                    error: error.message
                });
                allPassed = false;
            }
        }

        // If all test cases passed, mark problem as solved
        if (allPassed) {
            const existingSolution = user.solvedProblems.find(
                sp => sp.problemId.toString() === problemId
            );

            if (!existingSolution) {
                user.solvedProblems.push({
                    problemId,
                    solvedAt: new Date(),
                    submissionCount: 1
                });
            } else {
                existingSolution.submissionCount += 1;
            }
        }

        await user.save();

        res.json({
            results,
            allPassed,
            problemId
        });
    } catch (error) {
        console.error('Submit solution error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Run test cases (visible ones only)
router.post('/:id/run', auth, async (req, res) => {
    try {
        const { code, language = 'cpp', testCaseIndex } = req.body;
        const problemId = req.params.id;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Save the code
        const user = await User.findById(req.user._id);
        const existingCodeIndex = user.userCode.findIndex(uc => uc.problemId.toString() === problemId);

        if (existingCodeIndex !== -1) {
            user.userCode[existingCodeIndex].code = code;
            user.userCode[existingCodeIndex].lastUpdated = new Date();
        } else {
            user.userCode.push({
                problemId,
                code,
                lastUpdated: new Date()
            });
        }
        await user.save();

        // Get visible test cases only
        const visibleTestCases = problem.testCases
            .filter(tc => !tc.isHidden)
            .slice(0, 3);

        const results = [];

        if (testCaseIndex !== undefined) {
            // Run specific test case
            const testCase = visibleTestCases[testCaseIndex];
            if (!testCase) {
                return res.status(400).json({ error: 'Invalid test case index' });
            }

            try {
                const { generateFile } = require('../generateFile');
                const { generateInputFile } = require('../generateInputFile');
                const { executeCpp } = require('../executeCpp');

                const filePath = generateFile(language, code);
                const inputPath = generateInputFile(testCase.input);
                const output = await executeCpp(filePath, inputPath);

                // Normalize outputs for comparison
                const normalizedOutput = normalizeOutput(output);
                const normalizedExpected = normalizeOutput(testCase.expectedOutput);

                results.push({
                    testCase: testCaseIndex + 1,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: output,
                    normalizedOutput: normalizedOutput,
                    normalizedExpected: normalizedExpected,
                    passed: normalizedOutput === normalizedExpected
                });
            } catch (error) {
                results.push({
                    testCase: testCaseIndex + 1,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: 'Error',
                    passed: false,
                    error: error.message
                });
            }
        } else {
            // Run all visible test cases
            for (let i = 0; i < visibleTestCases.length; i++) {
                const testCase = visibleTestCases[i];
                try {
                    const { generateFile } = require('../generateFile');
                    const { generateInputFile } = require('../generateInputFile');
                    const { executeCpp } = require('../executeCpp');

                    const filePath = generateFile(language, code);
                    const inputPath = generateInputFile(testCase.input);
                    const output = await executeCpp(filePath, inputPath);

                    // Normalize outputs for comparison
                    const normalizedOutput = normalizeOutput(output);
                    const normalizedExpected = normalizeOutput(testCase.expectedOutput);

                    results.push({
                        testCase: i + 1,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: output,
                        normalizedOutput: normalizedOutput,
                        normalizedExpected: normalizedExpected,
                        passed: normalizedOutput === normalizedExpected
                    });
                } catch (error) {
                    results.push({
                        testCase: i + 1,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: 'Error',
                        passed: false,
                        error: error.message
                    });
                }
            }
        }

        res.json({ results });
    } catch (error) {
        console.error('Run test cases error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// AI Code Review endpoint
router.post('/:id/review', auth, async (req, res) => {
    try {
        const { code } = req.body;
        const problemId = req.params.id;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Save the code first
        const user = await User.findById(req.user._id);
        const existingCodeIndex = user.userCode.findIndex(uc => uc.problemId.toString() === problemId);

        if (existingCodeIndex !== -1) {
            user.userCode[existingCodeIndex].code = code;
            user.userCode[existingCodeIndex].lastUpdated = new Date();
        } else {
            user.userCode.push({
                problemId,
                code,
                lastUpdated: new Date()
            });
        }
        await user.save();

        // Get AI review with problem context
        const review = await aiCodeReview(code, problem.title, problem.statement);

        res.json({ review });
    } catch (error) {
        console.error('AI review error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 