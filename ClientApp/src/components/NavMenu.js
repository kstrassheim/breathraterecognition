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
                <NavbarBrand onClick={this.btnCollapseClick.bind(this)}><img src="favicon-32x32.png" width="18" height="18" alt="Logo" style={{ marginTop: '-4px', marginRight:'7px'}} />Breath Rate</NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
              <ul className="navbar-nav flex-grow">
                <NavItem>
                  <NavLink tag={Link} to="/">Home</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/ContinousCutCount">Continous Cut Count</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/DiscreteSinglePeriod">Discrete Single Period</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/DFT">DFT</NavLink>
                </NavItem>
              </ul>
            </Collapse>
          </div>
        </Navbar>
      </header>
    );
  }
}
