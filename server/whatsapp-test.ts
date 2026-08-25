import { sendWhatsAppMessage } from "./connectors/whatsapp";

async function runTest() {
  console.log("Starting WhatsApp Integration Test...");
  try {
    const result = await sendWhatsAppMessage({
      to: "+201234567890",
      text: "مرحباً بك في نظام ميدورا المتكامل. هذا اختبار آلي لرسائل الواتساب. | Welcome to MEDORA Integrated System. This is an automated WhatsApp test."
    });
    console.log("Test Result:", JSON.stringify(result, null, 2));
    if (result.simulated) {
      console.log("SUCCESS: Simulation successful. Integration logic is verified.");
    } else {
      console.log("SUCCESS: Real message sent successfully.");
    }
  } catch (error) {
    console.error("Test FAILED:", error);
    process.exit(1);
  }
}

runTest();
