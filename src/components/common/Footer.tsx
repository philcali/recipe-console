import { Container } from "react-bootstrap";

function Footer() {
    return (
        <Container>
            <hr/>
            <footer className="container">
                <p>
                    <span dangerouslySetInnerHTML={{'__html': "&copy"}} />
                    Calico. {new Date().getFullYear()}
                </p>
            </footer>
        </Container>
    )
}

export default Footer;