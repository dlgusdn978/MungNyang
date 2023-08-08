import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store";
import GlobalStyle from "./components/style/GlobalStyle";
import Modal from "./components/modal/Modal";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Modal />
            <App />
            <GlobalStyle />
        </PersistGate>
    </Provider>,
);
