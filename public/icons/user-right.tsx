import React from 'react';

interface UserRightIconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
}

const UserRightIcon: React.FC<UserRightIconProps> = ({
  width = 21,
  height = 20,
  color = 'white',
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16.3334 17.5L18.8334 15M18.8334 15L16.3334 12.5M18.8334 15H13.8334M10.5 12.9167H6.75002C5.58705 12.9167 5.00557 12.9167 4.5324 13.0602C3.46707 13.3834 2.63339 14.217 2.31022 15.2824C2.16669 15.7555 2.16669 16.337 2.16669 17.5M12.5834 6.25C12.5834 8.32107 10.9044 10 8.83335 10C6.76229 10 5.08335 8.32107 5.08335 6.25C5.08335 4.17893 6.76229 2.5 8.83335 2.5C10.9044 2.5 12.5834 4.17893 12.5834 6.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UserRightIcon;