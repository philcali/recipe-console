import { PropsWithChildren } from "react";

function Header({ children }: PropsWithChildren) {
    return (
        <h2 className="mt-3 mb-2 pb-2" style={{borderBottom: '1px solid #ddd'}}>{children}</h2>
    )
}

export default Header;