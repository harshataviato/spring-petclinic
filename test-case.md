# Test Setup and Execution Guide

This document outlines the steps to set up the environment and execute the automated test suite for the PetClinic Node application.

## 1. Environment Setup
Ensure Node.js (v18+) and npm are installed on your system.

## 2. Dependency Installation
Install all required production and development dependencies (including Jest and Supertest):

## 3. Database Setup
The application uses SQLite. No external database server is required. 
The test suite is configured to use an isolated, in-memory database for each test file to ensure consistency and isolation.

## 4. Run Automated Tests
Execute the full test suite using the following command:

To view the coverage report:

## 5. Manual Server Verification
To run the server manually and verify routes:
