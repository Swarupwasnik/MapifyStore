import fetch from "node-fetch";
import dotenv from "dotenv";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";

// Load environment variables
dotenv.config();

const PAYPAL_API = process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

const getAccessToken = async () => {
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });
    const data = await response.json();
    return data.access_token;
};

export const createPayment = async (req, res) => {
    const { userId, amount, currency, description } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    try {
        // Get the PayPal access token
        const accessToken = await getAccessToken();

        // Create the order
        const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: amount,
                        },
                        description: description,
                    },
                ],
                application_context: {
                    brand_name: "Your Brand Name",
                    landing_page: "BILLING",
                    user_action: "PAY_NOW",
                    return_url: "http://localhost:5175/api/v1/payments/success",
                    cancel_url: "http://localhost:5175/api/v1/payments/cancel",
                },
            }),
        });

        const orderData = await orderResponse.json();

        if (orderResponse.status !== 201) {
            // Handle errors from PayPal API
            return res.status(orderResponse.status).json({ error: orderData.details || orderData.message });
        }

        // Save the payment details to the database
        const payment = new Payment({
            userId: user._id,
            intent: "CAPTURE",
            payer: {
                payment_method: "paypal",
            },
            transactions: [
                {
                    amount: {
                        total: amount,
                        currency: currency,
                    },
                    description: description,
                },
            ],
        });

        await payment.save();

        // Extract approval link
        const approvalUrl = orderData.links.find(link => link.rel === "approve").href;

        // Send the approval URL back to the frontend
        res.status(200).json({ approvalUrl, orderId: orderData.id });
    } catch (error) {
        console.error("Create Payment Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const capturePayment = async (req, res) => {
    const { orderId } = req.body;

    try {
        const accessToken = await getAccessToken();
        const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const captureData = await captureResponse.json();
        if (captureResponse.status !== 201) {
            return res.status(captureResponse.status).json({ error: captureData.details || captureData.message });
        }

        // Update the payment status in the database
        const payment = await Payment.findOne({ "transactions.transaction_id": orderId });
        if (payment) {
            payment.status = "COMPLETED";
            payment.updatedAt = Date.now();
            await payment.save();
        }

        res.status(200).json(captureData);
    } catch (error) {
        console.error("Capture Payment Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const cancelPayment = (req, res) => {
    res.status(200).json({ message: "Payment canceled by the user." });
};



// import fetch from "node-fetch";
// import dotenv from "dotenv";
// import Payment from "../models/paymentModel.js";
// import User from "../models/userModel.js";

// // Load environment variables
// dotenv.config();

// const PAYPAL_API = process.env.PAYPAL_MODE === "sandbox"
//     ? "https://api-m.sandbox.paypal.com"
//     : "https://api-m.paypal.com";

// const getAccessToken = async () => {
//     const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
//         method: "POST",
//         headers: {
//             Authorization: `Basic ${Buffer.from(
//                 `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
//             ).toString("base64")}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: "grant_type=client_credentials",
//     });
//     const data = await response.json();
//     return data.access_token;
// };

// export const createPayment = async (req, res) => {
//   const { userId, amount, currency, description } = req.body;

//   // Validate user
//   const user = await User.findById(userId);
//   if (!user) {
//       return res.status(404).json({ error: "User not found" });
//   }

//   try {
//       // Get the PayPal access token
//       const accessToken = await getAccessToken();

//       // Create the order
//       const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
//           method: "POST",
//           headers: {
//               Authorization: `Bearer ${accessToken}`,
//               "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//               intent: "CAPTURE", // Use "CAPTURE" or "AUTHORIZE" based on your needs
//               purchase_units: [
//                   {
//                       amount: {
//                           currency_code: currency, // e.g., "USD"
//                           value: amount,          // e.g., "52.00"
//                       },
//                       description: description, // Payment description
//                   },
//               ],
//               application_context: {
//                   brand_name: "Your Brand Name", // Optional, displayed on PayPal page
//                   landing_page: "BILLING", // Options: "LOGIN" or "BILLING"
//                   user_action: "PAY_NOW", // Options: "PAY_NOW" or "CONTINUE"
//                   return_url: "http://localhost:5175/api/v1/payments/success",
//                   cancel_url: "http://localhost:5175/api/v1/payments/cancel",
//               },
//           }),
//       });

//       const orderData = await orderResponse.json();

//       if (orderResponse.status !== 201) {
//           // Handle errors from PayPal API
//           return res
//               .status(orderResponse.status)
//               .json({ error: orderData.details || orderData.message });
//       }

//       // Extract approval link
//       const approvalUrl = orderData.links.find(link => link.rel === "approve").href;

//       // Send the approval URL back to the frontend
//       res.status(200).json({ approvalUrl, orderId: orderData.id });
//   } catch (error) {
//       console.error("Create Payment Error:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// export const capturePayment = async (req, res) => {
//     const { orderId } = req.body;

//     try {
//         const accessToken = await getAccessToken();
//         const captureResponse = await fetch(
//             `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
//             {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         const captureData = await captureResponse.json();
//         if (captureResponse.status !== 201) {
//             return res
//                 .status(captureResponse.status)
//                 .json({ error: captureData.message });
//         }

//         res.status(200).json(captureData);
//     } catch (error) {
//         console.error("Capture Payment Error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// export const cancelPayment = (req, res) => {
//     res.status(200).json({ message: "Payment canceled by the user." });
// };

