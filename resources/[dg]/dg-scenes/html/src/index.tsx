import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { Menu } from "./components/Menu";
import { nuiPost } from "./lib/nui";
import theme from './theme';

function App() {
    const [visible, setVisible] = useState(false)

    const openMenu = () => {
        setVisible(true)
    }

    const closeMenu = () => {
        setVisible(false)
        nuiPost('Close')
    }

    useEffect(() => {
        const eventHandler = (e : MessageEvent) => {
            switch (e.data.action) {
                case "open":
                    openMenu()
                    break;
            }
        }
    
        const pressHandler = (e : KeyboardEvent) => {
            switch (e.key) {
                case 'Escape': 
                    closeMenu()
                    break;
            }
        }

        window.addEventListener("message", eventHandler)
        window.addEventListener("keydown", pressHandler)

        return () => {
            window.removeEventListener("message", eventHandler)
            window.removeEventListener("keydown", pressHandler)
        }
    }, [visible]);

    return <Menu style={{visibility: visible ? 'visible' : 'hidden'}} closeMenu={closeMenu}/>
}

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>,
    document.getElementById("root")
)