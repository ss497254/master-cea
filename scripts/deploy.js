#!/usr/bin/env bun
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const DEFAULT_DEPLOYMENTS_DIR = '/home/ss497254/settle/master-cea-prod';

class DeploymentManager {
  constructor(projectPath = null, deploymentsDir = DEFAULT_DEPLOYMENTS_DIR) {
    // Auto-detect project root or use provided path
    this.projectRoot = this.findProjectRoot(projectPath);
    this.distDir = path.join(this.projectRoot, 'dist');
    this.deploymentsDir = deploymentsDir;
    this.metadataFile = path.join(this.deploymentsDir, 'deployments.json');
    this.pidFile = path.join(this.deploymentsDir, 'server.pid');
    this.currentSymlink = path.join(this.deploymentsDir, 'current');
  }

  // Ensure deployment directory structure exists
  ensureDeploymentDirectory() {
    try {
      // Check if main deployment directory exists
      if (!fs.existsSync(this.deploymentsDir)) {
        throw new Error(`Deployment directory not found: ${this.deploymentsDir}. Run 'master-cea setup' first.`);
      }

      // Check logs subdirectory
      const logsDir = path.join(this.deploymentsDir, 'logs');
      if (!fs.existsSync(logsDir)) {
        throw new Error(`Logs directory not found: ${logsDir}. Run 'master-cea setup' first.`);
      }
    } catch (error) {
      console.error(`❌ Deployment directory validation failed: ${error.message}`);
      throw error;
    }
  }

  // Setup deployment directory and environment
  async setup() {
    try {
      console.log('🔧 Setting up Master CEA production environment...');
      console.log(`📁 Target directory: ${this.deploymentsDir}`);
      console.log('');

      // Create the main deployment directory
      if (!fs.existsSync(this.deploymentsDir)) {
        fs.mkdirSync(this.deploymentsDir, { recursive: true });
        console.log(`✅ Created deployment directory: ${this.deploymentsDir}`);
      } else {
        console.log(`ℹ️  Deployment directory already exists: ${this.deploymentsDir}`);
      }

      // Create logs subdirectory
      const logsDir = path.join(this.deploymentsDir, 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
        console.log(`✅ Created logs directory: ${logsDir}`);
      } else {
        console.log(`ℹ️  Logs directory already exists`);
      }

      // Setup environment file
      await this.setupEnvironmentFile();

      // Set proper permissions (readable/writable by owner)
      fs.chmodSync(this.deploymentsDir, 0o755);
      console.log(`✅ Set directory permissions`);

      // Create initial metadata file if it doesn't exist
      if (!fs.existsSync(this.metadataFile)) {
        const initialMetadata = {
          deployments: [],
          previousDeployment: null,
          currentDeployment: null,
          setupTimestamp: new Date().toISOString(),
          projectRoot: this.projectRoot,
        };
        this.saveDeploymentMetadata(initialMetadata);
        console.log(`✅ Created deployment metadata file`);
      }

      console.log('');
      console.log('🎉 Master CEA production environment setup completed!');
      console.log(`📋 Directory: ${this.deploymentsDir}`);
      console.log(`🔧 Environment: ${path.join(this.deploymentsDir, '.env')}`);
      console.log(`📊 Metadata: ${this.metadataFile}`);
      console.log('');
      console.log('💡 Next steps:');
      console.log('   1. Review and update the .env file with your configuration');
      console.log('   2. Build your project: bun run build:prod');
      console.log('   3. Deploy: master-cea deploy');
    } catch (error) {
      console.error(`❌ Setup failed: ${error.message}`);
      throw error;
    }
  }

