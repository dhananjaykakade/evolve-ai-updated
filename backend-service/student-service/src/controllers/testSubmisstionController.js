import ResponseHandler from '../utils/CustomResponse.js';
import apiHandler from '../utils/ApiHandler.js';
import axios from 'axios';
import fs from "fs";
import path from "path";



const generateJSWrapper = (functionName, parameterType, input) => {
    if (parameterType === 'number,number') {
      return `
  console.log(${functionName}(${input}));
  `;
    }
  
    if (parameterType === 'array') {
      return `
  const arr = ${input};
  console.log(${functionName}(arr));
  `;
    }
  
    if (parameterType === 'string') {
      return `
  const str = ${JSON.stringify(input)};
  console.log(${functionName}(str));
  `;
    }
  
    if (parameterType === 'number') {
      return `
  console.log(${functionName}(${input}));
  `;
    }
  
    // Default fallback (stringified input)
    return `
  const input = ${JSON.stringify(input)};
  console.log(${functionName}(input));
  `;
  };
  
 const generatePythonWrapper = (functionName, parameterType, input) => {
    let inputCode = '';
    let parsedInput = 'input_data';
  
    switch (parameterType) {
      case 'number':
        inputCode = `
  import sys
  input_data = sys.stdin.read().strip()
  n = int(input_data)
  print(${functionName}(n))
        `;
        break;
  
      case 'number,number':
        inputCode = `
  import sys
  input_data = sys.stdin.read().strip()
  a, b = map(int, input_data.split(","))
  print(${functionName}(a, b))
        `;
        break;
  
      case 'array':
        inputCode = `
  import sys, json
  input_data = sys.stdin.read().strip()
  arr = json.loads(input_data)
  print(${functionName}(arr))
        `;
        break;
  
      case 'string':
      default:
        inputCode = `
  import sys
  input_data = sys.stdin.read().strip()
  print(${functionName}(input_data))
        `;
        break;
    }
  
    return inputCode.trim();
  };
  

const tempDir = path.join(process.cwd(), "temp-code");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// export const executeCode = apiHandler(async (req, res) => {

//     const { code, language, testCases = [], functionName, parameterType } = req.body;
  
//     if (!code || !language || !functionName || !parameterType) {
//       return ResponseHandler.badRequest(res, "Code, language, functionName and parameterType are required.");
//     }
  
//     if (!Array.isArray(testCases) || testCases.length === 0) {
//       return ResponseHandler.badRequest(res, "At least one test case is required.");
//     }
  
//     const jobId = uuidv4();
//     const extension = language === "python" ? "py" : "js";
//     const dockerImage = language === "python" ? "python:3.10" : "node:18";
//     const results = [];
  
//     try {
//       for (const testCase of testCases) {
//         const { input, expectedOutput } = testCase;
  
//         const wrapper = language === "python"
//           ? generatePythonWrapper(functionName, parameterType, input)
//           : generateJSWrapper(functionName, parameterType, input);
  
//         const fullCode = `${code}\n\n${wrapper}`;
//         const filename = `${jobId}-${Date.now()}.${extension}`;
//         const filePath = path.join(tempDir, filename);
//         fs.writeFileSync(filePath, fullCode);
  
//         const execCommand = language === "python"
//           ? `python /code/${filename}`
//           : `node /code/${filename}`;
  
//         const dockerArgs = [
//           'run', '--rm', '-i', '-m', '128m',
//           '-v', `${tempDir}:/code`,
//           dockerImage,
//           'bash', '-c', execCommand
//         ];
  
//         const result = await new Promise((resolve) => {
//           const proc = spawn('docker', dockerArgs);
//           let stdout = '';
//           let stderr = '';
  
//           proc.stdin.write(input + '\n'); // pass input to stdin
//           proc.stdin.end();
  
//           proc.stdout.on('data', (data) => {
//             stdout += data.toString();
//           });
  
//           proc.stderr.on('data', (data) => {
//             stderr += data.toString();
//           });
  
//           proc.on('close', () => {
//             fs.existsSync(filePath) && fs.unlinkSync(filePath);
  
//             const trimmedOutput = stdout.trim();
//             resolve({
//               input,
//               expectedOutput,
//               output: trimmedOutput,
//               passed: trimmedOutput === expectedOutput,
//               error: !!stderr,
//             });
//           });
//         });
  
//         results.push(result);
//       }
  
//       return ResponseHandler.success(res, 200, "Code executed against test cases successfully", {
//         results,
//         metadata: {
//           totalCases: results.length,
//           passed: results.filter(r => r.passed).length,
//           failed: results.filter(r => !r.passed).length,
//           executionId: jobId,
//         },
//       });
//     } catch (error) {
//       return ResponseHandler.error(res, 500, "Execution failed", { error: error.message });
//     }
//   });


export const executeCode = apiHandler(async (req, res) => {
   try {
    const { code, language, testCases = [] } = req.body;
  
    if (!code || !language || testCases.length === 0) {
      return ResponseHandler.badRequest(res, 'code, language, and testCases are required.');
    }
  
    const languageMap = {
      'python': 71,
      'js': 63,
    };
  
    const language_id = languageMap[language];
    if (!language_id) return ResponseHandler.badRequest(res, 'Unsupported language.');
  
    const results = [];
  
    for (const testCase of testCases) {
      const { input, expectedOutput } = testCase;
  
      const submission = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        source_code: code,
        stdin: input,
        language_id
      }
    ,
    {
        headers: {
            "Content-Type": "application/json",
  "X-RapidAPI-Key": "c633de4138mshc4b27b66ddee833p1f6f20jsn59f9378e1914",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }
      });
  
      const output = submission.data.stdout?.trim() || '';
      const error = submission.data.stderr || submission.data.compile_output;
  
      results.push({
        input,
        expectedOutput,
        output,
        error: !!error,
        passed: !error && output === expectedOutput,
      });
    }
  
    return ResponseHandler.success(res, 200, 'Executed via Judge0', {
      results,
      metadata: {
        totalCases: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
      },
    });
   } catch (error) {
     console.error("Error in executeCode:", error.message);
     return ResponseHandler.error(res, 500, "Failed to execute code.");
    
   }
  });