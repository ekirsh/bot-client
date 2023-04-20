import { useState, useEffect } from 'react';
import axios from 'axios'
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyA_ntYHKD1b9baYNCc1-I8CSsrZFwOlaOQ",
    authDomain: "music-genius-383921.firebaseapp.com",
    projectId: "music-genius-383921",
    storageBucket: "music-genius-383921.appspot.com",
    messagingSenderId: "449319247500",
    appId: "1:449319247500:web:687b1f309f4178c3c265a9",
    measurementId: "G-5WMKZNTGKH"
})

const db = firebase.firestore()
const artistRef = db.collection('artists');

function App() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [clicked, setClicked] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('submitting');
        setClicked(true);
        const response = await fetch(`/artists/${input}`)
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
        const data = await response.json();
        console.log(data);
    };

    useEffect(() => {
        if (clicked) {
            const collab = artistRef.doc(input).collection('collaborators');
            const unsubscribe = collab.onSnapshot((snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id
                }));
                setCollaborators(data);
            });

            return () => {
                unsubscribe();
            };
        }
    });


    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Genius Bot</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3 mb-6 md:mb-0">
                        <label htmlFor="artistName" className="block text-gray-700 text-lg font-bold mb-2">
                            Artist Name
                        </label>
                        <input
                            type="text"
                            id="artistName"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            className="p-3 bg-white rounded shadow appearance-none border border-gray-400 focus:outline-none focus:shadow-outline w-full"
                            required
                        />
                    </div>
                    <div className="w-full flex justify-center">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Search'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {collaborators.map((result, index) => (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="relative pb-60 overflow-hidden">
                            <img className="absolute h-full w-full object-cover object-center rounded-t-lg"
                                 src={result.info.image} alt=""/>
                        </div>
                        <div className="p-6">
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">{result.name}</h3>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{result.info.description}</p>
                            <div className="flex justify-between items-center mb-6">
                                <a href="https://www.instagram.com/{result.info.instagram}"
                                   className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors duration-300">result.info.instagram</a>
                            </div>
                            <hr className="my-4 border-gray-200"></hr>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Top Songs</h4>
                            <ul className="text-gray-600 leading-5">
                                {result.songs.map((song) => (

                                    <li className="flex items-center py-1">
                                        <img className="w-6 h-6 object-cover object-center rounded-full mr-3"
                                             src={song.song_art} alt=""/>
                                        <span>{song.title}</span>
                                        <span>{song.primary_artist.name}</span>
                                    </li>

                                ))}
                            </ul>
                            <hr className="my-4 border-gray-200"></hr>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Top Collaborators</h4>
                            <ul className="text-gray-600 leading-5">
                                {result.collaborators.map((c) => (
                                    <li className="flex items-center py-1">
                                        <span>{c}</span>
                                    </li>

                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>


    );

}

export default App;
