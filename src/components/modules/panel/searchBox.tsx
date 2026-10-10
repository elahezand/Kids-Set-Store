"use client";

import { type FormEvent, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import { useQueryParams } from "@/services/client/listing";

interface SearchBoxProps {
  placeholder?: string;
  param?: string;
}

export default function SearchBox({ placeholder = "Search...", param = "q" }: SearchBoxProps) {
  const { get, update, isPending } = useQueryParams<string>();
  const current = get(param);
  const [value, setValue] = useState(current);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    update({ [param]: value.trim() || null });
  };

  const clear = () => {
    setValue("");
    update({ [param]: null });
  };

  return (
    <form onSubmit={submit} role="search" className="relative w-full sm:w-64">
      <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className={`input py-2 pr-9 pl-9 text-sm ${isPending ? "opacity-70" : ""}`}
      />
      {current && (
        <button
          type="button"
          onClick={clear}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Clear search"
        >
          <LuX className="size-3.5" />
        </button>
      )}
    </form>
  );
}
