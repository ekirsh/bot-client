import { useState, useEffect, useRef } from 'react';
import axios from 'axios'
import Typed from 'typed.js';


function App() {
    const [input, setInput] = useState('');
    const [artistID, setArtistID] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [clicked, setClicked] = useState(false);
    const [search, setSearch] = useState(true);
    const statusRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [active_scrapers, setActiveScrapers] = useState([]);
    const [searchError, setSearchError] = useState(false);


    useEffect(() => {
        fetch('https://fastapi-production-3513.up.railway.app/get_active_scrapers')
            .then(response => response.json())
            .then(data => setActiveScrapers(data))
            .catch(error => console.error(error));
    }, []);

    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('submitting');
        setClicked(true);
        setLoading(true);
        const response = await fetch(`https://fastapi-production-3513.up.railway.app/artists/${input}`)
            .then(response => response.json())
            .then(data => {
                setArtistID(data)
                console.log(data)
            })
            .catch(error => console.error(error));
    };

    useEffect(() => {
        console.log(clicked)
        if (artistID !== '' && clicked === true) {
            const interval = setInterval(async () => {
                console.log('fetching')
                const response = await fetch(`https://fastapi-production-3513.up.railway.app/artist-data/${artistID}`);
                const data = await response.json();
                console.log(data);
                console.log(loading);
                if (Array.isArray(data)) {
                    setCollaborators(data);
                    setLoading(false);
                    setSearch(false);
                    console.log(loading);
                }
                else {
                    if (data['message'] === 'Scraper had an error') {
                        console.log('SCRAPER ERROR')
                    }
                }
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [artistID, clicked]);

    function backToHome() {
        setClicked(false);
        setLoading(false);
        setMenuOpen(false);
        setInput('');
    }


    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">

            <header className="py-6 px-8 bg-white shadow-md">
                <div className="flex justify-between items-center">
                    <h1 onClick={backToHome} className="text-xl font-bold text-gray-900">beatscout</h1>
                    <button onClick={toggleMenu} className="p-2 bg-gray-200 rounded-md text-gray-900 hover:bg-gray-300 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1H3V4zm3 4a1 1 0 0 1-1-1V5h10v2a1 1 0 0 1-1 1H6zm-3 5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1H3v-1zm3 4a1 1 0 0 1-1-1v-2h10v2a1 1 0 0 1-1 1H6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {menuOpen && (
                        <div className="fixed top-0 right-0 h-screen w-64 bg-white shadow-lg">
                            <div
                                className="flex justify-between items-center bg-slate-800 text-white py-4 px-6 rounded-t-lg">
                                <h2 className="text-lg font-semibold">Scanned Artists</h2>
                                <button onClick={toggleMenu} className="text-white focus:outline-none">
                                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M6.7 7.7a1 1 0 0 0 0 1.4L11.3 12l-4.6 4.6a1 1 0 0 0 1.4 1.4l4.6-4.6 4.6 4.6a1 1 0 0 0 1.4-1.4L14.7 12l4.6-4.6a1 1 0 1 0-1.4-1.4L13.3 10l-4.6-4.6a1 1 0 0 0-1.4 0z"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="py-4">

                            </div>
                        </div>

                                )}
                </div>
            </header>
            {loading ? (
                <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                    <div className="w-24 h-24 rounded-full border-4 border-t-blue-500 animate-spin mb-4"></div>
                    <h1 className="text-gray-800 font-bold text-2xl mb-2">Loading</h1>
                    <p ref={statusRef} className="text-gray-600 font-bold">We're scraping the internet for you, this may take a few minutes...</p>
                </div>
            ) : (
                <div className="">
                    {searchError && (
                        <div role="alert">
                            <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                                Error
                            </div>
                            <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                                <p>Unable to find artist</p>
                            </div>
                        </div>
                    )}
                    {search ? (
                        <main className="py-12">
                            <div className="container mx-auto px-8 py-12 rounded-lg shadow-lg bg-white">
                                <h2 className="text-4xl font-bold text-gray-900 mb-8">Find your next favorite writer/producer</h2>
                                <form onSubmit={handleSubmit} className="w-full max-w-xl">
                                    <div className="flex items-center mb-4">
                                        <input
                                            className="rounded-l-lg px-4 py-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                                            type="text"
                                            placeholder="Search for an artist..."
                                            value={input}
                                            onChange={(event) => setInput(event.target.value)}
                                        />
                                        <button
                                            className="bg-slate-800 text-white rounded-r-lg px-4 py-3 transition-all duration-200 hover:bg-blue-600 focus:outline-none"
                                            type="submit"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </main>

                    ) : (


                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {collaborators.map((result, index) => (
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-4 my-2 md:mx-2 md:my-4 max-w-sm">
                                    <div className="relative">
                                        <img className="w-full h-64 object-cover" src={result.info.image}
                                             alt="{{ producer.name }}" />
                                        <div
                                            className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black to-transparent">
                                            <h2 className="text-white font-bold text-xl mb-2">{result.name}</h2>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4">
                                        <h3 className="text-gray-800 font-semibold text-lg mb-2">Frequent Collaborators:</h3>
                                        <ul className="flex flex-wrap mb-4">
                                            {result.collaborators.slice(0, 6).map((c, index) => (
                                                <li className="text-gray-600 font-medium text-base mr-2 mb-2"><a
                                                    href="">{c.name}</a></li>
                                            ))}
                                        </ul>
                                        <h3 className="text-gray-800 font-semibold text-lg mb-2">Top Songs:</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {result.songs.slice(0,6).map((song, index) => (
                                                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                                    <img className="w-full h-40 object-cover" src={song.song_art}
                                                         alt="img" />
                                                    <div className="px-4 py-2">
                                                        <p className="text-gray-800 font-medium text-base">{song.title}</p>
                                                        <p className="text-gray-600 text-base">{song.primary_artist.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-gray-400 text-base mb-4">{result.info.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                </div>

            )}
        </div>


    );

}

export default App;
