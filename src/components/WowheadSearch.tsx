import { useState } from "react";
import { Search, Sword } from "lucide-react";

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
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 rounded-lg opacity-60 group-hover:opacity-100 blur-sm transition-opacity" />
        <div className="relative flex items-center bg-[#15171e] border border-yellow-700/50 rounded-lg overflow-hidden">
          <div className="flex items-center gap-1.5 pl-3 text-amber-400">
            <Sword size={16} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline text-amber-300/80">Wowhead</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, spells, NPCs…"
            className="flex-1 bg-transparent text-sm text-amber-50 placeholder:text-amber-50/40 px-3 py-2.5 outline-none"
          />
          <button
            type="submit"
            className="px-3 py-2.5 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Search size={16} />
          </button>
        </div>
      </form>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-1.5 tracking-wide">
        ⚔️ For the Horde… or Alliance. We don't judge.
      </p>
    </div>
  );
};

export default WowheadSearch;
