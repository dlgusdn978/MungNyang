import GlobalStyle from "./components/style/GlobalStyle";
import VideoComponent from "./components/VideoBoxing";
function App() {
    return (
        <div className="App">
            <GlobalStyle />
            <span>도(그)라이(어 게임)</span>
            <VideoComponent width="300px" height="300px" />
        </div>
    );
}

export default App;