  // Setup environment file from template
  async setupEnvironmentFile() {
    const envPath = path.join(this.deploymentsDir, '.env');
    const envExamplePath = path.join(this.projectRoot, '.env.example');

    try {
      // Check if .env already exists
      if (fs.existsSync(envPath)) {
        console.log(`ℹ️  Environment file already exists: ${envPath}`);
        return;
      }

      let envContent = '';

      // Check if .env.example exists in project
      if (!fs.existsSync(envExamplePath)) {
        console.log(`⚠️  No .env.example found in project root, creating basic .env template`);

        // Create a basic .env template
        envContent = `\
# Server Configuration
PORT=3000
NODE_ENV=production
`;
      } else {
        // Copy .env.example to .env
        envContent = fs.readFileSync(envExamplePath, 'utf8');
      }

      // Add production-specific header
      const productionEnvContent = `\
# Master CEA Production Environment
# Generated on ${new Date().toISOString()}

${envContent}`;

      fs.writeFileSync(envPath, productionEnvContent);
      console.log(`✅ Created .env file`);
    } catch (error) {
      console.error(`❌ Failed to setup environment file: ${error.message}`);
      throw error;
    }
  }

  // Find project root directory
  findProjectRoot(providedPath = null) {
    if (providedPath) {
      return path.resolve(providedPath);
    }

    // If script is run directly from project, use current directory
    let currentDir = process.cwd();

    // Check if current directory has package.json and dist folder (or can build)
    if (this.isValidProjectDirectory(currentDir)) {
      return currentDir;
    }

    // If script is symlinked globally, try to find project based on script location
    const scriptPath = fs.realpathSync(__filename);
    const scriptDir = path.dirname(scriptPath);
    const possibleProjectRoot = path.resolve(scriptDir, '..');

    if (this.isValidProjectDirectory(possibleProjectRoot)) {
      return possibleProjectRoot;
    }

    // Last resort: prompt user or use current directory
    console.log('⚠️  Could not auto-detect project root.');
    console.log(`   Using current directory: ${currentDir}`);
    console.log('   You can specify project path: master-cea --project /path/to/project deploy');
    return currentDir;
  }

  // Check if directory is a valid Node.js project
  isValidProjectDirectory(dir) {
    const packageJsonPath = path.join(dir, 'package.json');
    const distPath = path.join(dir, 'dist');
    const srcPath = path.join(dir, 'src');

    return fs.existsSync(packageJsonPath) && (fs.existsSync(distPath) || fs.existsSync(srcPath));
  }

  // Get deployment metadata
  getDeploymentMetadata() {
    if (!fs.existsSync(this.metadataFile)) {
      return { deployments: [], previousDeployment: null, currentDeployment: null };
    }
    try {
      return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
    } catch (error) {
      console.error('⚠️  Failed to read deployment metadata:', error.message);
      return { deployments: [], previousDeployment: null, currentDeployment: null };
    }
  }

  // Save deployment metadata
  saveDeploymentMetadata(metadata) {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('❌ Failed to save deployment metadata:', error.message);
      throw error;
    }
  }

  // Get next deployment name
  getNextDeploymentName() {
    const metadata = this.getDeploymentMetadata();
    const currentVersion = metadata.currentDeployment ? parseInt(metadata.currentDeployment.substring(1) ?? '0') : 0;
    return `v${currentVersion + 1}`;
  }

  // Check if server is running
  async isServerRunning() {
    if (!fs.existsSync(this.pidFile)) {
      return false;
    }

    try {
      const pid = fs.readFileSync(this.pidFile, 'utf8').trim();
      if (!pid) return false;

      // Check if process is still running
      await execAsync(`kill -0 ${pid}`);
      return parseInt(pid);
    } catch (error) {
      // Process doesn't exist, clean up pid file
      fs.unlinkSync(this.pidFile);
      return false;
    }
  }

  // Stop running server
  async stopServer() {
    const pid = await this.isServerRunning();
    if (!pid) {
      console.log('ℹ️  No server is currently running');
      return true;
    }

    try {
      console.log(`🛑 Stopping server (PID: ${pid})...`);

      // Try graceful shutdown first
      process.kill(pid, 'SIGTERM');

      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if still running
      const stillRunning = await this.isServerRunning();
      if (stillRunning) {
        console.log('⚡ Force killing server...');
        process.kill(pid, 'SIGKILL');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Clean up pid file
      if (fs.existsSync(this.pidFile)) {
        fs.unlinkSync(this.pidFile);
      }

      console.log('✅ Server stopped successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop server:', error.message);
      return false;
    }
  }

  // Start server
  async startServer(deploymentPath) {
    const serverPath = path.join(deploymentPath, 'index.js');

    if (!fs.existsSync(serverPath)) {
      throw new Error(`Server file not found: ${serverPath}`);
    }

    console.log(`🚀 Starting server from ${deploymentPath}...`);

    return new Promise((resolve, reject) => {
      const serverProcess = spawn('bun', [`--env-file=${this.deploymentsDir}/.env`, serverPath], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: deploymentPath,
      });

      // Save PID
      fs.writeFileSync(this.pidFile, serverProcess.pid.toString());

      // Handle server output
      serverProcess.stdout.on('data', data => {
        console.log(`[SERVER] ${data.toString().trim()}`);
      });

      serverProcess.stderr.on('data', data => {
        console.error(`[SERVER ERROR] ${data.toString().trim()}`);
      });

      // Check if server started successfully
      setTimeout(async () => {
        const isRunning = await this.isServerRunning();
        if (isRunning) {
          console.log(`✅ Server started successfully (PID: ${serverProcess.pid})`);
          resolve(serverProcess.pid);
        } else {
          reject(new Error('Server failed to start'));
        }
      }, 2000);

      serverProcess.on('error', error => {
        console.error('❌ Failed to start server:', error.message);
        reject(error);
      });

      // Detach the process so it continues running
      serverProcess.unref();
    });
  }

  // Copy dist files to deployment directory
  async copyDistFiles(deploymentPath) {
    if (!fs.existsSync(this.distDir)) {
      throw new Error('dist directory not found. Run "bun run build:prod" first.');
    }

    console.log(`📂 Copying dist files to ${deploymentPath}...`);

    // Create deployment directory
    fs.mkdirSync(deploymentPath, { recursive: true });

    // Copy all files from dist to deployment directory
    const files = fs.readdirSync(this.distDir);
    for (const file of files) {
      const srcPath = path.join(this.distDir, file);
      const destPath = path.join(deploymentPath, file);

      if (fs.statSync(srcPath).isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Also copy package.json for dependencies info
    const packageJsonSrc = path.join(this.projectRoot, 'package.json');
    const packageJsonDest = path.join(deploymentPath, 'package.json');
    fs.copyFileSync(packageJsonSrc, packageJsonDest);

    console.log('✅ Files copied successfully');
  }

  // Helper to copy directories recursively
  async copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const files = fs.readdirSync(src);

    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      if (fs.statSync(srcPath).isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Update current deployment symlink
  updateCurrentSymlink(deploymentPath) {
    try {
      // Remove existing symlink
      if (fs.existsSync(this.currentSymlink)) {
        fs.unlinkSync(this.currentSymlink);
      }

      // Create new symlink
      fs.symlinkSync(path.basename(deploymentPath), this.currentSymlink);
      console.log(`🔗 Updated current deployment symlink`);
    } catch (error) {
      console.error('⚠️  Failed to update symlink:', error.message);
    }
  }

  // Start server from current deployment
  async startCurrentServer() {
    try {
      // Ensure deployment directory exists
      this.ensureDeploymentDirectory();

      const metadata = this.getDeploymentMetadata();

      if (!metadata.currentDeployment) {
        throw new Error('No current deployment found. Run "master-cea deploy" first.');
      }

      // Check if server is already running
      const runningPid = await this.isServerRunning();
      if (runningPid) {
        console.log(`ℹ️  Server is already running (PID: ${runningPid})`);
        console.log(`📦 Current deployment: ${metadata.currentDeployment}`);
        return runningPid;
      }

      // Find current deployment
      const currentDeployment = metadata.deployments.find(d => d.name === metadata.currentDeployment);
      if (!currentDeployment) {
        throw new Error(`Current deployment '${metadata.currentDeployment}' not found in deployment list`);
      }

      console.log('🚀 Starting server from current deployment...');
      console.log(`📦 Deployment: ${metadata.currentDeployment}`);
      console.log(`📁 Path: ${currentDeployment.path}`);
      console.log('');

      // Check if deployment directory exists
      if (!fs.existsSync(currentDeployment.path)) {
        throw new Error(`Deployment directory not found: ${currentDeployment.path}`);
      }

      // Start the server
      const serverPid = await this.startServer(currentDeployment.path);

      // Update metadata with new PID
      currentDeployment.pid = serverPid;
      this.saveDeploymentMetadata(metadata);

      console.log('');
      console.log(`✅ Server started successfully!`);
      console.log(`📊 Server PID: ${serverPid}`);
      console.log(`📦 Deployment: ${metadata.currentDeployment}`);

      // Exit successfully, after server is started otherwise script keeps running
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      throw error;
    }
  }
  cleanupOldDeployments() {
    try {
      const metadata = this.getDeploymentMetadata();
      const deploymentsToKeep = 5;

      if (metadata.deployments.length <= deploymentsToKeep) {
        return;
      }

      // Sort by timestamp and keep only the latest ones
      const sortedDeployments = metadata.deployments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const deploymentsToDelete = sortedDeployments.slice(deploymentsToKeep);

      for (const deployment of deploymentsToDelete) {
        const deploymentPath = path.join(this.deploymentsDir, deployment.name);
        if (fs.existsSync(deploymentPath)) {
          fs.rmSync(deploymentPath, { recursive: true, force: true });
          console.log(`🗑️  Removed old deployment: ${deployment.name}`);
        }
      }

      // Update metadata
      metadata.deployments = sortedDeployments.slice(0, deploymentsToKeep);
      this.saveDeploymentMetadata(metadata);
    } catch (error) {
      console.error('⚠️  Failed to cleanup old deployments:', error.message);
    }
  }

  // Deploy new version
  async deploy() {
    try {
      // Ensure deployment directory exists before proceeding
      this.ensureDeploymentDirectory();

      console.log('🚀 Starting Master CEA production deployment...');
      console.log(`📁 Deployment directory: ${this.deploymentsDir}`);
      console.log(`📦 Project source: ${this.projectRoot}`);
      console.log('');

      // Get next deployment name
      const deploymentName = this.getNextDeploymentName();
      const deploymentPath = path.join(this.deploymentsDir, deploymentName);
      const timestamp = new Date().toISOString();

      console.log(`🏷️  Deploying: ${deploymentName}`);
      console.log(`📅 Timestamp: ${timestamp}`);
      console.log('');

      // Copy dist files
      await this.copyDistFiles(deploymentPath);

      // Stop existing server
      await this.stopServer();

      // Start new server
      let serverPid;
      try {
        serverPid = await this.startServer(deploymentPath);
      } catch (error) {
        console.error('❌ Failed to start new server, attempting rollback...');
        await this.rollback();
        throw error;
      }

      // Update metadata
      const metadata = this.getDeploymentMetadata();

      // Store previous deployment for easy rollback
      metadata.previousDeployment = metadata.currentDeployment;

      const newDeployment = {
        name: deploymentName,
        timestamp,
        path: deploymentPath,
        pid: serverPid,
        projectRoot: this.projectRoot,
      };

      metadata.deployments.push(newDeployment);
      metadata.currentDeployment = deploymentName;
      this.saveDeploymentMetadata(metadata);

      // Update symlink
      this.updateCurrentSymlink(deploymentPath);

      // Cleanup old deployments
      this.cleanupOldDeployments();

      console.log('');
      console.log(`🎉 Production deployment ${deploymentName} completed successfully!`);
      console.log(`📊 Server PID: ${serverPid}`);
      console.log(`📁 Deployment path: ${deploymentPath}`);
      console.log(`🔗 Current symlink: ${this.currentSymlink}`);

      if (metadata.previousDeployment) {
        console.log(`⬅️  Previous deployment: ${metadata.previousDeployment} (available for quick rollback)`);
      }

      // Exit successfully, after server is started otherwise script keeps running
      process.exit(0);
    } catch (error) {
      console.error('❌ Production deployment failed:', error.message);
      process.exit(1);
    }
  }

  // Rollback to previous deployment
  async rollback(targetDeploymentName = null) {
    try {
      // Ensure deployment directory exists before proceeding
      this.ensureDeploymentDirectory();

      console.log('🔄 Starting rollback...');

      const metadata = this.getDeploymentMetadata();

      if (metadata.deployments.length === 0) {
        throw new Error('No deployments available for rollback');
      }

      let targetDeployment;

      if (targetDeploymentName) {
        targetDeployment = metadata.deployments.find(d => d.name === targetDeploymentName);
        if (!targetDeployment) {
          throw new Error(`Deployment '${targetDeploymentName}' not found`);
        }
      } else {
        // Use the previous deployment if available
        if (metadata.previousDeployment) {
          targetDeployment = metadata.deployments.find(d => d.name === metadata.previousDeployment);
          if (!targetDeployment) {
            throw new Error(`Previous deployment '${metadata.previousDeployment}' not found`);
          }
        } else {
          // Fallback to second most recent deployment
          const sortedDeployments = metadata.deployments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          const currentIndex = sortedDeployments.findIndex(d => d.name === metadata.currentDeployment);
          const previousDeployment = sortedDeployments[currentIndex + 1];

          if (!previousDeployment) {
            throw new Error('No previous deployment available for rollback');
          }

          targetDeployment = previousDeployment;
        }
      }

      console.log(`📦 Rolling back to ${targetDeployment.name}...`);

      // Check if deployment directory exists
      if (!fs.existsSync(targetDeployment.path)) {
        throw new Error(`Deployment directory not found: ${targetDeployment.path}`);
      }

      // Stop current server
      await this.stopServer();

      // Start target deployment
      const serverPid = await this.startServer(targetDeployment.path);

      // Update metadata - swap current and previous
      const oldCurrent = metadata.currentDeployment;
      metadata.currentDeployment = targetDeployment.name;
      metadata.previousDeployment = oldCurrent;
      targetDeployment.pid = serverPid;
      this.saveDeploymentMetadata(metadata);

      // Update symlink
      this.updateCurrentSymlink(targetDeployment.path);

      console.log(`✅ Rollback to ${targetDeployment.name} completed successfully!`);
      console.log(`📊 Server PID: ${serverPid}`);
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }

  // List deployments
  listDeployments() {
    // Check if deployment directory exists
    if (!fs.existsSync(this.deploymentsDir)) {
      console.log('📋 No deployment directory found');
      console.log('💡 Run "master-cea setup" to initialize the production environment');
      return;
    }

    const metadata = this.getDeploymentMetadata();

    if (metadata.deployments.length === 0) {
      console.log('📋 No deployments found');
      return;
    }

    console.log('📋 Available deployments:');
    console.log('');

    const sortedDeployments = metadata.deployments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    for (const deployment of sortedDeployments) {
      const isCurrent = deployment.name === metadata.currentDeployment;
      const isPrevious = deployment.name === metadata.previousDeployment;
      let status = '';
      if (isCurrent) status = ' (CURRENT)';
      else if (isPrevious) status = ' (PREVIOUS)';

      const date = new Date(deployment.timestamp).toLocaleString();

      console.log(`  ${isCurrent ? '→' : isPrevious ? '←' : ' '} ${deployment.name}${status}`);
      console.log(`    📅 ${date}`);
      console.log(`    📁 ${deployment.path}`);
      if (deployment.pid) {
        console.log(`    🔧 PID: ${deployment.pid}`);
      }
      console.log('');
    }
  }

  // Show status
  async status() {
    // Check if deployment directory exists, but don't fail if it doesn't
    let deploymentDirExists = fs.existsSync(this.deploymentsDir);

    const metadata = deploymentDirExists
      ? this.getDeploymentMetadata()
      : { deployments: [], previousDeployment: null, currentDeployment: null };
    const isRunning = deploymentDirExists ? await this.isServerRunning() : false;

    console.log('📊 Master CEA Deployment Status');
    console.log('==============================');
    console.log('');

    console.log(`Project root: ${this.projectRoot}`);
    console.log(`Deployment directory: ${this.deploymentsDir}`);

    if (!deploymentDirExists) {
      console.log(`⚠️  Deployment directory not found - run 'master-cea setup' first`);
    }

    console.log('');

    if (metadata.currentDeployment) {
      console.log(`Current deployment: ${metadata.currentDeployment}`);
    } else {
      console.log('Current deployment: None');
    }

    if (metadata.previousDeployment) {
      console.log(`Previous deployment: ${metadata.previousDeployment}`);
    } else {
      console.log('Previous deployment: None');
    }

    if (isRunning) {
      console.log(`Server status: Running (PID: ${isRunning})`);
    } else {
      console.log('Server status: Not running');
    }

    console.log(`Total deployments: ${metadata.deployments.length}`);

    if (!deploymentDirExists) {
      console.log('');
      console.log('💡 Run "master-cea setup" to initialize the production environment');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let command = null;
  let projectPath = null;
  let commandArg = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' || args[i] === '-p') {
      projectPath = args[i + 1];
      i++; // Skip next argument as it's the project path
    } else if (!command) {
      command = args[i];
    } else if (!commandArg) {
      commandArg = args[i];
    }
  }

  const deployManager = new DeploymentManager(projectPath);

  try {
    switch (command) {
      case 'setup':
        await deployManager.setup();
        break;

      case 'deploy':
        await deployManager.deploy();
        break;

      case 'start':
        await deployManager.startCurrentServer();
        break;

      case 'rollback':
        const targetDeploymentName = commandArg || null;
        await deployManager.rollback(targetDeploymentName);
        break;

      case 'list':
        deployManager.listDeployments();
        break;

      case 'status':
        await deployManager.status();
        break;

      case 'stop':
        await deployManager.stopServer();
        break;

      default:
        console.log('🤖 Master CEA Deployment Manager');
        console.log('');
        console.log('Usage:');
        console.log('  master-cea setup                        - Setup production environment');
        console.log('  master-cea deploy                       - Deploy new version');
        console.log('  master-cea start                        - Start server from current deployment');
        console.log('  master-cea rollback [deployment]        - Rollback to previous or specific deployment');
        console.log('  master-cea list                         - List all deployments');
        console.log('  master-cea status                       - Show current status');
        console.log('  master-cea stop                         - Stop running server');
        console.log('');
        console.log('Global Options:');
        console.log('  --project, -p <path>                    - Specify project directory');
        console.log('');
        console.log('Examples:');
        console.log('  master-cea setup                        - Initialize production environment');
        console.log('  master-cea deploy                       - Deploy from current directory');
        console.log('  master-cea start                        - Start server from current deployment');
        console.log('  master-cea --project /path/to/app deploy - Deploy from specific path');
        console.log('  master-cea rollback                     - Rollback to previous deployment');
        console.log('  master-cea rollback 20250923-143500     - Rollback to specific deployment');
        console.log('');
        console.log('Local Usage (from project directory):');
        console.log('  bun scripts/deploy.js setup            - Setup production environment');
        console.log('  bun scripts/deploy.js start            - Start server from current deployment');
        console.log('  bun scripts/deploy.js deploy           - Deploy current dist');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DeploymentManager;
