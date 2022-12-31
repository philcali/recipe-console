import { useState } from "react";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from '../../logo.svg';

function Navigation() {
    const [ expanded, setExpanded ] = useState(false);

    return (
        <Navbar onToggle={setExpanded} expanded={expanded} expand="lg" bg="dark" variant="dark" sticky="top">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">
                    <img
                        src={logo}
                        width="40"
                        height="40"
                        className="d-inline-block align-top"
                        alt="Recipes"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Offcanvas className="bg-dark" id="responsive-navbar-nav" placement="end">
                    <Offcanvas.Header closeButton closeVariant="white">
                        <Offcanvas.Title>
                            <img
                                src={logo}
                                width="40"
                                height="40"
                                className="d-inline-block align-top"
                                alt="Recipes"
                            />
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="text-white">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/" active={true}>Home</Nav.Link>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
}

export default Navigation;