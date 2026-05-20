import admin from "firebase-admin";
admin.initializeApp({ projectId: "gen-lang-client-0153398594" });
async function run() {
  try {
    const token = await admin.auth().createCustomToken("server-admin");
    console.log("TOKEN:", token.substring(0, 20) + "...");
  } catch(e) {
    console.error("AUTH error:", e.toString());
  }
}
run();
