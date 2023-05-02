import { useState, useEffect, useRef } from 'react';
import axios from 'axios'
import Typed from 'typed.js';
import Masonry from 'react-masonry-css';


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
    const [scraperError, setScraperError] = useState(false);
    const [active_scrapers, setActiveScrapers] = useState([]);
    const [searchError, setSearchError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (loading) {
            const options = {
                strings: ['We\'re gathering your data for you, wait just a second...', 'Just a bit longer now...', 'Scraping our database for the latest data...'],
                typeSpeed: 50,
                backSpeed: 30,
                loop: true,
            };

            const typed = new Typed(statusRef.current, options);

            return () => {
                typed.destroy();
            };
        }
    }, [loading]);

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1,
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const formatter = new Intl.DateTimeFormat(undefined, options);
        return formatter.format(date);
    };

    const TimestampDisplay = ({ timestamp }) => {
        return (
            <div className="text-sm font-normal text-gray-500">
                {formatDate(timestamp)}
            </div>
        );
    };

    function isDictionary(element) {
        return element !== null && typeof element === 'object' && element.constructor === Object;
    }

    const handleProducerClick = (producer) => {
        setClicked(false);
        setSearch(true);
        setArtistID('');
        setCollaborators([]);
        setSearchError(false);
        setScraperError(false);
        setArtistID(producer._id.toString());
        setMenuOpen(false)
        setLoading(true);
        setClicked(true);
        checkScraperStatus(producer._id.toString());
        checkArtistData(producer._id.toString());
        console.log(producer)
        console.log(`Producer ${producer.name} clicked!`);
    };

    const openInstagramProfile = (username) => {
        const url = `https://www.instagram.com/${username}`;
        window.open(url, '_blank', 'noopener noreferrer');
    };

    const checkArtistData = (artist) => {
        fetch(`https://fastapi-production-3513.up.railway.app/artist-data/${artistID}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                console.log(loading);
                if (!data.hasOwnProperty('message')) {
                    console.log(data['_id'])
                    console.log(parseInt(artistID))
                    if (data['_id'] === parseInt(artistID) && artistID !== '' && clicked === true) {
                        console.log('DATA')
                        setCollaborators(data['collaborators']);
                        setLoading(false);
                        setSearch(false);
                        console.log(loading);
                    }
                    else {
                        console.log('NOPE NOPE');
                    }
                } else {
                    if (data['message'] === 'Scraper had an error') {
                        console.log('SCRAPER ERROR')
                        setLoading(false);
                        setScraperError(true);
                    }
                }
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
                setScraperError(true);
            });
    }

    const checkScraperStatus = (artist) => {
        fetch('https://fastapi-production-3513.up.railway.app/get_active_scrapers')
            .then(response => response.json())
            .then(data => {
                console.log('SCRAPERS')
                //setActiveScrapers(data)
                console.log(artist)
                if (artistID !== '') {
                    console.log(data.find(x => x._id === parseInt(artist)))
                    if (data.find(x => x._id === parseInt(artist))) {
                        if (data.find(x => x._id === parseInt(artist)).status === 'error') {
                            setArtistID('');
                            setCollaborators([]);
                            setLoading(false);
                            console.log("ERROR")
                            setScraperError(true);
                        }
                    }
                }
            })
            .catch(error => {
                console.error(error)
            });
    }

    const openTwitterProfile = (username) => {
        const url = `https://www.twitter.com/${username}`;
        window.open(url, '_blank', 'noopener noreferrer');
    }

    const ProducerCard = ({ producer, onClick }) => {
        const statusColor = {
            complete: 'bg-green-500',
            error: 'bg-red-500',
            active: 'bg-slate-500',
        };

        return (
            <div onClick={onClick} className="bg-white shadow-md  hover:shadow-xl rounded-lg p-6 mx-4 my-4 w-64 artist-item">
                <div className="bg-white p-4">
                    <div className="text-lg font-semibold mb-1">{producer.name}</div>
                    <TimestampDisplay timestamp={producer.date} />
                </div>
                <div className="mt-4">
                    <button
                        className={`w-24 py-2 rounded-full text-white flex font-semibold items-center justify-center ${
                            statusColor[producer.status]
                        }`}
                    >
                        <span className="mr-2">{producer.status}</span>
                        {producer.status === 'active' && (
                            <div role="status" className="flex flex-row">
                                <svg aria-hidden="true"
                                     className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                     viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"/>
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        )}
                    </button>

                </div>
            </div>
        );
    };

    const istyle = {
        color: '#c13584',
    };

    const tstyle = {
        color: '#1da1f2',
    };

    useEffect(() => {
        const fetchData = async () => {
            if (searchTerm !== '') {
                //setActiveScrapers([])
                fetch(`https://fastapi-production-3513.up.railway.app/search/${searchTerm}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('SCR56');
                        console.log(data)
                        setActiveScrapers(data);
                        console.log(artistID);
                    })
                    .catch(error => console.error(error));
            } else {
                fetch('https://fastapi-production-3513.up.railway.app/get_active_scrapers')
                    .then(response => response.json())
                    .then(data => {
                        console.log('SCRAPERS');
                        setActiveScrapers(data);
                        console.log(artistID);
                    })
                    .catch(error => console.error(error));
            }
        };

        fetchData();
    }, [searchTerm]);


    useEffect(() => {
        const interval = setInterval(async () => {
            fetch('https://fastapi-production-3513.up.railway.app/get_active_scrapers')
                .then(response => response.json())
                .then(data => {
                    console.log('SCRAPERS')
                    //setActiveScrapers(data)
                    console.log(artistID)
                    if (artistID !== '') {
                        console.log(data.find(x => x._id === parseInt(artistID)))
                        if (data.find(x => x._id === parseInt(artistID))) {
                            if (data.find(x => x._id === parseInt(artistID)).status === 'error') {
                                setArtistID('');
                                setCollaborators([]);
                                setLoading(false);
                                console.log("ERROR")
                                setScraperError(true);
                            }
                        }
                    }
                })
                .catch(error => console.error(error));
        }
        , 3000);
        return () => clearInterval(interval);
    }, [artistID]);

    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('submitting');
        const response = await fetch(`https://fastapi-production-3513.up.railway.app/artists/${input}`)
            .then(response => response.json())
            .then(data => {
                if (isDictionary(data)) {
                    if (data['message'] === 'Artist not found') {
                        setSearchError(true)
                    }
                }
                else {
                    setClicked(true);
                    setLoading(true);
                    setArtistID(data)
                    console.log(data)
                }
            })
            .catch(error => {
                console.error(error)
                setScraperError(true);
            });
    };

    useEffect(() => {
        console.log("HIHUQEU")
        console.log(artistID)
        console.log(clicked)
        if (artistID !== '' && clicked === true) {
            const interval = setInterval(async () => {
                console.log('fetching')
                fetch(`https://fastapi-production-3513.up.railway.app/artist-data/${artistID}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        console.log(loading);
                        if (!data.hasOwnProperty('message')) {
                            console.log(data['_id'])
                            console.log(parseInt(artistID))
                            if (data['_id'] === parseInt(artistID) && artistID !== '' && clicked === true) {
                                console.log('DATA')
                                setCollaborators(data['collaborators']);
                                setLoading(false);
                                setSearch(false);
                                console.log(loading);
                            }
                            else {
                                console.log('NOPE NOPE');
                            }
                        } else {
                            if (data['message'] === 'Scraper had an error') {
                                console.log('SCRAPER ERROR')
                                setLoading(false);
                                setScraperError(true);
                            }
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        setLoading(false);
                        setScraperError(true);
                    });
            }, 10000);


            return () => clearInterval(interval);
        }
    }, [artistID, clicked]);

    function backToHome() {
        setSearch(true);
        setCollaborators([]);
        setClicked(false);
        setLoading(false);
        setArtistID('');
        setSearchError(false);
        setMenuOpen(false);
        setScraperError(false);
        setInput('');
    }

    const handleMouseEnter = (event) => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (!isMobile) {
            const element = event.target;
            const allElements = document.querySelectorAll('.producer-card');
            allElements.forEach((el) => {
                if (el !== element) {
                    el.classList.add('blur-and-darken');
                }
            });
        }
    };

    const handleMouseLeave = (event) => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (!isMobile) {
            const element = event.target;
            const allElements = document.querySelectorAll('.producer-card');
            allElements.forEach((el) => {
                if (el !== element) {
                    el.classList.remove('blur-and-darken');
                }
            });
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">

            <header className="py-6 px-8 bg-white shadow-md sticky z-50 top-0">
                <div className="flex justify-between items-center z-50 sticky top-0">
                    <h1 onClick={backToHome} className="text-xl font-bold text-gray-900">beatscout</h1>
                    <button onClick={toggleMenu} className="p-2 bg-gray-200 rounded-md text-gray-900 hover:bg-gray-300 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1H3V4zm3 4a1 1 0 0 1-1-1V5h10v2a1 1 0 0 1-1 1H6zm-3 5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1H3v-1zm3 4a1 1 0 0 1-1-1v-2h10v2a1 1 0 0 1-1 1H6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {menuOpen && (
                        <div className="fixed top-0 right-0 h-screen w-72 z-50 bg-white shadow-lg">
                            <div className="flex items-center justify-between bg-gray-900 py-5 px-7 rounded-t-lg">
                                <h2 className="text-lg font-semibold text-white">Your Scraped Artists</h2>
                                <button onClick={toggleMenu} className="text-white focus:outline-none">
                                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M6.7 7.7a1 1 0 0 0 0 1.4L11.3 12l-4.6 4.6a1 1 0 0 0 1.4 1.4l4.6-4.6 4.6 4.6a1 1 0 0 0 1.4-1.4L14.7 12l4.6-4.6a1 1 0 1 0-1.4-1.4L13.3 10l-4.6-4.6a1 1 0 0 0-1.4 0z"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="py-5 px-6 overflow-y-auto h-full">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search artists"
                                        className="w-full h-12 px-4 py-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button className="absolute right-0 top-0 mt-4 mr-4">
                                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                  d="M14.308 13.41l5.547 5.546a1 1 0 1 1-1.415 1.415l-5.546-5.547a8 8 0 1 1 1.414-1.414zM9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"
                                                  clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-8 space-y-4">
                                    {active_scrapers.map((scr) => (
                                        <ProducerCard onClick={() => handleProducerClick(scr)} key={scr.id} producer={scr} />
                                    ))}
                                </div>
                            </div>
                        </div>

                                )}
                </div>
            </header>
            {loading ? (
                <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                    <div className="w-24 h-24 rounded-full border-4 border-t-blue-500 animate-spin mb-4"></div>
                    <h1 className="text-gray-800 font-bold text-2xl mb-2">Loading</h1>
                    <p ref={statusRef} className="text-gray-600 font-bold"></p>
                </div>
            ) : (
                <div className="">
                    {searchError && (
                        <div role="alert">
                            <div className="bg-red-500 text-white text-center font-bold rounded-t px-4 py-2">
                                Error
                            </div>
                            <div className="border border-t-0 border-red-400 text-center rounded-b bg-red-100 px-4 py-3 text-red-700">
                                <p>Artist not found. Sorry about that :(</p>
                            </div>
                        </div>
                    )}
                    {scraperError && (
                        <div className="flex items-center justify-center min-h-screen">
                            <div role="alert" className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="bg-red-500 text-white font-bold text-center rounded-t-lg px-4 py-2">
                                    Error
                                </div>
                                <div
                                    className="border border-t-0 border-red-400 rounded-b-lg bg-red-100 px-4 py-3 text-red-700">
                                    <p className="text-center">
                                        The scraper encountered an error while searching for this artist. Please try
                                        again later.
                                    </p>
                                </div>
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


                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid"
                            columnClassName="my-masonry-grid_column"
                        >
                            {collaborators.map((result, index) => (
                                <div onMouseEnter={handleMouseEnter}
                                     onMouseLeave={handleMouseLeave} className="bg-white rounded-lg shadow-md overflow-hidden mx-4 my-2 md:mx-2 md:my-4 transform transition-all duration-300 hover:scale-102 hover:shadow-lg producer-card">
                                    <div className="relative">
                                        <img className="w-full h-64 object-cover" src={result.info.image}
                                             alt="{{ producer.name }}" />
                                        <div
                                            className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black to-transparent">
                                            <h2 className="text-white font-bold text-xl mb-2">{result.name}</h2>
                                            <div className="flex flex-wrap gap-4">
                                                {result.info.instagram !== null && (
                                                <button onClick={() => openInstagramProfile(result.info.instagram)}>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-7 w-7"
                                                        fill="currentColor"
                                                        style={istyle}
                                                        viewBox="0 0 24 24">
                                                        <path
                                                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                                    </svg>
                                                </button>
                                                )}
                                                {result.info.twitter !== null && (
                                                <button onClick={() => openTwitterProfile(result.info.twitter)}>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-7 w-7"
                                                        fill="currentColor"
                                                        style={tstyle}
                                                        viewBox="0 0 24 24">
                                                        <path
                                                            d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                                    </svg>
                                                </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                    <div className="px-6 py-4">
                                        <p className="text-gray-400 text-base mb-4 gap-2">{result.info.description}</p>
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
                                    </div>
                                </div>
                            ))}
                        </Masonry>
                        )}
                </div>
            )}
        </div>


    );

}

export default App;
