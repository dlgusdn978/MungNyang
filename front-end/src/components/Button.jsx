import React from "react";
import { styled } from "styled-components";

const StyledButton = styled.button`
    width: ${(props) =>
        props.type !== "icon" && !props.width ? "200px" : props.width};
    height: ${(props) =>
        props.type !== "icon" && !props.height ? "50px" : props.height};
    background: ${(props) => props.background ?? `var(--vanilla-cream)`};
    font-size: ${(props) => props.fontSize ?? "16px"};
    color: ${(props) => props.fontColor ?? `var(--white)`};
    font-weight: ${(props) => props.weight ?? "normal"};
    border-radius: ${(props) => props.border ?? "30px"};
    cursor: pointer;
    align-items: center;
    object-fit: ${(props) => (props.type === "icon" ? "fill" : "none")};
    border: none;
    &:hover {
        transition: all 0.8s;
        color: ${(props) =>
            props.hoverColor ? props.fontColor : `var(--black)`};
        background-color: ${(props) =>
            props.hoverBgColor ? props.background : `var(--macciato)`};
    }
`;

const Button = (props) => {
    const {
        width,
        height,
        hoverColor,
        hoverBgColor,
        background,
        fontSize,
        fontColor,
        weight,
        border,
        onClick,
        children,
        type,
    } = props;

    return (
        <StyledButton
            width={width}
            height={height}
            background={background}
            fontSize={fontSize}
            fontColor={fontColor}
            weight={weight}
            border={border}
            onClick={onClick}
            type={type}
            hoverColor={hoverColor}
            hoverBgColor={hoverBgColor}
        >
            {/* {text} */}
            {children}
        </StyledButton>
    );
};

export default Button;
