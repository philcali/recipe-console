import { Button, Col, Container, Row } from "react-bootstrap";
import { icons } from "../components/common/Icons";
import { authService } from "../lib/services";

function Home() {
    const button = (
        <Button href={authService.loginEndpoint(window.location.origin)}>Login</Button>
    );
    return (
        <>
            <div className="p-5 mb-4 bg-light rounded-3">
                <Container>
                    <h1 className="display=3">My Recipes</h1>
                    <p>A collection of my recipes that cover food, drinks, and anything else with ingredients.</p>
                    {button}
                </Container>
            </div>
            <Container>
                <Row>
                    <Col md>
                        <h2><span><>{icons.icon('cloud-upload', 32)}</></span> Centralize</h2>
                        <p>Store all of your recipes in a single place.</p>
                    </Col>
                    <Col md>
                        <h2><span style={{verticalAlign: 'text-bottom'}}><>{icons.icon('cart', 32)}</></span> Shop</h2>
                        <p>Create shopping lists from your recipes.</p>
                    </Col>
                    <Col md>
                        <h2><span><>{icons.icon('share', 32)}</></span> Share</h2>
                        <p>Share your recipes with friends and family.</p>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Home;