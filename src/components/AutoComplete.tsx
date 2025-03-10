import React, { useState, useEffect, useRef } from "react";
import { Suggestion } from "../types";
import { fetchRealSuggestions } from "../services/api";

const AutoComplete = () => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  
  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const fetchData = async () => {
      
      const results = await fetchRealSuggestions(query); 
      setSuggestions(results);
      setIsOpen(results.length > 0);
    };

    const timeout = setTimeout(fetchData, 300); 
    return () => clearTimeout(timeout);
  }, [query]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          setQuery(suggestions[activeIndex].name);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  
  const handleSelect = (name: string) => {
    setQuery(name);
    setIsOpen(false);
  };

  
  const highlightMatch = (text: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <strong>{text.substring(index, index + query.length)}</strong>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <div className="autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="autocomplete-input"
      />

      {isOpen && (
        <ul ref={listRef} className="autocomplete-list">
          {suggestions.length === 0 ? (
            <li className="autocomplete-item">No results found</li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                onClick={() => handleSelect(suggestion.name)}
                className={`autocomplete-item ${
                  index === activeIndex ? "active" : ""
                }`}
              >
                {highlightMatch(suggestion.name)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;
