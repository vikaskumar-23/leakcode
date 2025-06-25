const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');

dotenv.config();

const aiCodeReview = async (code, problemTitle = '', problemStatement = '') => {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_google_api_key_here') {
        throw new Error('Google API key is not configured. Please set GOOGLE_API_KEY in your .env file. Get a free API key from https://makersuite.google.com/app/apikey');
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
        
        // Create a context-aware prompt
        let prompt = `You are an expert programming mentor reviewing a student's code. Provide constructive feedback that helps them improve without giving away the complete solution.

**Review Guidelines:**
- Be encouraging and supportive
- Point out what's done well
- Identify potential issues or improvements
- Suggest general approaches, not exact solutions
- Keep feedback concise (2-3 paragraphs max)
- Focus on code structure, logic, and best practices

**Code to Review:**
\`\`\`cpp
${code}
\`\`\``;

        // Add problem context if available
        if (problemTitle && problemStatement) {
            prompt += `

**Problem Context:**
Title: ${problemTitle}
Statement: ${problemStatement}

Please review this code specifically for the given problem. Consider:
- Does the approach align with the problem requirements?
- Are there any logical gaps in the solution?
- Could the code be more efficient or readable?
- Are there edge cases that might be missed?`;
        }

        prompt += `

**Remember:** Don't provide the complete solution. Instead, guide the student toward the right approach with hints and suggestions.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        if (error.message.includes('API key')) {
            throw new Error('Invalid Google API key. Please check your API key in the .env file.');
        }
        throw new Error(`AI review failed: ${error.message}`);
    }
};

module.exports = {
    aiCodeReview,
};
