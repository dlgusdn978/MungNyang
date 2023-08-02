import React from "react";
import { styled } from "styled-components";

const StyledInput = styled.input`
    width: ${(props) => props.width};
    height: ${(props) => props.height};
    border: none;
    background-color: var(--white);
    color: var(--black);
    font-size: ${(props) => props.fontSize};
    margin: ${(props) => props.margin};
    padding: ${(props) => props.padding};
    border-radius: 10px;
    placeholder: ${(props) => props.placeholder};
    &:focus {
        outline: none;
    }
`;

const Input = (props) => {
    const {
        type,
        width,
        height,
        placeholder,
        margin,
        padding,
        onChange,
        id,
        value,
    } = props;

    return (
        <StyledInput
            type={type}
            placeholder={placeholder}
            width={width}
            height={height}
            margin={margin}
            padding={padding}
            onChange={onChange}
            id={id}
            value={value}
        />
    );
};

export default Input;
