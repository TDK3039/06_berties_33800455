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

Lab 8
Task 4:
- Added server‑side validation to the login page with express-validator.
- Rules: Username must be 3–20 characters, Password at least 8 characters.
- Updated /loggedin route to check inputs before DB queries.
- Modified login.ejs to display validation errors, consistent with register.ejs.

Task 5:
- Entered 'Henry <script>alert("Gotcha!")</script>' in the First name field on the register page.
- Used a valid password "(catchme1!)" to pass all validation rules.
- On submission, the app echoed the input directly into the response.
- The browser executed the '<script> tag, showing the alert box'
- This confirmed the app is vulnerable to XSS due to unescaped user input in the /registered route.

Task 7: Extension — Protect other fields
- Extended sanitisation to Last Name, Email, and Username fields.
- Did not sanitise Password - validated and hashed, and sanitisation could weaken security.

Task 8: Protect other fields from XSS
- Login Form: Username sanitised, password not - preserve special characters for hashing.
- Add Book Form: Book title sanitised, price left unsanitised - numeric.
- Search Form: Search keyword sanitised - prevent malicious scripts.
- Other Routes: Audit, List Users, Bargain Books don’t accept input - sanitisation not required.

# API Documentation
- Base path: `/api`
- GET `/api/books` - returns a list of books as JSON

# Query Parameters
- `search` - `/api/books?seach=world`
- `minprice` - `/api/books?max_price=20`
- `sort` - name and price - `/api/books?sort=price`

# Examples
- `/api/books` - all books
- `/api/books?search=harry` - books with harry in the name
- `/api/books?minprice=10&max_price=20` - books priced between £10 and £20
- `/api/books?search=world&sort=name` - filtered and sorted alphabetically

