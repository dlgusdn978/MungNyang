import React, { useRef } from "react";
import { styled } from "styled-components";

const VideoComponent = (props) => {
    // styled-components settings
    const { width, height, border } = props;

    const StyledVideo = styled.video`
        width: ${width ?? "100px"};
        height: ${height ?? "100px"};
        border: ${border ?? "0px"};
    `;
    // video calls
    const videoRef = useRef(null);
    const constraints = {
        audio: true,
        video: true,
    };
    // video on
    const startVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = stream;
        }
    };
    // video off
    const endVideo = async () => {
        videoRef.current.src.Object = null;
    };
    return (
        <div>
            <StyledVideo
                width={width}
                height={height}
                border={border}
                ref={videoRef}
                autoPlay
            />
            <button onClick={startVideo}>start</button>
            <button onClick={endVideo}>end</button>
        </div>
    );
};

export default VideoComponent;
