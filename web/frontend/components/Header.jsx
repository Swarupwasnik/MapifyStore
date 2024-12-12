import React from 'react';
import {  NavLink } from 'react-router-dom';
import "../styles/header.css";
function NavigationBar() {


  return (
    <header className="cd-header-nav">
      <nav>
        <NavLink to="/"  activeClassName="active">Store List</NavLink>
        <NavLink to="/settings" activeClassName="active">Settings</NavLink>
         <NavLink to= "/category" activeClassName="active">Category</NavLink> 
        <NavLink to="/pricing" activeClassName="active">Pricing</NavLink>
         {/* <NavLink to="/userstorelist">Store on Map</NavLink>  */}
   


      
      </nav>
    </header>
  );
}

export default NavigationBar;


