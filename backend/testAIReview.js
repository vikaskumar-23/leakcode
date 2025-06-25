const { aiCodeReview } = require('./aiCodeReview');

async function testAIReview() {
    console.log('Testing AI Code Review...\n');
    
    const sampleCode = `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`;

    const problemTitle = 'Sum of Two Numbers';
    const problemStatement = `Given two integers a and b, calculate their sum.

Input:
- Two integers a and b (1 ≤ a, b ≤ 1000)

Output:
- Print the sum of a and b

Example:
Input: 5 3
Output: 8`;

    try {
        console.log('Problem:', problemTitle);
        console.log('Code:');
        console.log(sampleCode);
        console.log('\nGetting AI review...\n');
        
        const review = await aiCodeReview(sampleCode, problemTitle, problemStatement);
        
        console.log('AI Review:');
        console.log('='.repeat(50));
        console.log(review);
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('Error:', error.message);
        
        if (error.message.includes('API key')) {
            console.log('\nTo fix this:');
            console.log('1. Get a free API key from: https://makersuite.google.com/app/apikey');
            console.log('2. Create a .env file in the backend directory');
            console.log('3. Add: GOOGLE_API_KEY=your_api_key_here');
        }
    }
}

testAIReview(); 