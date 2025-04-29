import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [error, setError] = useState(null);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
        const data = await res.json();

        const promises = data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return res.json();
        });

        const results = await Promise.all(promises);

        const allTypes = new Set();
        results.forEach(poke => {
          poke.types.forEach(t => allTypes.add(t.type.name));
        });

        setTypes(['All', ...Array.from(allTypes)]);
        setPokemonList(results);
        setFilteredList(results);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch Pokémon');
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  useEffect(() => {
    let filtered = pokemonList.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (typeFilter !== 'All') {
      filtered = filtered.filter(pokemon =>
        pokemon.types.some(t => t.type.name === typeFilter)
      );
    }

    setFilteredList(filtered);
  }, [searchTerm, typeFilter, pokemonList]);

  return (
    <div className="container">
      <h1>Pokémon Explorer</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {types.map(type => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading Pokémon...</p>}
      {error && <p>{error}</p>}
      {!loading && filteredList.length === 0 && <p>No Pokémon found.</p>}

      <div className="card-grid">
        {filteredList.map(pokemon => (
          <div key={pokemon.id} className="card">
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <h3>{pokemon.name}</h3>
            <p>ID: {pokemon.id}</p>
            <p>Type: {pokemon.types.map(t => t.type.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;



