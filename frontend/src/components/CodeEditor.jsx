import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism.css';

const escapeHtml = (str) =>
  str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const highlightCode = (code) => {
    try {
        const highlighted = Prism.highlight(code, Prism.languages.cpp, 'cpp');
        // If Prism returns empty or unchanged, fallback to escape
        if (!highlighted || highlighted === code) {
            return escapeHtml(code);
        }
        return highlighted;
    } catch (error) {
        console.warn('Syntax highlighting error:', error);
        return escapeHtml(code);
    }
};

const CodeEditor = ({ code, onCodeChange, onRunTests, onSubmit, isSubmitting }) => {
    return (
        <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
                <Editor
                    value={code}
                    onValueChange={onCodeChange}
                    highlight={highlightCode}
                    padding={15}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: '400px'
                    }}
                    className="bg-gray-900 text-gray-100"
                />
            </div>
            
            <div className="flex space-x-4">
                <button
                    onClick={() => onRunTests()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Run All Tests
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                </button>
            </div>
        </div>
    );
};

export default CodeEditor; 