import consts from "@/consts";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Search = () => {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any>({});
    const registeredDocClickRef = React.useRef(false);

    useEffect(() => {
        if (search.length === 0) {
            setResults({});
            return;
        }
        fetch(`${consts.API_URL}/search?q=${search}`)
            .then(async (response) => {
                const data = await response.json();
                setResults(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [search]);

    const onChange = (e: any) => {
        setSearch(e.target.value.trim());
    };

    useEffect(() => {
        if (search.length === 0) {
            return;
        }
        if (registeredDocClickRef.current) {
            return;
        }

        function docClick() {
            setSearch("");
            setResults({});
            document.removeEventListener("click", docClick);
        }

        document.addEventListener("click", docClick);
        registeredDocClickRef.current = true;

        return () => {
            document.removeEventListener("click", docClick);
            registeredDocClickRef.current = false;
        };
    }, [search]);

    return (
        <div className="flex flex-row items-center justify-between w-full relative">
            <input
                type="text"
                value={search}
                onChange={onChange}
                className="mx-auto w-full text-gray-700 placeholder-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent border-2 border-stone-400 text-lg bg-stone-100"
            />
            {search.length > 0 && (
                <div className="absolute bg-gray-100 rounded-lg shadow-lg overflow-hidden max-h-96 top-16 w-full z-50">
                    <div className="flex flex-col items-start justify-between px-4 py-2">
                        <h2 className="text-gray-900 font-semibold">Users</h2>
                        {results?.users?.length
                            ? results?.users?.map((user: any) => (
                                  <div
                                      className="flex flex-row items-center justify-between px-4 py-2 hover:bg-gray-100"
                                      key={user.id}
                                  >
                                      <Link
                                          href={`/u/${user.username}`}
                                          className="text-gray-900"
                                      >
                                          u/{user.username}
                                      </Link>
                                  </div>
                              ))
                            : null}
                    </div>
                    <div className="flex flex-col items-start justify-between px-4 py-2 bg-gray-100">
                        <h2 className="text-gray-900 font-semibold">
                            Communities
                        </h2>
                        {results?.communities?.length
                            ? results?.communities?.map((comm: any) => (
                                  <div
                                      className="flex flex-row items-center justify-between px-4 py-2 hover:bg-gray-100"
                                      key={comm.id}
                                  >
                                      <Link
                                          href={`/c/${comm.name}`}
                                          className="text-gray-900"
                                      >
                                          c/{comm.name}
                                      </Link>
                                  </div>
                              ))
                            : null}
                    </div>
                    <Link
                        href={`/search?q=${search}`}
                        className="w-full px-4 py-2 bg-gray-100"
                    >
                        search for {search} on Mosaic
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Search;
