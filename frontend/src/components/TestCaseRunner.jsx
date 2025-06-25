import React from 'react';

const TestCaseRunner = ({ testCases, testResults, onRunTests, submissionResults }) => {
    const getResultForTestCase = (index) => {
        return testResults.find(result => result.testCase === index + 1);
    };

    const getSubmissionResultForTestCase = (index) => {
        if (!submissionResults) return null;
        return submissionResults.results.find(result => result.testCase === index + 1);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Cases</h2>
            
            <div className="space-y-4">
                {testCases.map((testCase, index) => {
                    const testResult = getResultForTestCase(index);
                    const submissionResult = getSubmissionResultForTestCase(index);
                    const isHidden = testCase.isHidden;
                    
                    return (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium text-gray-900">
                                    Test Case {index + 1}
                                    {isHidden && <span className="ml-2 text-xs text-gray-500">(Hidden)</span>}
                                </h3>
                                {!isHidden && (
                                    <button
                                        onClick={() => onRunTests(index)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
                                    >
                                        Run
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Input:</label>
                                    <pre className="bg-gray-50 p-2 rounded text-sm font-mono whitespace-pre-wrap">
                                        {testCase.input}
                                    </pre>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output:</label>
                                    <pre className="bg-gray-50 p-2 rounded text-sm font-mono whitespace-pre-wrap">
                                        {testCase.expectedOutput}
                                    </pre>
                                </div>
                            </div>

                            {/* Test Results */}
                            {(testResult || submissionResult) && (
                                <div className="mt-3 p-3 rounded border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">Result:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            (testResult?.passed || submissionResult?.passed) 
                                                ? 'text-green-600 bg-green-100' 
                                                : 'text-red-600 bg-red-100'
                                        }`}>
                                            {(testResult?.passed || submissionResult?.passed) ? 'PASSED' : 'FAILED'}
                                        </span>
                                    </div>
                                    
                                    {testResult && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Output:</label>
                                            <pre className="bg-gray-50 p-2 rounded text-sm font-mono whitespace-pre-wrap">
                                                {testResult.actualOutput}
                                            </pre>
                                            
                                            {/* Debug info - show normalized outputs */}
                                            {testResult.normalizedOutput !== undefined && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    <div><strong>Normalized Expected:</strong> "{testResult.normalizedExpected}"</div>
                                                    <div><strong>Normalized Output:</strong> "{testResult.normalizedOutput}"</div>
                                                    <div><strong>Match:</strong> {testResult.normalizedOutput === testResult.normalizedExpected ? 'Yes' : 'No'}</div>
                                                </div>
                                            )}
                                            
                                            {testResult.error && (
                                                <div className="mt-2 text-red-600 text-sm">
                                                    Error: {testResult.error}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Submission Results Summary */}
            {submissionResults && (
                <div className="mt-6 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                    <h3 className="font-semibold text-gray-900 mb-2">Submission Results</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                            {submissionResults.allPassed 
                                ? '🎉 Congratulations! All test cases passed!' 
                                : '❌ Some test cases failed. Please check your solution.'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            submissionResults.allPassed 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-red-600 bg-red-100'
                        }`}>
                            {submissionResults.allPassed ? 'ACCEPTED' : 'WRONG ANSWER'}
                        </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                        Passed: {submissionResults.results.filter(r => r.passed).length} / {submissionResults.results.length} test cases
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestCaseRunner; 