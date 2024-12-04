// Node & Express Setup
let express = require("express");
let app = express();
let path = require("path");
const port = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// RDS Connection
app.use(express.urlencoded({extended: true}));
const knex = require("knex") ({
    client : "pg",
    connection : {
        host : process.env.RDS_HOSTNAME,
        user : process.env.RDS_USERNAME,
        password : process.env.RDS_PASSWORD,
        database : process.env.RDS_DB_NAME,
        port : process.env.RDS_PORT,
        ssl: {
              require: true, 
              rejectUnauthorized: false 
            }
    }

})

// // CHECKING BUGS?
// console.log('RDS_HOSTNAME:', process.env.RDS_HOSTNAME);
// console.log('RDS_USERNAME:', process.env.RDS_USERNAME);
// console.log('RDS_PASSWORD:', process.env.RDS_PASSWORD);
// console.log('RDS_DB_NAME:', process.env.RDS_DB_NAME);
// console.log('RDS_PORT:', process.env.RDS_PORT);
// console.log('SSL:', process.env.DB_SSL);

// INDEX PAGE
app.get("/", (req, res) => {
  res.render("index");
});

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


  knex("volunteer")
    .insert({
      first_name: first_name.toUpperCase(),
      last_name: last_name.toUpperCase(),
      phone,
      volunteer_email,
      city: city.toUpperCase(),
      zip,
      sewing_level: parseInt(sewing_level, 10),
      reference_id: parseInt(reference_id, 10),
      number_of_hours: parseInt(number_of_hours, 10),
      email_list: email_list === "true",
      sewing_abbreviation,
      leadership,
    })
    .then(() => {
      res.redirect("/volunteers");
    })
    .catch((error) => {
      console.error("Error adding volunteer:", error.message);
      res.status(500).send("Internal Server Error");
    });

// REQUESTED EVENTS PAGE
app.get("/requested-events", (req, res) => {
  knex("requested_events")
    .select("*")
    .then((events) => {
      res.render("requested_events", { events });
    })
    .catch((error) => {
      console.error("Error fetching requested events:", error.message);
      res.status(500).send("Internal Server Error");
    });
});
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
app.get('/update_completed_events/:event_number', (req, res) => {
  let event_number = req.params.event_number;
  // Collect event details from requested_event
  knex('requested_event')
    .where('event_number', event_number)
    .first() // Get single event
    .then(requested_event => {
      if (!requested_event) {
        return res.status(404).send('Event not found');
      }
      // Render the edit form, passing the event details
      res.render('update_completed_events', { requested_event });
    })
    .catch(error => {
      console.error('Error fetching requested event:', error);
      res.status(500).send('Internal Server Error: update_completed_events .get');
    });
});
// Route to save completed event update
app.post('/save_completed_events/:event_number', (req, res) => {
  const event_number = req.params.event_number;
  const {
    event_start,
    number_of_participants,
    event_duration,
    pockets_produced,
    envelopes_produced,
    collars_produced,
    vests_produced,
    completed_products
  } = req.body;

  knex('completed_event')
    .insert({
      event_number,
      event_start,
      number_of_participants,
      event_duration,
      pockets_produced,
      envelopes_produced,
      collars_produced,
      vests_produced,
      completed_products
    })
    .then(() => {
      res.redirect('/completed_events'); // Redirect to completed events list
    })
    .catch(error => {
      console.error('Error saving completed event:', error);
      res.status(500).send('Internal Server Error: save_completed_events .post');
    });
});




// VOLUNTEERS PAGE
app.get("/volunteers", (req, res) => {
  knex("volunteer")
    .select("*")
    .then((volunteers) => {
      res.render("volunteers", { volunteers });
    })
    .catch((error) => {
      console.error("Error fetching volunteers:", error.message);
      res.status(500).send("Internal Server Error");
    });
});


app.post("/deleteVolunteer/:id", (req, res) => {
  const { id } = req.params; // Extract the ID from the route parameters
  console.log("Attempting to delete volunteer with ID:", id); // Debug log

  knex("volunteer")
    .where("volunteer_id", id) // Ensure "volunteer_id" matches your DB schema
    .del()
    .then(() => {
      res.redirect("/volunteers");
    })
    .catch((error) => {
      console.error("Error deleting volunteer:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// Route to display the edit page
app.get("/editVolunteer/:id", (req, res) => {
  const { id } = req.params;

  knex("volunteer")
    .where("volunteer_id", id) // Fetch the volunteer by ID
    .first() // Get the first record
    .then((volunteer) => {
      if (!volunteer) {
        return res.status(404).send("Volunteer not found");
      }
      res.render("edit_volunteer", { volunteer }); // Pass volunteer data to the EJS template
    })
    .catch((error) => {
      console.error("Error fetching volunteer:", error.message);
      res.status(500).send("Internal Server Error");
    });
});
// Route to handle the edit form submission
app.post("/editVolunteer/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone, city, zip, sewing_level } = req.body;

  knex("volunteer")
    .where("volunteer_id", id) // Find the record by ID
    .update({
      first_name: first_name.toUpperCase(),
      last_name: last_name.toUpperCase(),
      phone,
      city: city.toUpperCase(),
      zip,
      sewing_level: parseInt(sewing_level, 10),
    })
    .then(() => {
      console.log(`Volunteer ${id} updated successfully`);
      res.redirect("/volunteers"); // Redirect back to the volunteers list
    })
    .catch((error) => {
      console.error("Error updating volunteer:", error.message);
      res.status(500).send("Internal Server Error");
    });
});


// START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
