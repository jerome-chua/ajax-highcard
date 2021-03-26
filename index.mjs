import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import bindRoutes from './routes.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // Set the Express view engine to expect EJS templates
app.use(cookieParser());  // Bind cookie parser middleware to parse cookies in requests
app.use(express.urlencoded({ extended: false })); // Parse request bodies for POST requests
app.use(methodOverride('_method'));  // Parse PUT and DELETE requests sent as POST requests
app.use(express.static('public')); // Expose the files stored in the public folder
app.use(express.json()); // Parses incoming requests with JSON payloads (transmitted data)

bindRoutes(app);

app.listen(PORT, (err) => {
  if (err) {
    console.log("PORT setup Unsuccessfull")   
  }
  console.log("Success! Listening on Port", PORT);
});