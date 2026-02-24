# Environment Setup and Test Execution

Follow these steps to prepare the environment and execute the automated test suite for the CI system.

## 1. Environment Setup
The application requires Node.js environment. Ensure dependencies are installed.


## 2. Database Setup
The application uses SQLite. For the testing environment, the configuration is overridden to use a clean state for every run.


## 3. Running Automated Tests
Run the following command to execute the Mocha test suite. This covers models, controllers, and system routes.


## 4. Manual Verification
To verify the server starts correctly after tests pass:

The server will be available at `http://localhost:8080`.
