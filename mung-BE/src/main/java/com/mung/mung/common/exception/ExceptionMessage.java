package com.mung.mung.common.exception;

public enum ExceptionMessage {
    // 다른 예외 메시지들도 추가 가능
    USER_NOT_EXIST_MESSAGE("User does not exist."),
    ROOM_NOT_EXIST_MESSAGE("Room does not exist."),
    GAME_NOT_EXIST_MESSAGE("Game does not exist."),

    QUIZ_NOT_FOUND_MESSAGE("Quiz does not exist."),
    SET_NOT_EXIST_MESSAGE("GameSet does not exist."),
    LIAR_VOTE_RESULT_NOT_FOUND_MESSAGE("라이어 투표 정보가 존재하지 않습니다"),
    LIAR_ANSWER_OPTIONS_NOT_EXIST_MESSAGE("정답 리스트가 존재하지 않습니다"),
    PLAYER_NOT_EXIST_MESSAGE("Player does not exist."),
    VOTES_NOT_START_MESSAGE("투표가 시작되지 않았습니다"),

    
    ROOM_ALREADY_START_EXCEPTION("이미 게임이 시작된 방입니다."),
    ROOM_ALREADY_EXISTS_EXCEPTION("이미 같은 이름으로 생성된 방이 존재합니다"),
    SESSION_NOT_EXIST_EXCEPTION("유효하지 않은 세션[ROOM_ID]입니다.")
    ;

    private final String message;

    ExceptionMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
