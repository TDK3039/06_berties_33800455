# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js

#dotenv
Secure Sensitive information:
- Installed dotenv with 'npm install dotenv'.
- Created a '.env' file in the project root 
- Updated 'index.js' to load environment variables.

#Audit
Created new 'audit' table in database - fields: username, status (SUCCESS/FAILURE), and timestamp
- Updated the '/users/loggedin' route to insert a record into the 'audit' table for every login attempt.
Added new route '/users/audit' which queries the 'audit' table and displays full login in table.