// Node & Express Setup
let express = require("express");
let app = express();
let path = require("path");
const port = process.env.PORT;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect to RDS 
app.use(express.urlencoded({extended: true}));
const knex = require("knex") ({
    client : "pg",
    connection : {
        host : process.env.RDS_HOSTNAME,
        user : process.env.RDS_USERNAME,
        password : process.env.RDS_PASSWORD,
        database : process.env.RDS_DB_NAME,
        port : process.env.RDS_PORT,
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    }

});

console.log('RDS_HOSTNAME:', process.env.RDS_HOSTNAME);
console.log('RDS_USERNAME:', process.env.RDS_USERNAME);
console.log('RDS_PASSWORD:', process.env.RDS_PASSWORD);
console.log('RDS_DB_NAME:', process.env.RDS_DB_NAME);
console.log('RDS_PORT:', process.env.RDS_PORT);
console.log('SSL:', process.env.DB_SSL);
// INDEX PAGE
// Route to display index page
app.get("/", (req, res) => {
    res.render("index"); // Automatically looks for "index.ejs" in the "views" folder
});

// HOST PAGE
// Route to display host page

// Route to save form



// APPLICATION PAGE
// Route to display application page
app.get('/application', (req, res) => {
    // Fetch reference description to populate the dropdown
    console.log('Hello World');
    knex('reference')
        .select('reference_id', 'reference_description')
        .then(reference => {
            // Render the application form with the reference description types
            console.log('Hello World');
            res.render('application', { reference });
        })
        .catch(error => {
            console.error('Error fetching reference types:', error);
            res.status(500).send('Internal Server Error: Reference.get');
        });
});

// Route to save form



// ADMIN LANDING PAGE
// Route to display admin landing page



// REQUESTED EVENTS PAGE
// Route to display requested events page

// Route to edit requests

// Route to save edits



// COMPLETED EVENTS PAGE
// Route to display completed events page

// Route to edit completed events

// Route to save edits



// VOLUNTEERS PAGE
// Route to display volunteers page

// Route to edit volunteers

// Route to save edits

// Route to add

// Route to delete



// END: DO NOT PUT ANYTHING AFTER THIS
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });