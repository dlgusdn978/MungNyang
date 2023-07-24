import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

const GlobalStyle = createGlobalStyle`
    ${reset}
    body {
        /* font-family: "Gugi", cursive; */
        /* font-family: 'Bagel Fat One', cursive; */
        font-family: 'Black Han Sans', sans-serif;
    }
`;

export default GlobalStyle;
