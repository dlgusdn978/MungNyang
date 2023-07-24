import React, { useRef } from "react";
import { styled } from "styled-components";

const VideoComponent = (props) => {
    const { width, height, border } = props;

    const StyledVideo = styled.video`
        width: ${width ?? "100px"};
        height: ${height ?? "100px"};
        border: ${border ?? "0px"};
    `;
    return (
        <StyledVideo width={width} height={height} border={border} autoPlay />
    );
};

function VideoComponents(props) {
    const width = props.width;
    const height = props.height;
    const videoRef = useRef(null);
    const constraints = {
        audio: true,
        video: true,
    };
    const startVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = stream;
        }
    };
    const endVideo = async () => {
        videoRef.current.srcObject = null;
    };

    return (
        <div>
            <video autoPlay ref={videoRef}></video>
            <div>video test</div>
            <button onClick={startVideo}>start</button>
            <button onClick={endVideo}>end</button>
        </div>
    );
}

export default VideoComponent;
