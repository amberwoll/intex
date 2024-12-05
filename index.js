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

// Route to save application to database
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
app.get("/requested_event", (req, res) => {
  knex("requested_event")
    .join('host', 'requested_event.host_id', '=', 'host.host_id')
    .join('sewing_activity', 'requested_event.sewing_abbreviation', '=', 'sewing_activity.sewing_abbreviation')
    .join('status', 'requested_event.status_id', '=', 'status.status_id')
    .select(
      'requested_event.event_number',
      knex.raw("CONCAT(host.first_name, ' ', host.last_name) AS host"),
      'requested_event.organization',
      'requested_event.event_description',
      'requested_event.street',
      'requested_event.city',
      'requested_event.state',
      'requested_event.zip',
      'requested_event.possible_date_1',
      'requested_event.possible_date_2',
      'requested_event.event_length',
      'sewing_activity.sewing_description',
      'requested_event.number_of_sewers',
      'requested_event.number_of_nonsewers',
      'requested_event.number_of_children',
      'requested_event.machine',      
      'requested_event.jen_story',
      'requested_event.size_of_space',
      'status.status_description',
      'requested_event.status_id'  // Include the current status_id
    )
    .then((requested_events) => {
      if (!requested_events.length) {
        return res.status(404).send('No events found');
      }
      knex('status')
        .select('status_id', 'status_description')
        .then(event_status => {
          res.render("requested_event", { requested_events, event_status });
        });
    })
    .catch((error) => {
      console.error("Error fetching requested events:", error.message);
      res.status(500).send("Internal Server Error: requested_event .get");
    });
});

// Route to edit requests

// Route to save edits
// route to host page
app.get('/host', (req, res) => {
  res.render('host')
})

//route to save host form


