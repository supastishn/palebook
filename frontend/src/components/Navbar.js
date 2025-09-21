import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { logout } from '../store/slices/authSlice';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${props => props.theme.navbar.height};
  background-color: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.lg};
  z-index: 1000;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Logo = styled(Link)`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.colors.primaryHover};
  }
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 ${props => props.theme.spacing.lg};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.theme.colors.gray100};

  &:focus {
    background-color: ${props => props.theme.colors.white};
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  &:hover {
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.text};
  }
`;

const ProfileDropdown = styled.div`
  position: relative;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: none;
  border-radius: ${props => props.theme.borderRadius.md};

  &:hover {
    background-color: ${props => props.theme.colors.gray100};
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  min-width: 200px;
  z-index: 1001;
  display: ${props => props.show ? 'block' : 'none'};
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: ${props => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};

  &:hover {
    background-color: ${props => props.theme.colors.gray100};
  }
`;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <NavbarContainer>
      <Logo to="/">Palebook</Logo>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search Palebook"
        />
      </SearchBar>

      <NavActions>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/friends">Friends</NavLink>

        <ProfileDropdown>
          <ProfileButton
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Avatar>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                getInitials(user?.firstName, user?.lastName)
              )}
            </Avatar>
          </ProfileButton>

          <DropdownMenu show={showDropdown}>
            <DropdownItem onClick={() => { navigate('/profile'); setShowDropdown(false); }}>
              Profile
            </DropdownItem>
            <DropdownItem onClick={() => { navigate('/settings'); setShowDropdown(false); }}>
              Settings
            </DropdownItem>
            <DropdownItem onClick={handleLogout}>
              Logout
            </DropdownItem>
          </DropdownMenu>
        </ProfileDropdown>
      </NavActions>
    </NavbarContainer>
  );
};

export default Navbar;