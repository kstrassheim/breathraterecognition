import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import $ from 'jquery'

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor (props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true
      };

    
  }

  toggleNavbar () {
    this.setState({
      collapsed: !this.state.collapsed
    });
    }

    btnCollapseClick() {
        console.log("collapse");
        $("#optionsToolbar").slideToggle("fast");
    }

  render () {
    return (
      <header>
            <Navbar className={"navbar-expand-sm navbar-toggleable-sm" + ((!!this.props.darkMode) ? " navbar-dark" : "")} light={true}>
          <div className="container-fluid">
            <NavbarBrand onClick={this.btnCollapseClick.bind(this)}>Breath Rate Recognition</NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
              <ul className="navbar-nav flex-grow">
                <NavItem>
                  <NavLink tag={Link} to="/">Home</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/MultiplePoint">Multiple Point</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/SinglePeriod">Single Period</NavLink>
                </NavItem>
              </ul>
            </Collapse>
          </div>
        </Navbar>
      </header>
    );
  }
}
