import React from "react";

export const Avatar = React.memo(
  ({profilePicture, name}: {profilePicture?: string; name: string}) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div className="flex items-center gap-2">
        <div className="rounded-full h-12 w-12 flex items-center justify-center overflow-hidden bg-[#333333] !ml-[-10px]">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={`${name}'s avatar`}
              className="object-cover w-full h-full"
              onError={(e) => {
                // If image fails to load, show initials
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("bg-[#333333]");
              }}
            />
          ) : (
            <span className="text-white text-[16px] font-medium">
              {getInitials(name)}
            </span>
          )}
        </div>
        {name}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
