import { config } from "./config.js";
import app from "./index.js";

app.listen(config.port, () => {
  console.log(`AI Spoken English Tutor server running at http://localhost:${config.port}`);
});
