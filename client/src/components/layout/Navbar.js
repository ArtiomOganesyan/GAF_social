import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';

const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
  const [toggle, setToggle] = useState(false);

  const authLinks = [
    { title: 'community', to: '/community', action: '' },
    { title: 'profile', to: '/profile', action: '' },
    { title: 'logout', to: '', action: 'LOGOUT' }
  ];
  const guestLinks = [
    { title: 'community', to: '/community', action: '' },
    { title: 'register', to: '/register', action: '' },
    { title: 'login', to: '/login', action: '' }
  ];

  const renderMenu = () => (
    <Fragment>
      {(isAuthenticated ? authLinks : guestLinks).map((link) => (
        <Link
          to={link.to}
          className="navbar_text"
          onClick={() => {
            if (link.action) {
              if (typeof link.action === 'string') {
                link.action();
              } else {
                link.action.forEach((el) => el && el());
              }
            }
            setToggle(!toggle);
          }}
        >
          {link.title}
        </Link>
      ))}
    </Fragment>
  );

  return (
    <nav>
      <div className="navbar_logo">
        <Link to="/" className="navbar_text" onClick={() => setToggle(false)}>
          <i className="fas fa-dog" /> <span>DevConnector</span>
        </Link>
      </div>
      <div
        className="navbar_hamburger navbar_text"
        onClick={() => setToggle(!toggle)}
      >
        <div className={`navbar_hamburger_line`}></div>
        <div className={`navbar_hamburger_line`}></div>
        <div className={`navbar_hamburger_line`}></div>
      </div>
      <div className={`navbar_links ${toggle ? 'open' : ''}`}>
        {!loading && renderMenu()}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(Navbar);
