const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    // First check if g++ is available
    exec('g++ --version', (gppError) => {
      if (gppError) {
        reject(new Error('G++ compiler is not installed. Please install MinGW or another C++ compiler for Windows.'));
        return;
      }

      // If g++ is available, proceed with compilation and execution
      const isWindows = process.platform === 'win32';
      const executableName = isWindows ? `${jobId}.exe` : `${jobId}.out`;
      const executablePath = path.join(outputPath, executableName);
      
      const compileCommand = `g++ ${filepath} -o ${executablePath}`;
      const runCommand = isWindows 
        ? `cd ${outputPath} && ${executableName} < ${inputPath}`
        : `cd ${outputPath} && ./${jobId}.out < ${inputPath}`;

      exec(compileCommand, (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          reject(new Error(`Compilation failed: ${compileStderr}`));
          return;
        }

        exec(runCommand, (runError, runStdout, runStderr) => {
          if (runError) {
            reject(new Error(`Execution failed: ${runStderr || runError.message}`));
            return;
          }
          if (runStderr) {
            reject(new Error(`Runtime error: ${runStderr}`));
            return;
          }
          resolve(runStdout);
        });
      });
    });
  });
};

module.exports = {
  executeCpp,
};
