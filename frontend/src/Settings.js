import React, { useState, useEffect } from "react";
import { TiPencil } from "react-icons/ti";
import {
  Navbar,
  Nav,
  Container,
  Row,
  Button,
  Form,
  Image,
} from "react-bootstrap";
import bruhImage from "./img/bruh.jpeg";
import "./settings.css";

const Settings = () => {
    // These variables are used if the user want to update any field, then the respective variable will store the updated request
    const [login, setLogin] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    //This is the current user data info. The info is read only
    const [user, setUser] = useState({});

    //Read user and assign it to each updatable variable
    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            const parsedUserData = JSON.parse(userData);
            
            //Read only data
            setUser(parsedUserData);

            //Updatable variables
            setLogin(parsedUserData.login);
            setFirstName(parsedUserData.firstName);
            setLastName(parsedUserData.lastName);
            setEmail(parsedUserData.email);
            setPassword(parsedUserData.password);
        }
    }, []);

    // State variables to track edit mode for each input field
    const [editLogin, setEditLogin] = useState(false);
    const [editFirstName, setEditFirstName] = useState(false);
    const [editLastName, setEditLastName] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editPassword, setEditPassword] = useState(false);

    const deleteAccount = () => {
      window.confirm("Are you sure you want to delete your account?"); // Specify the URL you want to navigate to
    };

    const saveChanges = () => {
      console.log(firstName, lastName, email, password, login);
  
      // Password validation criteria
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,.])[A-Za-z\d@$!%*?&,.]{8,}$/;
      
      // Email validation criteria
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      let isValid = true;
      let error = "";
  
  
      if (!emailRegex.test(email)) {
        error = "Invalid email. Changes were not applied.";
        isValid = false;
      }
      else if (!passwordRegex.test(password)) {
        error = "Password must be 8 characters long, one upper and lower case letter, and a special symbol. Changes were not applied.";
        isValid = false;
      }
  
      if (!isValid) {
        setMessage(error);
        return;
      }
  
      console.log("ALL FIELDS ARE CORRECT!");
      setMessage("All changes were saved!");
    };

    return (
        <Container fluid className="main-container">
          <Row>
            <Navbar id="myNavbar" bg="light" expand="lg" className="w-100">
            <Nav>
                  <Image src={bruhImage} roundedCircle className="large-circle" />{" "}
            </Nav>
              <Navbar.Brand href="#home" className="brand-margin">
                VIRTUAL VOGUE
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav" className="right-nav">
                <Nav >
                  <Nav.Link href="/my-outfits">MY OUTFITS</Nav.Link>
                  <Nav.Link href="/create-outfit">CREATE OUTFIT</Nav.Link>
                  <Nav.Link href="/my-clothes">LOGOUT</Nav.Link>
                  <Nav.Link href="/Settings">SETTINGS</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </Row>
          <p className="settingsTitle">Settings</p>
          <Form className = "SettingsForm" >

            {/* First name field */}
            <Form.Group controlId="idFirstName" className="form-group">
            <Form.Label classname = "form-label"> First name:</Form.Label>
            <Form.Control
                type="text"
                placeholder= {firstName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)} //update variable
                onBlur={(e) => {
                                setFirstName(e.target.value ? e.target.value : user.firstName);
                                if (!e.target.readOnly) {
                                  setEditFirstName(false);
                                }
                              }}
                className={editFirstName ? "border-highlight" : ""}
                readOnly={!editFirstName}
            />

            <div className="icon-container " onClick={() => setEditFirstName(true)}>
                <TiPencil size={50} />
            </div>
            </Form.Group>

            {/* Last name field */}
            <Form.Group controlId="idLastName" className="form-group">
            <Form.Label>Last name:</Form.Label>
            <Form.Control
                type="text"
                placeholder= {lastName}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)} 
                onBlur={(e) => { 
                                setLastName(e.target.value ? e.target.value : user.lastName);
                                if (!e.target.readOnly) {
                                  setEditLastName(false)
                                };
                              }}
                className={editLastName ? "border-highlight" : ""}
                readOnly={!editLastName}
            />
            <div className="icon-container" onClick={() => setEditLastName(true)}>
                <TiPencil size={50} />
            </div>
            </Form.Group>

            {/* Email field */}
            <Form.Group controlId="idEmail" className="form-group">
            <Form.Label>Email:</Form.Label>
            <Form.Control
                type="text"
                placeholder={email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) =>{ 
                                setEmail(e.target.value ? e.target.value : user.email);
                                if (!e.target.readOnly) {
                                  setEditEmail(false);
                                }
                              }}
                className={editEmail ? "border-highlight" : ""}
                readOnly={!editEmail}
            />
            <div className="icon-container" onClick={() => setEditEmail(true)}>
                <TiPencil size={50} />
            </div>
            </Form.Group>

            {/* Login ID field */}
            <Form.Group controlId="idLogin" className="form-group">
            <Form.Label>Username:</Form.Label>
            <Form.Control
                type="text"
                placeholder={login }
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                onBlur={(e) => {
                                setLogin(e.target.value ? e.target.value : user.login);
                                if (!e.target.readOnly) {
                                  setEditLogin(false)
                                };
                                }}
                className={editLogin ? "border-highlight" : ""}
                readOnly={!editLogin}
            />
            <div className="icon-container" onClick={() => setEditLogin(true)}>
                <TiPencil size={50} />
            </div>
            </Form.Group>

            {/* Password field */}
            <Form.Group controlId="idPassword" className="form-group">
            <Form.Label>Password:</Form.Label>
            <Form.Control
                type="password"
                placeholder={password}
                value={password }
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => {
                                  setPassword(e.target.value ? e.target.value : user.password);
                                  if (!e.target.readOnly) {
                                    setEditPassword(false)
                                  };
                                }} 
                className={editPassword ? "border-highlight" : ""}
                readOnly={!editPassword}
            />
            <div className="icon-container" onClick={() => setEditPassword(true)}>
                <TiPencil size={50} />
            </div>
            </Form.Group>

              {/* Message field*/}
              <p id="settingsMessage">{message}</p>
            <div className="settingButtons" >

              <Button type="submit" className="deleteButton" background size="lg" onClick={deleteAccount}>Delete Account</Button>
              <Button type="button" className="saveButton" background size="lg" onClick={saveChanges}>Save Changes</Button>
            </div>

            </Form>
          <Row>

          </Row>
        </Container>
      );
  };

export default Settings;
