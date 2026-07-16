import { Cloud, Sun } from "lucide-react";

// Replace null with a public asset path, for example "/images/hina-avatar.gif".
const AVATAR_IMAGE_SRC: string | null = null;

interface HinaAvatarProps {
  size?: "header" | "sidebar";
  className?: string;
}

export function HinaAvatar({
  size = "header",
  className = "",
}: HinaAvatarProps) {
  return (
    <div
      className={`hina-avatar-frame hina-avatar-${size} ${className}`}
      aria-label="阳菜头像"
    >
      {AVATAR_IMAGE_SRC ? (
        <img
          className="h-full w-full object-cover"
          src={AVATAR_IMAGE_SRC}
          alt="阳菜"
        />
      ) : (
        <span className="hina-avatar-placeholder" aria-hidden="true">
          <Sun className="hina-avatar-sun" />
          <Cloud className="hina-avatar-cloud" />
        </span>
      )}
    </div>
  );
}
