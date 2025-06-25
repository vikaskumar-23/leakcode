const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');
const fs = require('fs');
const path = require('path');

function testCodeExecution() {
    try {
        console.log('Testing code execution...');
        
        // Test code
        const testCode = `#include <iostream>
using namespace std;

int main() {
    int num1, num2;
    cin >> num1 >> num2;
    cout << "Sum: " << num1 + num2 << endl;
    return 0;
}`;
        
        const testInput = "5 3";
        
        console.log('1. Generating file...');
        const filePath = generateFile('cpp', testCode);
        console.log('File generated at:', filePath);
        
        console.log('2. Generating input file...');
        const inputPath = generateInputFile(testInput);
        console.log('Input file generated at:', inputPath);
        
        console.log('3. Executing code...');
        const output = executeCpp(filePath, inputPath);
        console.log('Output:', output);
        
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testCodeExecution(); 