import React, { useState, useEffect } from "react";
import "../styles/Pricing.css";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
    const [isAnnual, setIsAnnual] = useState(true); 
  

  const getToken = () => {
    return localStorage.getItem("userToken");
  };
  const handleToggle = (planType) => {
    setIsAnnual(planType === 'annual');
  };
  const plans = {
    Silver: {
      amount: 0,
      description: "Free Plan",
      details: [
        "1 Store Card",
        "No Monitoring by Admin",
        "48 hrs to Published Store on Map",
        "Upto 1 Cards Added",
      ],
    },
    Gold: {
      amount: 10, // Fixed amount without annual/monthly toggle
      description: "Pro Plan",
      details: [
        "10 Store Card",
        "Store Verification by Admin",
        "Fast Published Store Card on the Map",
        "Upto 10 Cards Added",
      ],
    },
   Platinum: {
      amount: 60, // Fixed amount
      description: "Ultra Pro Plan",
      details: [
        "Up to 100 Cards Added",
        "Store Verification by Admin",
        "Fast Published Store Card on the Map",
        "Upto 100 Cards Added",
      ],
    },
  };

  useEffect(() => {
    const userToken = getToken();
    if (userToken) {
      setLoading(false);
    } else {
      alert("No token found. Please login first.");
    }
  }, []);

  const handlePayment = async (plan) => {
    const token = getToken();
    if (!token) {
      alert("You must be logged in to make a payment.");
      return;
    }

    if (token.split(".").length !== 3) {
      alert("Invalid token. Please log in again.");
      return;
    }

    setSelectedPlan(plan);

    if (plans[plan].amount === 0) {
      alert("The Free Plan does not require payment.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5175/api/v1/payments/pay",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: "677cca23a8f4d9903112b0a1", // Replace with actual user ID
            amount: plans[plan].amount,
            currency: "USD",
            description: plans[plan].description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment");
      }

      const data = await response.json();

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert("Unable to redirect to PayPal. Please try again.");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Error initiating payment. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="prcingsec-wrap">
      <div className="pricing-container">
        <h2 className="price-head">Premium Plans</h2>
        <p>Unlock the ability to add more stores by subscribing to one of our Premium Plans</p>

        <div className="billing-options">
          <button 
            className={isAnnual ? 'active' : ''} 
            onClick={() => handleToggle('annual')}
          >
           <h3>Save Upto <span>35%</span></h3>  
          </button>
          {/* <button 
            className={!isAnnual ? 'active' : ''} 
            onClick={() => handleToggle('monthly')}
          >
            Monthly
          </button> */}
        </div>
        <div className="pricing-plans">
          {Object.keys(plans).map((key) => (
            <div
              key={key}
              className={`pricing-plan ${
                key === "pro" ? "pricing-popular" : ""
              }`}
            >
              <h3>
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {key === "pro" && (
                  <span className="pricing-popular-badge">Popular</span>
                )}
              </h3>
              <h2>${plans[key].amount}</h2>
              <p>Per user</p>
              <ul>
                {plans[key].details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
              <button onClick={() => handlePayment(key)}>
                {key === "free"
                  ? "Get started for free"
                  : `Get started with ${key}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;





// import React, { useState, useEffect } from "react";
// import "../styles/Pricing.css";

// const Pricing = () => {
//   const [isAnnual, setIsAnnual] = useState(true);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const getToken = () => {
//     return localStorage.getItem("userToken");
//   };

//   const plans = {
//     free: {
//       amount: 0,
//       description: "Free Plan",
//       details: [
//         "1 Store Card",
//         "No Monitoring by Admin",
//         "upto 10-15 Days for store Published on the Map",
//         "Upto 1 Cards Added",
//       ],
//     },
//     pro: {
//       amount: isAnnual ? 10 : 100,
//       description: "Pro Plan",
//       details: [
//         "10 Store Card",
//         "Store Verification by Admin",
//         "Fast Published Store Card on the Map",
//         "Upto 10 Cards Added",
//       ],
//     },
//     enterprise: {
//       amount: "60",
//       description: "Ultra Pro Plan",
//       details: [
//         // "Everything in Pro",
//         "Up to 100 Cards Added",
//         "Store Verification by Admin",
//         "Fast Published Store Card on the Map",
//         "Upto 100 Cards Added",
//       ],
//     },
//   };

//   useEffect(() => {
//     const userToken = getToken();
//     if (userToken) {
//       setLoading(false);
//     } else {
//       alert("No token found. Please login first.");
//     }
//   }, []);

//   const handleToggle = (planType) => {
//     setIsAnnual(planType === "annual");
//   };

//   const handlePayment = async (plan) => {
//     const token = getToken();
//     if (!token) {
//       alert("You must be logged in to make a payment.");
//       return;
//     }

//     if (token.split(".").length !== 3) {
//       alert("Invalid token. Please log in again.");
//       return;
//     }

//     setSelectedPlan(plan);

//     if (plans[plan].amount === 0) {
//       alert("The Free Plan does not require payment.");
//       return;
//     }

//     try {
//       const response = await fetch(
//         "http://localhost:5175/api/v1/payments/pay",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             userId: "677cca23a8f4d9903112b0a1", // Replace with actual user ID
//             amount: plans[plan].amount,
//             currency: "USD",
//             description: plans[plan].description,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to create payment");
//       }

//       const data = await response.json();

//       if (data.approvalUrl) {
//         window.location.href = data.approvalUrl;
//       } else {
//         alert("Unable to redirect to PayPal. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error creating payment:", error);
//       alert("Error initiating payment. Please try again.");
//     }
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="prcingsec-wrap">
//       <div className="pricing-container">
//         <h2 className="price-head">Plans</h2>
//         <p>
//           Receive unlimited credits when you pay yearly, and save on your plan.
//         </p>

//         <div className="billing-options">
//           <button
//             className={isAnnual ? "active" : ""}
//             onClick={() => handleToggle("annual")}
//           >
//             Annual <span>Save 35%</span>
//           </button>
//           <button
//             className={!isAnnual ? "active" : ""}
//             onClick={() => handleToggle("monthly")}
//           >
//             Monthly
//           </button>
//         </div>

//         <div className="pricing-plans">
//           {Object.keys(plans).map((key) => (
//             <div
//               key={key}
//               className={`pricing-plan ${
//                 key === "pro" ? "pricing-popular" : ""
//               }`}
//             >
//               <h3>
//                 {key.charAt(0).toUpperCase() + key.slice(1)}
//                 {key === "pro" && (
//                   <span className="pricing-popular-badge">Popular</span>
//                 )}
//               </h3>
//               <h2>
//                 {plans[key].amount === "Custom"
//                   ? plans[key].amount
//                   : `$${plans[key].amount}`}
//               </h2>
//               <p>Per user/month, billed {isAnnual ? "annually" : "monthly"}</p>
//               <ul>
//                 {plans[key].details.map((detail, index) => (
//                   <li key={index}>{detail}</li>
//                 ))}
//               </ul>
//               <button onClick={() => handlePayment(key)}>
//                 {key === "free"
//                   ? "Get started for free"
//                   : `Get started with ${key}`}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Pricing;