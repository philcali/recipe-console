import { useState } from "react";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { authService } from "../../lib/services";
import logo from '../../logo.svg';
import { useAuth } from "../auth/AuthContext";
import { icons } from "./Icons";

function Navigation() {
    const [ expanded, setExpanded ] = useState(false);
    const location = useLocation();
    const auth = useAuth();
    const setHrefAndActive = (href: string) => {
        return {
            as: Link,
            to: href,
            active: location.pathname.match(`^${href}`) !== null,
            onClick: () => {
                setExpanded(false);
            }
        };
    };
    const text = auth.isLoggedIn() ? 'Dashboard' : 'Home';
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
                            <Nav.Link {...setHrefAndActive(auth.isLoggedIn() ? '/dashboard' : '/')}>{text}</Nav.Link>
                            <Nav.Link as={Link} to="/privacy">Privacy</Nav.Link>
                        </Nav>
                        {auth.isLoggedIn() &&
                            <Nav>
                                <Nav.Link {...setHrefAndActive("/recipes")}><>{icons.icon('card-list')}</> <small>Recipes</small></Nav.Link>
                                <Nav.Link {...setHrefAndActive("/lists")}><>{icons.icon('cart')}</> <small>Shopping Lists</small></Nav.Link>
                                <Nav.Link {...setHrefAndActive("/shares")}><>{icons.icon('share')}</> <small>Sharing</small></Nav.Link>
                                <Nav.Link {...setHrefAndActive("/tokens")}><>{icons.icon('code-slash')}</> <small>API Tokens</small></Nav.Link>
                                <Nav.Link {...setHrefAndActive("/audits")}><>{icons.icon('list-columns')}</> <small>Logs</small></Nav.Link>
                                <Nav.Link {...setHrefAndActive("/settings")}><>{icons.icon('gear')}</> <small>Settings</small></Nav.Link>
                                <Nav.Link href={authService.logoutEndpoint(window.location.origin)}><>{icons.icon('box-arrow-left')}</> <small>Log Out</small></Nav.Link>
                            </Nav>
                        }
                        {!auth.isLoggedIn() &&
                            <Nav>
                                <Nav.Link href={authService.loginEndpoint(window.location.origin)}><>{icons.icon('box-arrow-right')}</> <small>Login</small></Nav.Link>
                            </Nav>
                        }
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
}

export default Navigation;