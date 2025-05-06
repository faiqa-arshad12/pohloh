import {useState, useRef, useEffect} from "react";
import {Search} from "lucide-react";

interface SearchInputProps {
  onChange: (value: string) => void;
}

export default function SearchInput({ onChange }: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center">
      {isOpen ? (
        <div className="flex items-center border border-zinc-700 rounded-full px-4 py-4 w-64 transition-all">
          <Search className="w-4 h-4 text-white mr-2 cursor-pointer" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-white placeholder-zinc-400 w-full"
            onChange={handleInputChange}
            onBlur={() => setIsOpen(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full border border-zinc-700 hover:bg-zinc-800 transition !cusror-pointer"
        >
          <Search className="w-5 h-5 text-white cursor-pointer"  />
        </button>
      )}
    </div>
  );
}
