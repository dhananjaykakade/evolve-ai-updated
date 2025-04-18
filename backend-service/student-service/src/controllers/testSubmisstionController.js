import ResponseHandler from '../utils/CustomResponse.js';
import apiHandler from '../utils/ApiHandler.js';
import axios from 'axios';

export const executeCode = apiHandler(async (req, res) => {
  try {
    const { code, language, testCases = [], inputType = 'numberArray' } = req.body;

    if (!code || !language || testCases.length === 0) {
      return ResponseHandler.badRequest(res, 'code, language, and testCases are required.');
    }

    const languageMap = {
      'python': 71,
      'javascript': 63,
      'js': 63
    };

    const language_id = languageMap[language.toLowerCase()];
    if (!language_id) {
      return ResponseHandler.badRequest(res, 'Unsupported language.');
    }

    const wrapCode = (lang, code, inputType) => {
      if (lang === 63) { // JavaScript
        return `
${code}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let input = [];
rl.on('line', function (line) {
  input.push(line);
});

rl.on('close', function () {
  ${inputType === 'numberArray' ? `const parsed = input.map(Number); console.log(main(...parsed));` :
    inputType === 'stringArray' ? `console.log(main(...input));` :
    `console.log(main(input.join('\n')));`}
});
        `.trim();
      } else if (lang === 71) { // Python
        return `
${code}

import sys
input_lines = sys.stdin.read().splitlines()
${inputType === 'numberArray' ? `parsed = list(map(int, input_lines))
print(main(*parsed))` :
          inputType === 'stringArray' ? `print(main(*input_lines))` :
          `print(main('\n'.join(input_lines)))`}
        `.trim();
      } else {
        return code;
      }
    };

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const { input, expectedOutput } = testCases[i];
      const wrappedCode = wrapCode(language_id, code, inputType);

      try {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const submission = await axios.post(
          'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
          {
            source_code: wrappedCode,
            language_id,
            stdin: input,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": "c9b305005dmsh15e921b03ca7b35p107daajsn62e5211ca687",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            },
            timeout: 15000
          }
        );

        const output = submission.data.stdout?.trim() || '';
        const error = submission.data.stderr || submission.data.compile_output;

        results.push({
          input,
          expectedOutput,
          output,
          passed: output === expectedOutput,
          error: error || null
        });
      } catch (error) {
        console.error("Test case error:", error.message);
        results.push({
          input,
          expectedOutput,
          output: '',
          passed: false,
          error: error.response?.data?.message || error.message
        });
      }
    }
    console.log("Results:", results);
    console.log(code)

    return ResponseHandler.success(res, 200, 'Code executed successfully', {
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      }
    });

  } catch (error) {
    console.error("ExecuteCode Error:", error);
    return ResponseHandler.error(res, 500, "Internal server error", {
      error: error.message
    });
  }
});
