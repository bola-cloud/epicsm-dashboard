import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search jobs...'
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="relative flex w-full max-w-md items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-4 pr-10 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
      />
      <button
        onClick={onSearch}
        className="absolute right-2 text-gray-500 hover:bg-gray p-2 rounded-full text-primary"
      >
        <Search size={20} />
      </button>
    </div>
  );
};

export default SearchBar;