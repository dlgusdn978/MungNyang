import React from "react";
import RuleModal from "./RuleModal";
import ReadyModal from "./ReadyModal";
import { ModalBackdrop, ModalContainer } from "../layout";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, selectModal } from "../../store/store";

const MODAL_TYPES = {
    RuleModal: "RuleModal",
    ReadyModal: "ReadyModal",
    ResultModal: "ResultModal",
};

const MODAL_COMPONENTS = [
    {
        type: MODAL_TYPES.LoginModal,
        component: <RuleModal />,
    },
    {
        type: MODAL_TYPES.BasicModal,
        component: <ReadyModal />,
    },
];

const Modal = () => {
    // modal type을 string 형태로 받습니다.
    const { modalType, isOpen } = useSelector(selectModal);
    const dispatch = useDispatch();
    if (!isOpen) return;

    const findModal = MODAL_COMPONENTS.find((modal) => {
        return modal.type === modalType;
    });

    const renderModal = () => {
        return findModal.component;
    };
    return (
        <ModalContainer>
            <ModalBackdrop onClick={() => dispatch(closeModal())}>
                {renderModal()}
            </ModalBackdrop>
        </ModalContainer>
    );
};

export default Modal;
