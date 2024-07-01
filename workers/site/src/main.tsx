import React from "react"
import ReactDOM from "react-dom/client"
import MainView from "./components/MainView"
import "./globals.css"


// @ts-ignore
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <MainView />
    </React.StrictMode>
)
