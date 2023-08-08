import React, { useState, useEffect, useRef } from "react";
import VideoComponent from "../../components/VideoComponent";
import Button from "../../components/Button";
import {
    Container,
    ContainerBody,
    HeaderBox,
    LeftBox,
    RightBox,
    MicBar,
    MicBox,
    VolumeSlider,
    EmptyScreen,
    NickName,
    FlexRowBox,
    SettingIcon,
    RefreshIcon,
    RightItem,
} from "../../components/layout/connectionTest";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Error from "../Error";
import Input from "../../components/Input";
import VideoDeviceSelector from "../../components/test/VideoDeviceSelector";
import { getNickname } from "../../api/room";
import Switch from "../../components/test/Switch";
import { MidText } from "../../components/layout/common";

const TestSound = require("../../assets/audio/test_sound.mp3");

function ConnectionTest() {
    const [micVolumeValue, setMicVolumeValue] = useState(0);
    const [outputVolumeValue, setOutputVolumeValue] = useState(50); // 출력 볼륨 상태 추가
    const [isOn, setIsOn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const mySessionId = useSelector((state) => state.openvidu.mySessionId);
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const [nickName, setNcikname] = useState("닉네임");

    const name = "test";
    const handleChange = (e) => {
        setNcikname(name);
    };
    // 사용자 제스처와 연관된 플래그
    const [userGesturePerformed, setUserGesturePerformed] = useState(false);

    const handleGoWaitingRoom = () => {
        navigate("/game");
        console.log(mySessionId);
    };

    function handleToggle() {
        setIsOn(!isOn);
    }

    const refreshName = () => {
        setNcikname(getNickname());
    };

    useEffect(() => {
        // AudioContext 생성
        const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        // 마이크 볼륨 업데이트
        updateMicVolume();

        return () => {
            // 컴포넌트가 언마운트될 때 AudioContext 정리
            audioContext.close().then(() => {
                console.log("AudioContext is closed!");
            });
        };
    }, []);

    function updateMicVolume() {
        const analyser = audioContextRef.current.createAnalyser();
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const source =
                    audioContextRef.current.createMediaStreamSource(stream);
                source.connect(analyser);

                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                function update() {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = dataArray.reduce((acc, val) => acc + val, 0);
                    let micVolume = sum / dataArray.length;
                    micVolume = Math.min(Math.max(micVolume, 0), 100);
                    micVolume = Math.round(micVolume);
                    micVolume = micVolume || 1;
                    setMicVolumeValue(micVolume);
                    requestAnimationFrame(update);
                }

                update();
            })
            .catch((error) => {
                console.error("마이크 접근 에러:", error);
            });
    }

    function handleTestButtonClick() {
        setIsPlaying(true);
        audioRef.current.play();

        // 사용자 제스처와 연관된 부분에서 AudioContext 생성
        const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        audioRef.current.play().then(() => {
            // 사용자 제스처와 연관된 부분에서 setUserGesturePerformed를 true로 설정
            setUserGesturePerformed(true);

            // 사용자 제스처와 연관된 부분에서 AudioContext가 이미 시작되어 있을 수 있으므로 상태를 확인합니다.
            if (audioContext.state === "suspended") {
                audioContext.resume().then(() => {
                    console.log("AudioContext is resumed!");
                });
            }
        });
    }

    useEffect(() => {
        function requestMicPermission() {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    updateMicVolume();
                })
                .catch((error) => {
                    console.error("마이크 접근 에러:", error);
                });
        }
        requestMicPermission();
    }, []);

    function updateOutputVolume(newVolume) {
        setOutputVolumeValue(newVolume);

        const audioElement = document.querySelector("audio");
        if (audioElement) {
            const volume = newVolume / 100;
            audioElement.volume = volume;
        } else {
            console.error("스피커 접근 에러");
        }
    }

    function handleVolumeChange(event) {
        const newOutputVolume = parseInt(event.target.value);
        updateOutputVolume(newOutputVolume);
    }
    return (
        <>
            {mySessionId ? (
                <Container>
                    <ContainerBody>
                        <LeftBox className="LeftBox">
                            <HeaderBox>
                                <SettingIcon width="30" height="30" />
                            </HeaderBox>
                            {isOn ? (
                                <EmptyScreen />
                            ) : (
                                <VideoComponent width="450" height="450" />
                            )}
                            <br />
                            <Switch isOn={isOn} onToggle={handleToggle} />
                        </LeftBox>
                        <RightBox className="RgihtBox">
                            <RightItem>
                                <MidText>마이크 선택</MidText>
                                <MicBox />
                            </RightItem>
                            <RightItem>
                                <MidText>입력확인</MidText>
                                <MicBar volume={micVolumeValue / 100} />
                            </RightItem>
                            <RightItem>
                                <MidText>스피커</MidText>
                                <MicBox />
                            </RightItem>
                            <RightItem>
                                <MidText>
                                    출력조절 : {outputVolumeValue}
                                </MidText>
                                <VolumeSlider
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={outputVolumeValue}
                                    onChange={handleVolumeChange}
                                    color="black"
                                />
                            </RightItem>
                            <RightItem>
                                <VideoDeviceSelector
                                    onDeviceSelected={(selectedDevice) =>
                                        console.log(selectedDevice)
                                    }
                                />
                            </RightItem>
                            <FlexRowBox>
                                <MidText>소리변조 테스트</MidText>

                                <Button
                                    text="테스트"
                                    width="100px"
                                    onClick={handleTestButtonClick}
                                    className="testBtn"
                                    color="black"
                                />
                            </FlexRowBox>

                            <FlexRowBox>
                                <NickName>
                                    <Input
                                        value={nickName}
                                        disabled="disabled"
                                        onChange={handleChange}
                                    />
                                </NickName>
                                <Button
                                    isOn={isOn}
                                    onClick={refreshName}
                                    type="icon"
                                    width="100px"
                                    hoverBgColor="white"
                                    background="dusty-pink-white"
                                >
                                    <RefreshIcon />
                                </Button>
                                <Button
                                    width="100px"
                                    height="60px"
                                    onClick={() => {
                                        handleGoWaitingRoom();
                                    }}
                                    background={`var(--dusty-pink-white)`}
                                    color="black"
                                >
                                    입장
                                </Button>
                            </FlexRowBox>
                        </RightBox>
                        <audio ref={audioRef} src={TestSound} loop={false} />
                    </ContainerBody>
                </Container>
            ) : (
                <Error />
            )}
        </>
    );
}

export default ConnectionTest;
