import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface CancelButtonProps {
    readonly disabled?: boolean;
    readonly className?: string;
}

function CancelButton(props: CancelButtonProps) {
    const navigate = useNavigate();
    return (
        <Button onClick={() => navigate(-1)} {...props} variant="outline-secondary">Cancel</Button>
    )
}

export default CancelButton;