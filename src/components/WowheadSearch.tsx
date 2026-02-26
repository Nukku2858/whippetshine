import { useState } from "react";
import { Search } from "lucide-react";
import thottbotLogo from "@/assets/thottbot-logo.webp";

const WowheadSearch = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.wowhead.com/search?q=${encodeURIComponent(query.trim())}`, "_blank");
      setQuery("");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-center mb-2">
        <img src={thottbotLogo} alt="Thottbot" className="h-12 object-contain" />
      </div>
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 rounded-lg opacity-50 group-hover:opacity-100 blur-sm transition-opacity" />
        <div className="relative flex items-center bg-[#15171e] border border-yellow-700/50 rounded-lg overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, spells, NPCs…"
            className="flex-1 bg-transparent text-sm text-amber-50 placeholder:text-amber-50/40 px-3 py-2 outline-none"
          />
          <button
            type="submit"
            className="px-3 py-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Search size={16} />
          </button>
        </div>
      </form>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-1 tracking-wide">
        ⚔️ For the Horde… or Alliance. We don't judge.
      </p>
    </div>
  );
};

export default WowheadSearch;
