import React from "react";

interface MethaneIconProps {
    size?: number;
    color?: string;
    style?: React.CSSProperties;
}

/** Blue flame + droplet icon matching the user's provided methane icon */
export default function MethaneIcon({ size = 24, color = "#0ea5e9", style }: MethaneIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width={size}
            height={size}
            fill="none"
            style={style}
        >
            {/* Outer flame */}
            <path
                d="M32 4C32 4 12 26 12 40a20 20 0 0 0 40 0C52 26 32 4 32 4Z"
                fill={color}
            />
            {/* Inner lighter flame */}
            <path
                d="M32 18C32 18 22 32 22 40a10 10 0 0 0 20 0C42 32 32 18 32 18Z"
                fill={color}
                opacity={0.55}
            />
            {/* Water droplet */}
            <path
                d="M32 34c-2 0-4 3-4 6a4 4 0 0 0 8 0c0-3-2-6-4-6Z"
                fill={color}
                opacity={0.3}
            />
        </svg>
    );
}
