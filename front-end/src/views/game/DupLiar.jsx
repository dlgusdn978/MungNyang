import React, { useState, useEffect } from "react";
import VideoComponent from "../../components/VideoComponent";
import foot from "../../assets/img/foot.png";
import Timer from "../../components/Timer";
import { Container } from "../../components/layout/common";
import {
    Box,
    Item,
    NotificationContainer,
    ImageOverlay,
} from "../../components/layout/selectLiar";
import { changePhase } from "../../store/phaseSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectLiar, selectedLiar, Result } from "../../api/game";
import { gameActions } from "../../store/gameSlice";

const DupLiar = () => {
    const openvidu = useSelector((state) => state.openvidu);
    const { session, publisher } = openvidu;
    const setId = useSelector((state) => state.game.setId);
    const [showNotification, setShowNotification] = useState(true);
    const [activeBox, setActiveBox] = useState(null);
    const text = "이들 중 라이어를 다시 지목하세요.";
    const imgSrc = foot;
    const dispatch = useDispatch();
    const roomId = useSelector((state) => state.openvidu.mySessionId);
    const updatedDupLiars = useSelector((state) => state.game.dupLiars);

    useEffect(() => {
        const runSelectLiarPhase = async () => {
            try {
                const response = await selectLiar(setId, activeBox);
                console.log(response);
                setTimeout(async () => {
                    try {
                        const selectedLiarResponse = await selectedLiar(setId);
                        console.log(selectedLiarResponse);
                        if (
                            selectedLiarResponse.data.gameProcessType ===
                            "LiarVote"
                        ) {
                            const dupliars =
                                selectedLiarResponse.data.mostVotedNicknames;
                            console.log(dupliars);
                            dispatch(gameActions.updateDupLiars(dupliars));
                            runSelectLiarPhase();
                        } else if (
                            selectedLiarResponse.data.gameProcessType ===
                            "SelectAns"
                        ) {
                            const mostVotedNickname =
                                selectedLiarResponse.data.mostVotedNicknames[0];
                            console.log(mostVotedNickname);

                            dispatch(
                                gameActions.updateSelectedLiar(
                                    mostVotedNickname,
                                ),
                            );

                            console.log(mostVotedNickname);

                            if (
                                publisher.stream.connection.data ===
                                mostVotedNickname
                            ) {
                                dispatch(changePhase("SelectAns"));
                            } else {
                                dispatch(changePhase("OtherView"));
                            }
                        } else {
                            try {
                                const response = await Result(
                                    setId,
                                    roomId,
                                    0,
                                    0,
                                );
                                const result = response.data;
                                console.log(result);

                                dispatch(gameActions.updateResult(result));
                                dispatch(changePhase("MidScore"));
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }, 5000);
            } catch (error) {
                console.error(error);
            }
        };
        const timer = setTimeout(runSelectLiarPhase, 10000);
        return () => clearTimeout(timer);
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowNotification(false);
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const handleBoxClick = (name) => {
        setActiveBox(name === activeBox ? null : name);
    };

    return (
        <Container>
            <Timer></Timer>
            <Box>
                {session.streamManagers &&
                    session.streamManagers.map((subscriber, i) => {
                        const nickname = subscriber.stream.connection.data;
                        const isDisplayed = updatedDupLiars.includes(nickname);

                        if (isDisplayed) {
                            return (
                                <React.Fragment key={i}>
                                    <Item
                                        onClick={() => handleBoxClick(nickname)}
                                    >
                                        <ImageOverlay
                                            active={activeBox === nickname}
                                        >
                                            <img
                                                src={imgSrc}
                                                alt="사진"
                                                width="100%"
                                            />
                                        </ImageOverlay>
                                        <VideoComponent
                                            width="350px"
                                            height="320px"
                                            streamManager={subscriber}
                                        />
                                    </Item>
                                </React.Fragment>
                            );
                        }

                        return null;
                    })}
                {session.streamManagers &&
                    session.streamManagers.map((subscriber, i) => {
                        const nickname = subscriber.stream.connection.data;
                        const isDisplayed = updatedDupLiars.includes(nickname);

                        if (!isDisplayed) {
                            return (
                                <React.Fragment key={i}>
                                    <Item>
                                        <VideoComponent
                                            width="350px"
                                            height="320px"
                                            streamManager={subscriber}
                                        />
                                    </Item>
                                </React.Fragment>
                            );
                        }

                        return null;
                    })}
            </Box>
            <NotificationContainer show={showNotification}>
                {text}
            </NotificationContainer>
        </Container>
    );
};

export default DupLiar;
