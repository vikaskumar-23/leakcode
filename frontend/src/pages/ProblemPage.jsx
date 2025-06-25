import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CodeEditor from '../components/CodeEditor';
import TestCaseRunner from '../components/TestCaseRunner';
import AIReview from '../components/AIReview';

const ProblemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [testResults, setTestResults] = useState([]);
    const [submissionResults, setSubmissionResults] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunningTests, setIsRunningTests] = useState(false);

    useEffect(() => {
        fetchProblem();
    }, [id]);

    useEffect(() => {
        // Keyboard shortcuts
        const handleKeyDown = (e) => {
            // Ctrl + '
            if (e.ctrlKey && e.key === "'") {
                e.preventDefault();
                handleRunTests();
            }
            // Ctrl + Enter
            if (e.ctrlKey && (e.key === "Enter" || e.keyCode === 13)) {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [code]);

    const fetchProblem = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/problems/${id}`);
            setProblem(response.data);
            
            // Use saved code if available, otherwise use default template
            if (response.data.savedCode && response.data.savedCode.trim() !== '') {
                setCode(response.data.savedCode);
            } else {
                // Set default code template based on problem type
                setCode(getDefaultCode());
            }
        } catch (error) {
            setError('Failed to fetch problem');
            console.error('Error fetching problem:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDefaultCode = () => {
        return `#include <bits/stdc++.h>
using namespace std;

int main() {
    //Code here
    return 0;
}`;
    };

    const handleRunTests = async (testCaseIndex = null) => {
        setIsRunningTests(true);
        try {
            const payload = {
                code,
                language: 'cpp',
                ...(testCaseIndex !== null && { testCaseIndex })
            };

            const response = await axios.post(`http://localhost:8000/api/problems/${id}/run`, payload);
            setTestResults(response.data.results);
        } catch (error) {
            setError('Failed to run tests');
            console.error('Error running tests:', error);
        } finally {
            setIsRunningTests(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`http://localhost:8000/api/problems/${id}/submit`, {
                code,
                language: 'cpp'
            });

            setSubmissionResults(response.data);
            
            if (response.data.allPassed) {
                // Refresh user data to update solved problems
                // window.location.reload();
            }
        } catch (error) {
            setError('Failed to submit solution');
            console.error('Error submitting solution:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading problem...</div>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-red-600">{error || 'Problem not found'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                ← Back to Problems
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        problem.difficulty === 'Easy' ? 'text-green-600 bg-green-100' :
                                        problem.difficulty === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
                                        'text-red-600 bg-red-100'
                                    }`}>
                                        {problem.difficulty}
                                    </span>
                                    {problem.tags && problem.tags.map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                            {tag}
                                        </span>
                                    ))}
                                    {problem.isSolved && (
                                        <span className="text-green-600 text-xs font-semibold border border-green-400 bg-green-50 px-2 py-1 rounded">
                                            ✓ Solved
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            Welcome, {user?.username}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Problem Statement */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Statement</h2>
                        <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 mb-6">
                                {problem.statement}
                            </div>
                            
                            {problem.constraints && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Constraints:</h3>
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        {problem.constraints}
                                    </div>
                                </div>
                            )}

                            {problem.examples && problem.examples.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Example:</h3>
                                    {problem.examples.map((example, index) => (
                                        <div key={index} className="mb-4 bg-gray-50 p-3 rounded">
                                            <div className="mb-2">
                                                <strong>Input:</strong>
                                                <pre className="text-sm mt-1">{example.input}</pre>
                                            </div>
                                            <div className="mb-2">
                                                <strong>Output:</strong>
                                                <pre className="text-sm mt-1">{example.output}</pre>
                                            </div>
                                            {example.explanation && (
                                                <div>
                                                    <strong>Explanation:</strong>
                                                    <p className="text-sm mt-1">{example.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Editor</h2>
                        <CodeEditor
                            code={code}
                            onCodeChange={setCode}
                            onRunTests={handleRunTests}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>

                {/* Test Cases */}
                <div className="mt-8">
                    {isRunningTests ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="text-blue-700 text-lg font-medium">Running test cases...</div>
                        </div>
                    ) : (
                        <TestCaseRunner
                            testCases={problem.testCases}
                            testResults={testResults}
                            onRunTests={handleRunTests}
                            submissionResults={submissionResults}
                        />
                    )}
                </div>

                {/* AI Code Review */}
                <div className="mt-8">
                    <AIReview
                        problemId={id}
                        code={code}
                        onReviewComplete={(review) => {
                            console.log('AI Review completed:', review);
                        }}
                    />
                </div>

                {/* Submission Success Message */}
                {submissionResults && submissionResults.allPassed && (
                  <div className="my-6 flex flex-col items-center justify-center">
                    <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-lg flex items-center space-x-3">
                      <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold text-lg">
                        {submissionResults.results.length}/{submissionResults.results.length} test cases passed, congratulations!
                      </span>
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
};

export default ProblemPage; 