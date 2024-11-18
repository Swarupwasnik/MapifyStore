import React from 'react';
import { Link } from 'react-router-dom';
function NavigationBar() {


  return (
    <header className="cd-header-nav">
      <nav>
        <Link to="/">Store List</Link>
        <Link to="/settings">Settings</Link>
         <Link to= "/category">Category</Link> 
        <Link to="/pricing">Pricing</Link>
         <Link to="/userstorelist">Store on Map</Link> 
   


      
      </nav>
    </header>
  );
}

export default NavigationBar;


