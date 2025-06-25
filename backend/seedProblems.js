const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

const connectDB = require('./config/db');

// Function to generate test cases for each problem
const generateTestCases = (problemType, count = 5) => {
    const testCases = [];
    
    switch (problemType) {
        case 'sum':
            for (let i = 0; i < count; i++) {
                const a = Math.floor(Math.random() * 1000) + 1;
                const b = Math.floor(Math.random() * 1000) + 1;
                testCases.push({
                    input: `${a} ${b}`,
                    expectedOutput: `${a + b}`,
                    isHidden: i >= 3 // First 3 visible, rest hidden
                });
            }
            break;
            
        case 'twoSum':
            for (let i = 0; i < count; i++) {
                const n = Math.floor(Math.random() * 10) + 5; // 5-15 elements
                const target = Math.floor(Math.random() * 100) + 10;
                const nums = [];
                for (let j = 0; j < n; j++) {
                    nums.push(Math.floor(Math.random() * 50) + 1);
                }
                // Ensure there's a valid solution
                const idx1 = Math.floor(Math.random() * n);
                const idx2 = Math.floor(Math.random() * n);
                if (idx1 !== idx2) {
                    nums[idx1] = Math.floor(target / 2);
                    nums[idx2] = target - nums[idx1];
                }
                testCases.push({
                    input: `${n}\n${nums.join(' ')}\n${target}`,
                    expectedOutput: `${Math.min(idx1, idx2)} ${Math.max(idx1, idx2)}`,
                    isHidden: i >= 3
                });
            }
            break;
            
        case 'pattern':
            for (let i = 0; i < count; i++) {
                const n = Math.floor(Math.random() * 8) + 3; // 3-10
                let expected = '';
                for (let row = 1; row <= n; row++) {
                    for (let col = 1; col <= row; col++) {
                        expected += '*';
                    }
                    if (row < n) expected += '\n';
                }
                testCases.push({
                    input: `${n}`,
                    expectedOutput: expected,
                    isHidden: i >= 3
                });
            }
            break;
            
        case 'factorial':
            for (let i = 0; i < count; i++) {
                const n = Math.floor(Math.random() * 10) + 1; // 1-10
                let factorial = 1;
                for (let j = 2; j <= n; j++) {
                    factorial *= j;
                }
                testCases.push({
                    input: `${n}`,
                    expectedOutput: `${factorial}`,
                    isHidden: i >= 3
                });
            }
            break;
            
        case 'fibonacci':
            for (let i = 0; i < count; i++) {
                const n = Math.floor(Math.random() * 20) + 1; // 1-20
                let fib = [0, 1];
                for (let j = 2; j <= n; j++) {
                    fib[j] = fib[j-1] + fib[j-2];
                }
                testCases.push({
                    input: `${n}`,
                    expectedOutput: `${fib[n]}`,
                    isHidden: i >= 3
                });
            }
            break;
    }
    
    return testCases;
};

const problems = [
    {
        title: "Sum of Two Numbers",
        statement: `Write a program to find the sum of two numbers.

Input:
- Two integers a and b separated by a space

Output:
- Print the sum of a and b

Example:
Input: 5 3
Output: 8

Input: 10 20
Output: 30`,
        difficulty: "Easy",
        timeLimit: 1000,
        memoryLimit: 256,
        constraints: "1 ≤ a, b ≤ 1000",
        examples: [
            {
                input: "5 3",
                output: "8",
                explanation: "5 + 3 = 8"
            },
            {
                input: "10 20",
                output: "30",
                explanation: "10 + 20 = 30"
            }
        ],
        tags: ["Basic Math", "Input/Output"],
        testCases: generateTestCases('sum')
    },
    {
        title: "Two Sum Problem",
        statement: `Given an array of integers and a target sum, find two numbers in the array that add up to the target.

Input:
- First line: n (number of elements in array)
- Second line: n space-separated integers
- Third line: target sum

Output:
- Print the indices of the two numbers (0-indexed) that add up to the target

Example:
Input:
4
2 7 11 15
9

Output:
0 1

Explanation: nums[0] + nums[1] = 2 + 7 = 9`,
        difficulty: "Easy",
        timeLimit: 1000,
        memoryLimit: 256,
        constraints: "2 ≤ n ≤ 100, 1 ≤ nums[i] ≤ 50, 1 ≤ target ≤ 100",
        examples: [
            {
                input: "4\n2 7 11 15\n9",
                output: "0 1",
                explanation: "nums[0] + nums[1] = 2 + 7 = 9"
            }
        ],
        tags: ["Arrays", "Hash Table"],
        testCases: generateTestCases('twoSum')
    },
    {
        title: "Print Star Pattern",
        statement: `Print a right-angled triangle pattern using asterisks (*).

Input:
- An integer n representing the number of rows

Output:
- Print the pattern with n rows

Example:
Input: 4
Output:
*
**
***
****

Input: 3
Output:
*
**
***`,
        difficulty: "Easy",
        timeLimit: 1000,
        memoryLimit: 256,
        constraints: "1 ≤ n ≤ 10",
        examples: [
            {
                input: "4",
                output: "*\n**\n***\n****",
                explanation: "Print n rows with increasing number of stars"
            },
            {
                input: "3",
                output: "*\n**\n***",
                explanation: "Print 3 rows with 1, 2, and 3 stars respectively"
            }
        ],
        tags: ["Patterns", "Loops"],
        testCases: generateTestCases('pattern')
    },
    {
        title: "Calculate Factorial",
        statement: `Calculate the factorial of a given number n.

Input:
- An integer n

Output:
- Print the factorial of n (n!)

Example:
Input: 5
Output: 120

Explanation: 5! = 5 × 4 × 3 × 2 × 1 = 120

Input: 3
Output: 6

Explanation: 3! = 3 × 2 × 1 = 6`,
        difficulty: "Easy",
        timeLimit: 1000,
        memoryLimit: 256,
        constraints: "0 ≤ n ≤ 10",
        examples: [
            {
                input: "5",
                output: "120",
                explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120"
            },
            {
                input: "3",
                output: "6",
                explanation: "3! = 3 × 2 × 1 = 6"
            }
        ],
        tags: ["Math", "Recursion"],
        testCases: generateTestCases('factorial')
    },
    {
        title: "Fibonacci Number",
        statement: `Find the nth Fibonacci number.

The Fibonacci sequence is defined as:
F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2) for n > 1

Input:
- An integer n

Output:
- Print the nth Fibonacci number

Example:
Input: 6
Output: 8

Explanation: F(6) = F(5) + F(4) = 5 + 3 = 8

Input: 4
Output: 3

Explanation: F(4) = F(3) + F(2) = 2 + 1 = 3`,
        difficulty: "Easy",
        timeLimit: 1000,
        memoryLimit: 256,
        constraints: "0 ≤ n ≤ 20",
        examples: [
            {
                input: "6",
                output: "8",
                explanation: "F(6) = F(5) + F(4) = 5 + 3 = 8"
            },
            {
                input: "4",
                output: "3",
                explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3"
            }
        ],
        tags: ["Math", "Dynamic Programming"],
        testCases: generateTestCases('fibonacci')
    }
];

const seedProblems = async () => {
    try {
        await connectDB();
        
        // Clear existing problems
        await Problem.deleteMany({});
        console.log('Cleared existing problems');
        
        // Insert new problems
        const insertedProblems = await Problem.insertMany(problems);
        console.log(`Inserted ${insertedProblems.length} problems`);
        
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedProblems(); 