# Test Execution Guide

Follow these steps to set up the environment and execute the automated test suite.

## 1. Environment Setup
Ensure Node.js (v16+) is installed on your system.

## 2. Dependency Installation
Install all required production and testing dependencies:

## 3. Database Migration & Seeding
Initialize the local SQLite database with standard PetClinic data:

## 4. Run Automated Tests
Execute the Mocha test suite. This will run tests for models, owners, pets, visits, and system functionality. Tests use a dedicated sync process to ensure isolation.

## 5. Verify Functional Status (Manual Smoke Test)
Start the server:
1. Open `http://localhost:8080` in your browser.
2. Navigate to "Find Owners".
3. Click "Find Owner" with an empty field to see all seeded owners.
4. Verify "Veterinarians" displays the list of doctors.
