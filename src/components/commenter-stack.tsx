type Props = {
  seed: string;
  count?: number;
  lastLabel?: string;
};

const AVATAR_POOL = [47, 12, 45, 15, 32, 68, 9, 5, 25, 31];

function pickAvatars(seed: string, n: number): string[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const start = h % AVATAR_POOL.length;
  return Array.from({ length: n }, (_, i) =>
    `https://i.pravatar.cc/64?img=${AVATAR_POOL[(start + i) % AVATAR_POOL.length]}`
  );
}

export function CommenterStack({ seed, count = 5, lastLabel = "New comment 14d ago" }: Props) {
  const avatars = pickAvatars(seed, count);
  return (
    <div className="commenters">
      <div className="commenters-stack">
        {avatars.map((src, i) => (
          <img key={i} className="commenters-av" src={src} alt="" loading="lazy" />
        ))}
      </div>
      <span className="commenters-label">{lastLabel}</span>
    </div>
  );
}
