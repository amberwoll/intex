let express = require("express");

let app = express();

let path = require("path");

const port = process.env.PORT || 4000;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));

const knex = require("knex") ({
    client : "pg",
    connection : {
        host : process.env.RDS_HOSTNAME || HOSTNAME,
        user : process.env.RDS_USERNAME || USERNAME,
        password : process.env.RDS_PASSWORD || PASSWORD,
        database : process.env.RDS_DB_NAME || DB_NAME,
        port : process.env.RDS_PORT || PORT,
        ssl : process.env.DB_SSL ? {rejectUnauthorized: false} : true
    }
});

app.get("/", (req, res) => {
    res.render("index"); // Automatically looks for "index.ejs" in the "views" folder
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });