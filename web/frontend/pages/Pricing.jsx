import React, { useState, useEffect } from "react";
import "../styles/Pricing.css";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
      const [isAnnual, setIsAnnual] = useState(true); 
  
  const plans = {
    Silver: { amount: 0, description: "Free Plan", details: ["1 Store Card", "No Monitoring by Admin", "48 hrs to Published Store on Map", "Upto 1 Cards Added",] },
    Gold: { amount: 10, description: "Pro Plan", details: ["10 Store Card", "Store Verification by Admin", "Fast Published Store Card on the Map", "Upto 10 Cards Added",] },
    Platinum: { amount: 60, description: "Ultra Pro Plan", details: ["Up to 100 Cards Added", "Store Verification by Admin", "Fast Published Store Card on the Map", "Upto 100 Cards Added",] },
  };

  const getToken = () => {
    const token = localStorage.getItem("userToken");
    console.log("Retrieved token:", token);
    return token;
  };

  const decodeToken = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const getUserIdFromToken = () => {
    const token = getToken();
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        console.log("Decoded token:", decodedToken);
        return decodedToken.userId || decodedToken.id || null;
      }
    }
    return null;
  };

  useEffect(() => {
    const checkAuthentication = () => {
      const token = getToken();
      const userId = getUserIdFromToken();

      if (token && userId) {
        setUserId(userId);
        setLoading(false);
      } else {
        setError("Authentication required. Please log in.");
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handlePayment = async (plan) => {
    if (!userId) {
      alert("You must be logged in to make a payment.");
      return;
    }
    // Replace with your actual payment API endpoint
    const apiUrl = "http://localhost:5175/api/v1/payments/pay";
    const paymentData = {
      userId: userId,
      amount: plans[plan].amount,
      currency: "USD",
      description: plans[plan].description,
    };
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`, // Use getToken() here
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Payment failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert("Unable to redirect to payment gateway. Please try again.");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Error initiating payment. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="pricingsec-wrap">
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
          <div key={key} className={`pricing-plan ${key === "Gold" ? "pricing-popular" : ""}`}>
            <h3>{key.charAt(0).toUpperCase() + key.slice(1)} {key === "Gold" && <span className="pricing-popular-badge">Popular</span>}</h3>
            <h2>${plans[key].amount}</h2>
            <p>Per user</p>
            <ul>
              {plans[key].details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
            <button onClick={() => handlePayment(key)}>
              {key === "Silver" ? "Get started for free" : `Get started with ${key}`}
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Pricing;












