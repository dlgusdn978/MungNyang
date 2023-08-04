import React, { useState } from "react";
import WaitingRoom from "./game/WaitingRoom";
import ConnectionTest from "./game/ConnectionTest";
import TopBottomVideo from "./game/TopBottomVideo";
import { useDispatch, useSelector } from "react-redux";
import { ovActions } from "../store/openviduSlice";
import { OpenVidu } from "openvidu-browser";

const PHASES = {
    Test: "Test",
    Wait: "Wait",
    GameVote: "GameVote",
    Quiz: "Quiz",
    Category: "Category",
    Desc: "Desc",
    QnA: "QnA",
    Ans: "Ans",
    EmgAns: "EmgAns",
    LiarVote: "LiarVote",
    SelectAns: "SelectAns",
    OpenLiar: "OpenLiar",
    MidScore: "MidScore",
    FinScore: "FinScore",
    DupVote: "DupVote", // 최하위플레이어가 동점일때
    Dance: "Dance",
    Paint: "Paint",
};

const PHASE_COMPONENTS = [
    {
        type: PHASES.Test,
        component: <ConnectionTest />,
    },
    {
        type: PHASES.Wait,
        component: <WaitingRoom />,
    },
    {
        type: PHASES.Quiz,
        component: <TopBottomVideo />,
    },
    {
        type: PHASES.Category,
        component: <TopBottomVideo />,
    },
];

const Game = () => {
    const openvidu = useSelector((state) => state.openvidu);
    const {
        // OV,
        // session,
        subscribers,
        myUserName,
        mySessionId,
        mainStreamManager,
        devices,
    } = openvidu;

    const phaseType = useSelector((state) => state.phase.phaseType);
    const dispatch = useDispatch(); //dispatch로 reducer에 선언된 changePhase 불러와서 사용하면됨
    console.log(phaseType);

    console.log(openvidu);

    var OV = new OpenVidu();
    const session = OV.initSession();

    session
        .connect("")
        .then((data) => console.log(data))
        .catch((err) => console.log(err));

    if (session) {
        // On every new Stream received...
        session.on("streamCreated", (event) => {
            // Subscribe to the Stream to receive it. Second parameter is undefined
            // so OpenVidu doesn't create an HTML video by its own
            var subscriber = session.subscribe(event.stream, undefined);

            //We use an auxiliar array to push the new stream
            var subscribers = this.state.subscribers;

            subscribers.push(subscriber);

            // Update the state with the new subscribers
        });
    }
    console.log(subscribers);

    const findPhase = PHASE_COMPONENTS.find(
        (phase) => phase.type === phaseType,
    );

    if (!findPhase) {
        // 해당 phaseType에 맞는 컴포넌트를 찾지 못한 경우 오류 처리
        return <h1>Invalid phaseType: {phaseType}</h1>;
    }

    // dispatch(changePhase({ phaseType: "Wait" }));

    const renderPhase = () => {
        return findPhase.component;
    };

    return <>{renderPhase()}</>;
};

export default Game;
