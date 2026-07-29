import ENV from "./src/config/env.js";

import { app } from "./src/app.js";

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} and URL: http://localhost:${PORT}`,
  );
});
