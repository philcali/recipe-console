import { useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import { parseTokenFromHash } from "../lib/session/SessionStorage";

function Login() {
    const navigate = useNavigate();
    const auth = useAuth();
    const location = useLocation();
    const token = parseTokenFromHash(location.hash)
    useEffect(() => {
        if (token?.accessToken) {
            auth.login(token).finally(() => {
                navigate(token.redirect, { replace: true });
            });
        }
    });
    return (
        <Container>
            <Spinner animation="border"/>
        </Container>
    )
}

export default Login;