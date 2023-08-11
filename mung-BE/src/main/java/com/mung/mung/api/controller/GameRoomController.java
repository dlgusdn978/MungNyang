package com.mung.mung.api.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;

import com.mung.mung.api.request.GameRoomConnectReq;
import com.mung.mung.api.request.GameRoomCreateReq;
import com.mung.mung.api.request.RoomIdReq;
import com.mung.mung.api.service.GameRoomService;
import com.mung.mung.api.service.PlayerService;
import com.mung.mung.common.exception.custom.*;
import io.openvidu.java.client.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


//@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class GameRoomController {

    private final int LIMIT = 6;
    private final GameRoomService gameRoomService;
    private final PlayerService playerService;

    @Value("${OPENVIDU_URL}")
    private String OPENVIDU_URL;

    @Value("${OPENVIDU_SECRET}")
    private String OPENVIDU_SECRET;

    private OpenVidu openvidu;

    // 방 관리
    private Map<String, Integer> mapSessions = new ConcurrentHashMap<>();

    private Map<String, Boolean> sessionRecordings = new ConcurrentHashMap<>();
    // 방 비밀번호 체크용이라서 HashMap사용, 동기화 필요 X
    private Map<String, String> gameConnectionInfoMap = new HashMap<>();

    // 방과 Session을 매칭 시켜주기 위함 => 한글로 방 생성 가능
    private Map<String, String> sessionRoomConvert =new HashMap<>();
    private long convertNum=1;

    @PostConstruct
    public void init() {
        this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    @PostMapping("/game-sessions")
    public ResponseEntity<String> createRoom(@RequestBody GameRoomCreateReq gameRoomCreateReq)
            throws OpenViduJavaClientException, OpenViduHttpException {

        // makeRoom에서 return으로 중복된 Id가 있는지 없는지를 판단 후 중복이라면 Data 생성 없이 false값을 return함
        gameRoomService.makeRoom(gameRoomCreateReq.getRoomId(), gameRoomCreateReq);
        String roomId=gameRoomCreateReq.getRoomId();
        String roomPw= gameRoomCreateReq.getRoomPw();

        this.mapSessions.put(roomId, 0);
        // 방별로 Pw 저장해서 관리
        this.gameConnectionInfoMap.put(roomId,roomPw);
        this.sessionRoomConvert.put(roomId,"Mung"+this.convertNum);
        this.convertNum+=1;

        // GameRoomCreateReq 정보를 Map으로 변환 내장 라이브러리를 사용하기 위해서는 customSessionId로 hashMap을 만들어 주어야 함
        Map<String, Object> gameInfoMap = new HashMap<>();
        gameInfoMap.put("customSessionId", this.sessionRoomConvert.get(roomId));

        SessionProperties properties = SessionProperties.fromJson(gameInfoMap).build();
//        log.info("properties : ", String.valueOf(properties));
        Session session = openvidu.createSession(properties);
//        log.info("session : ",String.valueOf(session));

        return new ResponseEntity<>(roomId, HttpStatus.OK);
    }


    @PostMapping("/game-sessions/connections")
    public ResponseEntity<String> createConnection(@RequestBody GameRoomConnectReq gameRoomConnectReq)
            throws OpenViduJavaClientException, OpenViduHttpException {
        log.info("어떤 오류인지 로그 : {}",gameRoomConnectReq);
        String roomId=gameRoomConnectReq.getRoomId();
        String sessionId=sessionRoomConvert.get(roomId);
        log.info("세션 아이디 확인 로그 : {}",sessionId);
        Session session = openvidu.getActiveSession(sessionId); // 이 부분에서 열린 session을 찾아옴
        if (session == null) {
            throw new SessionNotExistException();
        }
        // 방 게임이 이미 시작됐으면 접속 차단.
        if (!gameRoomService.getRoomStatus(roomId).equals("waiting")){
            throw new RoomAlreadyStartException();
        }
        //
        if (!this.gameConnectionInfoMap.get(roomId).equals(gameRoomConnectReq.getRoomPw())){
            throw new RoomPasswordWrongException();
        }


        // 인원수가 LIMIT보다 작다면 인원수 1 추가
        if (this.mapSessions.get(roomId)<LIMIT){
            this.mapSessions.put(roomId, this.mapSessions.get(roomId) + 1);
        } else{ // LIMIT이 됐다면 접근불가
            throw new RoomAlreadyFullException();
        }

        // session 생성을 위해 Map으로 변환
        Map<String, String> gameInfoMap = new HashMap<>();
        gameInfoMap.put("customSessionId", this.sessionRoomConvert.get(roomId));
        // player pk 생성 필요.
        ConnectionProperties properties = ConnectionProperties.fromJson(gameInfoMap).build();
//        ConnectionProperties properties = ConnectionProperties.fromJson(gameConnectionInfoMap).build();
        Connection connection = session.createConnection(properties); //이 부분이 연결을 담당하는 부분
        log.info("Connection 확인 : {} " ,connection);
        log.info("Connection.token() 확인 : {} " ,connection.getToken());
        return new ResponseEntity<>(connection.getToken(), HttpStatus.OK);
    }


    @DeleteMapping("/game-sessions/leave/{encodeRoomId}/{playerId}")
    public ResponseEntity<String> leaveRoom(@PathVariable("encodeRoomId") String encodeRoomId,
                                            @PathVariable long playerId) throws UnsupportedEncodingException {
        String roomId = URLDecoder.decode(encodeRoomId, StandardCharsets.UTF_8);
        // roomId와 playerId가 유효하지 않은 경우 예외 처리
        if (roomId == null || roomId.isEmpty() || !gameRoomService.isRoomExists(roomId)) {
            throw new RoomNotExistException();
        }
        log.info("roomId info : {}",roomId);
        // 테스트 창에서 나가는 경우 인원은 +1 된 상태이므로 roomId만 일치하면 leave가 들어올 경우 인원을 뺀다.
        if (this.mapSessions.get(roomId)==null){
            throw new MapSessionNotExistException();
        }
        this.mapSessions.put(roomId, this.mapSessions.get(roomId) - 1);

        // DB에서 playerData 삭제하기 전에 playerId가 DB에 있는지 확인합니다.
        if (!gameRoomService.isPlayerExists(playerId)) { // 있으면 true
            throw new PlayerNotExistException();
        }

        if (this.mapSessions.get(roomId)>0) {
            // DB에서 playerData 삭제
            gameRoomService.leaveRoom(playerId);
        }else { // 만약 모든 사람이 방을 떠나면 GameRoom 데이터 삭제
            gameRoomService.deleteRoom(roomId);
            this.mapSessions.remove(roomId);
            this.gameConnectionInfoMap.remove(roomId);
            this.sessionRoomConvert.remove(roomId); //roomId,SessionID 삭제
        }

        return new ResponseEntity<>("Leave 처리 성공",HttpStatus.OK);
    }

    @PutMapping("/game-sessions/initialize")
    public ResponseEntity<String> roomInitialize(
            @RequestBody RoomIdReq roomIdReq){
        String roomId=roomIdReq.getRoomId();

        gameRoomService.roomInitialize(roomId);
        // All Player Initialize => 점수 초기화
        playerService.playerInitailize(roomId);

        return new ResponseEntity<>("방을 대기 중으로 변경 완료했습니다.",HttpStatus.OK);

    }

    // 테스트용

    @RequestMapping(value = "/room/recording/start", method = RequestMethod.POST)
    public ResponseEntity<?> startRecording(@RequestBody Map<String, Object> params) {
        // Session으로 반환
        String sessionId = sessionRoomConvert.get((String) params.get("session"));
//            Recording.OutputMode outputMode = Recording.OutputMode.valueOf((String) params.get("outputMode"));
        Recording.OutputMode outputMode = Recording.OutputMode.COMPOSED;
//            boolean hasAudio = (boolean) params.get("hasAudio");
//            boolean hasVideo = (boolean) params.get("hasVideo");
        boolean hasAudio = true;
        boolean hasVideo = true;



        RecordingProperties properties = new RecordingProperties.Builder().outputMode(outputMode).hasAudio(hasAudio)
                .hasVideo(hasVideo).build();

        System.out.println("Starting recording for session " + sessionId + " with properties {outputMode=" + outputMode
                + ", hasAudio=" + hasAudio + ", hasVideo=" + hasVideo + "}");

        try {
            Recording recording = this.openvidu.startRecording(sessionId, properties);
            this.sessionRecordings.put(sessionId, true);
            return new ResponseEntity<>(recording, HttpStatus.OK);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(value = "/room/recording/stop", method = RequestMethod.POST)
    public ResponseEntity<?> stopRecording(@RequestBody Map<String, Object> params) {
        String recordingId = sessionRoomConvert.get((String) params.get("recording"));

        System.out.println("Stoping recording | {recordingId}=" + recordingId);

        try {
            Recording recording = this.openvidu.stopRecording(recordingId);
            this.sessionRecordings.remove(recording.getSessionId());
            return new ResponseEntity<>(recording, HttpStatus.OK);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(value = "/room/recording/delete", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteRecording(@RequestBody Map<String, Object> params) {
        String recordingId = sessionRoomConvert.get((String) params.get("recording"));

        System.out.println("Deleting recording | {recordingId}=" + recordingId);

        try {
            this.openvidu.deleteRecording(recordingId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(value = "/room/recording/get/{recordingId}", method = RequestMethod.GET)
    public ResponseEntity<?> getRecording(@PathVariable(value = "recordingId") String recordingId) {

        System.out.println("Getting recording | {recordingId}=" + recordingId);
        String realRecordingId=sessionRoomConvert.get(recordingId);
        try {
            Recording recording = this.openvidu.getRecording(realRecordingId);
            return new ResponseEntity<>(recording, HttpStatus.OK);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(value = "/room/recording/list", method = RequestMethod.GET)
    public ResponseEntity<?> listRecordings() {

        System.out.println("Listing recordings");

        try {
            List<Recording> recordings = this.openvidu.listRecordings();

            return new ResponseEntity<>(recordings, HttpStatus.OK);
        } catch (OpenViduJavaClientException | OpenViduHttpException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
