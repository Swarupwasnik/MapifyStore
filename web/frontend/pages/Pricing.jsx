
import React, { useState } from 'react';
import "../styles/Pricing.css";
const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true); 

  const handleToggle = (planType) => {
    setIsAnnual(planType === 'annual');
  };

  return (
    <div className="prcingsec-wrap">
      <div className="pricing-container">
        <h2 className="price-head">Plans and Pricing</h2>
        <p>Receive unlimited credits when you pay yearly, and save on your plan.</p>
        
        <div className="billing-options">
          <button 
            className={isAnnual ? 'active' : ''} 
            onClick={() => handleToggle('annual')}
          >
            Annual <span>Save 35%</span>
          </button>
          <button 
            className={!isAnnual ? 'active' : ''} 
            onClick={() => handleToggle('monthly')}
          >
            Monthly
          </button>
        </div>
        
        <div className="pricing-plans">
          <div className="pricing-plan">
            <h3>Free</h3>
            <h2>{isAnnual ? '$0' : '$0'}</h2> 
            <p>Per user/month, billed {isAnnual ? 'annually' : 'monthly'}</p>
            <ul>
              <li>Free e-mail alerts</li>
              <li>3-minute checks</li>
              <li>Automatic data enrichment</li>
              <li>10 monitors</li>
              <li>Up to 3 seats</li>
            </ul>
            <button>Get started for free</button>
          </div>

          <div className="pricing-plan pricing-popular">
            <h3>Pro <span className="pricing-popular-badge">Popular</span></h3>
            <h2>{isAnnual ? '$85' : '$100'}</h2> 
            <p>Per user/month, billed {isAnnual ? 'annually' : 'monthly'}</p>
            <ul>
              <li>Unlimited phone calls</li>
              <li>30 second checks</li>
              <li>Single-user account</li>
              <li>20 monitors</li>
              <li>Up to 6 seats</li>
            </ul>
            <button>Get started with Pro</button>
          </div>

          <div className="pricing-plan pricing-enterprise">
            <h3>Enterprise</h3>
            <h2>{isAnnual ? 'Custom' : 'Custom'}</h2>
            <p>Per user/month, billed {isAnnual ? 'annually' : 'monthly'}</p>
            <ul>
              <li>Everything in Pro</li>
              <li>Up to 5 team members</li>
              <li>100 monitors</li>
              <li>15 status pages</li>
              <li>200+ integrations</li>
            </ul>
            <button>Get started with Enterprise</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;