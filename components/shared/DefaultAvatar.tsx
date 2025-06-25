import React from "react";
import {Icon} from "@iconify/react";

export interface DefaultAvatarProps {
  size?: number;
  className?: string;
}

export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  size = 71,
  className = "",
}) => (
  <div className="">
    <Icon
      icon="mdi:user"
      width={size}
      height={size}
      color="#A2A2A2"
      className={className}
    />
  </div>
);

export default DefaultAvatar;
