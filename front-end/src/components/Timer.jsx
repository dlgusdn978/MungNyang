import React, { useState, useEffect } from "react";
import "react-step-progress-bar/styles.css";
import { ProgressBar } from "react-step-progress-bar";
import "../css/style/timer.css";
import { useDispatch } from "react-redux";
import { closeModal } from "../store/modalSlice";

const Timer = (props) => {
    const {
        time = typeof props.time === "undefined" ? 5 : props.time,
        width = typeof props.width === "undefined" ? "100%" : props.width,
        height = typeof props.height === "undefined" ? "20px" : props.height,
        text,
        onTimerEnd,
    } = props;
    const [initialTime, setInitialTime] = useState(time);
    const decreaseRatio = 10 / initialTime;
    const [progress, setProgress] = useState(100);
    const dispatch = useDispatch();
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((progress) => progress - decreaseRatio);
        }, 100);

        setTimeout(() => {
            clearInterval(timer);
            dispatch(closeModal());
            if (onTimerEnd) {
                onTimerEnd();
            }
        }, time * 1000);
    }, [time, decreaseRatio, dispatch]);

    return (
        <>
            <ProgressBar
                percent={progress}
                height={height}
                text={text}
                width={width}
            ></ProgressBar>
        </>
    );
};

export default React.memo(Timer);
