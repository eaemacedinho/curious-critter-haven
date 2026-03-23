import { ExternalLink } from "lucide-react";

interface Props {
  spotifyUrl: string;
}

function extractSpotifyEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Convert open.spotify.com/show/xxx or open.spotify.com/episode/xxx to embed
  const match = url.match(/open\.spotify\.com\/(show|episode)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  return null;
}

export default function SpotifyEmbed({ spotifyUrl }: Props) {
  const embedUrl = extractSpotifyEmbedUrl(spotifyUrl);

  return (
    <div className="mb-6 animate-k-fade-up" style={{ animationDelay: ".2s" }}>
      {/* Spotify Player Embed */}
      {embedUrl && (
        <div className="rounded-2xl overflow-hidden mb-3">
          <iframe
            src={embedUrl}
            width="100%"
            height="232"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0 rounded-2xl"
            title="Spotify Player"
          />
        </div>
      )}

      {/* Platform buttons */}
      <div className="flex gap-2">
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 text-[#1DB954] text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
          </a>
        )}
      </div>
    </div>
  );
}

export { extractSpotifyEmbedUrl };
