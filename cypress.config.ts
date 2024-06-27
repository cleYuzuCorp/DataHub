import { defineConfig } from "cypress"

export default defineConfig({
  env: {
    aad_username: "cle@yuzucorp.com",
    aad_password: "27Robes!",
    aad_name: "Cameron Leconte"
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    experimentalModifyObstructiveThirdPartyCode: true
  },
})
