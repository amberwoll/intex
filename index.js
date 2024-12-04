// Node & Express Setup
let express = require("express");
let app = express();
let path = require("path");
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "Becky98004",
    database: "ebdb",
    port: 5433,
  },
});

// INDEX PAGE
app.get("/", (req, res) => {
  res.render("index");
});

// APPLICATION PAGE
app.get("/application", (req, res) => {
  knex("reference")
    .select("reference_id", "reference_description")
    .then((reference) => {
      res.render("application", { reference });
    })
    .catch((error) => {
      console.error("Error fetching reference types:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/application", (req, res) => {
  const {
    first_name = "",
    last_name = "",
    phone = "",
    volunteer_email = "",
    city = "",
    zip = "",
    sewing_level,
    reference_id,
    number_of_hours,
    email_list,
    sewing_abbreviation = "S",
    leadership = "true",
  } = req.body;

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
