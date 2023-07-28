package com.mung.mung.db.repository;

import com.mung.mung.api.dto.GameRoomDto;
import com.mung.mung.api.dto.QGameRoomDto;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import static com.mung.mung.db.entity.QGameRoom.gameRoom;
import java.util.List;

@RequiredArgsConstructor
public class GameRoomRepositoryImpl implements GameRoomRepositoryCustom{
    private final JPAQueryFactory queryFactory;
    // queryFactory 내부 메서드 들을 사용하기 위함
//    QGameRoom qGameRoom = QGameRoom.gameRoom;
    @Override
    public GameRoomDto findByTitle(String roomTitle) {
        return queryFactory
                .select(new QGameRoomDto(gameRoom.roomTitle, gameRoom.roomPw, gameRoom.roomUrl))
                .from(gameRoom)
                .where(gameRoom.roomTitle.eq(roomTitle))
                .fetchOne();
    }

    // @Override
    // public GameRoomDto findByPk(long roomPw){
    //     return queryFactory
    //             .select(new QGameRoomDto(gameRoom.roomTitle, gameRoom.roomPw, gameRoom.roomUrl))
    //             .from(gameRoom)
    //             .where(gameRoom.roomPw.eq(roomPw))
    //             .fetchOne();
    // }
}
