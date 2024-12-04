// Node & Express Setup
let express = require("express");
let app = express();
let path = require("path");

// MAYA'S LOCAL PORT
const port = 3000
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MAYA'S LOCAL DATABASE
app.use(express.urlencoded({extended: true})); // get data from form
const knex = require("knex") ({ 
    client : "pg",
    connection : {
        host : "localhost",
        user : "postgres",
        password : "admin",
        database : "INTEX_LOCAL",
        port : 5432
    }
});

// // CHECKING BUGS?
// console.log('RDS_HOSTNAME:', process.env.RDS_HOSTNAME);
// console.log('RDS_USERNAME:', process.env.RDS_USERNAME);
// console.log('RDS_PASSWORD:', process.env.RDS_PASSWORD);
// console.log('RDS_DB_NAME:', process.env.RDS_DB_NAME);
// console.log('RDS_PORT:', process.env.RDS_PORT);
// console.log('SSL:', process.env.DB_SSL);

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
app.post("/application", (req, res) => {
    const first_name = req.body.first_name || ''; // Default to empty string if not provided
    const last_name = req.body.last_name || ''; 
    const phone = req.body.phone || '';
    const volunteer_email = req.body.volunteer_email || '';
    const city = req.body.city || '';
    const zip = req.body.zip || '';
    const sewing_level = parseInt(req.body.sewing_level, 10);
    const reference_id = parseInt(req.body.reference_id, 10);
    const number_of_hours = parseInt(req.body.number_of_hours, 10)
    const email_list = req.body.email_list === 'true' ;                 // True or undefined
    const sewing_abbreviation = req.body.sewing_abbreviation || 'S';    // Default to "S" for sewing
    const leadership = req.body.leadership || 'true';                   // Default to true

    knex("volunteer")
      .insert({
        first_name: first_name.toUpperCase(),
        last_name: last_name.toUpperCase(),
        phone: phone,
        volunteer_email: volunteer_email,
        city: city.toUpperCase(),
        zip: zip,
        sewing_level: sewing_level,
        reference_id: reference_id,
        number_of_hours: number_of_hours,
        email_list: email_list,
        preference: sewing_abbreviation,
        leadership: leadership

      })
      .then(() => {
        res.redirect("/");
      })
      .catch((error) => {
        console.error("Error adding volunteer:", error);
        res.status(500).send("Internal Server Error: Application .post");
      });
  });

// ADMIN LANDING PAGE
// Route to display admin landing page



// REQUESTED EVENTS PAGE
// Route to display requested events page

// Route to edit requests

// Route to save edits



// COMPLETED EVENTS PAGE
// Route to display completed events page
app.get('/completed_events', (req, res) => {
  knex('requested_event')
    .join('host', 'requested_event.host_id', '=', 'host.host_id')
    .select(
      'requested_event.event_number',
      knex.raw("CONCAT(host.first_name, ' ', host.last_name) AS name"),
      'requested_event.event_description',
      'requested_event.organization'
    )
    // Only events that are marked as completed
    .where('requested_event.status_id', '=', 1) 
    .then(completed_events => {
      // Render completed_events.ejs and pass the data
      res.render('completed_events', { completed_events });
    })
    .catch(error => {
      console.error('Error querying database:', error);
      res.status(500).send('Internal Server Error: completed_events .get');
    });
});
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