import { FiSearch } from "react-icons/fi";

const Search = () => {
  return (
    <div className="mt-4 inline-flex items-center relative w-75">
      <FiSearch className="relative left-7 text-gray-400" />
      <input
        id="search"
        type="text"
        placeholder="Search for projects..."
        className="bg-[#fefefe] pl-10 w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default Search;
