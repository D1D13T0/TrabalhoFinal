import { app } from "./app";
import { env } from "./config/env";

// "0.0.0.0" permite que o celular acesse o servidor pela rede Wi-Fi.
app.listen(env.port, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${env.port}`);
});
