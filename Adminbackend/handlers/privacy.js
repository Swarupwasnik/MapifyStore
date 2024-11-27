// handlers/privacy.js

const PrivacyWebhookHandlers = {
    customersDataRequest: async (topic, shop, body) => {
      console.log(`Received customers/data_request webhook: ${body}`);
      // Handle the webhook
    },
    customersRedact: async (topic, shop, body) => {
      console.log(`Received customers/redact webhook: ${body}`);
      // Handle the webhook
    },
    shopRedact: async (topic, shop, body) => {
      console.log(`Received shop/redact webhook: ${body}`);
      // Handle the webhook
    }
  };
  
  export default PrivacyWebhookHandlers;
  
