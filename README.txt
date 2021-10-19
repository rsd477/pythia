---------On compiling-----------

Contact Richard Scott "rds95@drexel.edu" for help

Prerequisites:

MongoDB Atlas Cloud Account
Latest Node.js LTS server

1. run npm init in /pythia/ directory

2. press ENTER until it stops asking questions

3. in same directory, run: npm install <module>
   where <module> includes: mongodb, moment, express,
   bcrypt, and anything it may complain about when
   'node server.js' is run

4. Enter the .env.json file and include the username
   and password used to allow mongodb cloud atlas
   access. Make sure you have a database named pythia.
   
5. If there are any database issues, they are likely
   related to improper mongo firewall allowances or
   the uri in server.js needs to be updated.

