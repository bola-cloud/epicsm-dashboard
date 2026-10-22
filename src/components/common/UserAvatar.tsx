"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  photo?: string | null;
  name?: string | null;
  email?: string | null;
  sizeClasses?: string;
  textClasses?: string;
  className?: string;
}

const BG_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-teal-500 to-emerald-600",
];

function getGradient(identifier: string = ""): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BG_GRADIENTS.length;
  return BG_GRADIENTS[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photo,
  name,
  email,
  sizeClasses = "h-14 w-14",
  textClasses = "text-xl font-bold",
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const identifier = (name || email || "User").trim();
  const initial = identifier.charAt(0).toUpperCase() || "U";
  const gradient = getGradient(identifier);

  const isValidPhoto = photo && typeof photo === "string" && photo.trim().length > 0 && !hasError;

  if (isValidPhoto) {
    return (
      <div className={`relative flex-shrink-0 overflow-hidden rounded-full ${sizeClasses} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={identifier}
          onError={() => setHasError(true)}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${gradient} text-white shadow-sm ${sizeClasses} ${className}`}
      title={identifier}
    >
      <span className={`${textClasses} select-none uppercase`}>{initial}</span>
    </div>
  );
};

export default UserAvatar;