app.post('/host', (req, res) => {
  // Extract form values from req.body
  const first_name = req.body.first_name || ''; // Default to empty string if not provided
  const last_name = req.body.last_name || ''; // Default to empty string if not provided
  const phone = req.body.phone || '';
  const host_email = req.body.host_email; 
  const organization = req.body.organization || ''; 
  const description = req.body.description || ''; 
  const street = req.body.street || ''; 
  const city = req.body.city || ''; 
  const state = req.body.state || ''; 
  const zip = req.body.zip || ''; 
  const possible_date_1 = req.body.possible_date_1 || ''; 
  const possible_date_2 = req.body.possible_date_2 || ''; 
  const event_length = parseFloat(req.body.event_length); 
  const sewing_abbreviation = req.body.sewing_abbreviation || 'N';
  const number_of_sewers = parseInt(req.body.number_of_sewers, 10); // Convert to integer
  const number_of_nonsewers = parseInt(req.body.number_of_nonsewers, 10); // Convert to integer
  const number_of_children = parseInt(req.body.number_of_children, 10); // Convert to integer
  const machine = parseInt(req.body.machine, 10); // Convert to integer
  const jen_story = req.body.jen_story === 'true'; // Checkbox returns true or undefined
  
  knex.transaction(async (trx) => {
    try {
      // Insert data into 'host' table and retrieve the generated 'host_id'
      const [host_id] = await trx('host')
        .insert({
          first_name: first_name.toUpperCase(),
          last_name: last_name.toUpperCase(),
          phone,
          host_email
        })
        .returning('host_id'); 

      console.log('host_id');

      // Insert into 'requested_events' table, using the retrieved 'host_id'
      await trx('requested_event').insert({
        host_id: host_id,
        organization,
        description,
        street,
        city,
        state,
        zip,
        possible_date_1,
        event_length,
        sewing_abbreviation,
        number_of_sewers,
        number_of_nonsewers,
        number_of_children,
        machine,
        jen_story
      });

      // Commit the transaction
      await trx.commit();

      // Redirect or send a success response
      res.redirect('/');
      console.log("successfully reached this point");
    } catch (error) {
      // Roll back the transaction in case of an error
      await trx.rollback();

      // Log and handle the error
      console.error('Error during transaction:', error);
      res.status(500).send('Internal Server Error');
    }
  });
});


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
    .where('event_number', event_number)
    .update({
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
// Route to display the volunteers page
app.get("/volunteers", (req, res) => {
  knex("volunteer")
    .join("reference", "volunteer.reference_id", "=", "reference.reference_id") // Join with the reference table
    .join("sewing_activity", "volunteer.preference", "=", "sewing_activity.sewing_abbreviation") // Join with sewing levels
    .join("sewing_skill", "volunteer.sewing_level", "=", "sewing_skill.sewing_level")
    .select(
      "volunteer.*",
      "reference.reference_description as reference_description",
      "sewing_activity.sewing_description as sewing_preference",
      "sewing_skill.sewing_ability as sewing_description"
    )
    .then((volunteers) => {
      res.render("volunteers", { volunteers });
    })
    .catch((error) => {
      console.error("Error fetching volunteers:", error);
      res.status(500).send("Internal Server Error 10");
    });
});


// Route to delete volunteer and their associated info in the passwords table
app.post("/deleteVolunteer/:volunteer_email", (req, res) => {
  const { volunteer_id, volunteer_email } = req.params;
   // Extract the email from the route parameters
  console.log("Attempting to delete volunteer with email:", volunteer_email); // Debug log

  // Start a transaction to delete from both tables
  knex.transaction((trx) => {
    return trx("login")
      .where("volunteer_email", volunteer_email) // Ensure the email matches in the passwords table
      .del() // Delete password entry associated with the volunteer
      .then(() => {
        return trx("volunteer")
          .where("volunteer_email", volunteer_email) // Ensure the email matches in the volunteer table
          .del(); // Delete volunteer entry
      });
  })
  .then(() => {
    res.redirect("/volunteers"); // Redirect to volunteers page after deletion
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
        return res.status(404).send("Volunteer not found"); // Check if the volunteer exists before proceeding
      }
      
      // Fetch the reference data and activity data
      knex('reference')
        .select('reference_id', 'reference_description')
        .then(reference => {
          knex('sewing_activity')  // Assuming you want data from 'activity' table
            .then(sewing => {
              // Render the application form with volunteer, reference, and activity data
              res.render("edit_volunteer", { volunteer, reference, sewing });
            })
            .catch(error => {
              console.error('Error fetching sewing data:', error);
              res.status(500).send('Internal Server Error: Sewing.get');
            });
        })
        .catch(error => {
          console.error('Error fetching reference types:', error);
          res.status(500).send('Internal Server Error: Reference.get');
        });
    })
    .catch((error) => {
      console.error("Error fetching volunteer:", error.message);
      res.status(500).send("Internal Server Error 2");
    });
});



// Route to edit volunteer
// INCOMPLETE - NEED FIX
app.post("/editVolunteer/:id", (req, res) => {
  const { id } = req.params;
  const { 
    first_name,
    last_name,
    phone, 
    city, 
    zip, 
    reference_id,
    sewing_level,
    preference
   } = req.body;
   const number_of_hours = parseFloat(req.body.number_of_hours);
   const leadership = req.body.leadership === 'true';
   const email_list = req.body.email_list === 'true';


  knex("volunteer")
    .where("volunteer_id", id) // Find the record by ID
    .update({
      first_name: first_name.toUpperCase(),
      last_name: last_name.toUpperCase(),
      phone,
      city: city.toUpperCase(),
      zip,
      reference_id,
      sewing_level,
      preference,
      number_of_hours,
      leadership,
      email_list
    })
    .then(() => {
      console.log(`Volunteer ${id} updated successfully`);
      res.redirect("/volunteers"); // Redirect back to the volunteers list
    })
    .catch((error) => {
      console.error("Error updating volunteer:", error.message);
      res.status(500).send("Internal Server Error 3");
    });
});


// post to update event status and add a row to completed events if one does not exist

app.post('/updateEventStatus/:event_number', async (req, res) => {
  const event_number = parseInt(req.params.event_number, 10); // Extract the event number from the URL
  const { status_id } = req.body; // Extract the status ID from the form submission

  try {
    // Use a transaction for consistency
    await knex.transaction(async (trx) => {
      // Update the status in the `requested_events` table
      await trx('requested_event')
        .where({ event_number: event_number })
        .update({ status_id });

      // Check if the event exists in the `completed_events` table
      const completed_event = await trx('completed_event')
        .where({ event_number: event_number })
        .first();

      // If not found, insert a new row
      if (!completed_event) {
        await trx('completed_event').insert({ event_number: event_number });
      }
    });

    // Redirect back to the requested events page or send a success response
    res.redirect('/requested_event');
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).send('Internal Server Error');
  }
});


// START SERVER
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
