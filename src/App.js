import { useEffect, useState } from "react";
import StarRating from './star'
import { useRef } from "react";
import { useMovie } from "./useMovie";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const apikey =  "5ca6e75b"

export default function App() {
  
  const [watched, setWatched] = useState(function (){
    const list = JSON.parse(localStorage.getItem("favorites"))
    return list ? list : []
  });
  const [selected, setSelected] = useState(null)
  
  const [query, setQuery] = useState("inception");
  
  function handleselect (id){
    setSelected(selected => selected === id ? null : id)
  }
  function handleclose (){
    setSelected(null)
  }
  function handlebookmark (bookmarked){
    setWatched(watched => [...watched, bookmarked])
  }
  function handleDelete (id){
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }

  const {movies, isLoading, error} = useMovie(query, apikey)

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(watched))
  }, [watched])

  return (
    <>
      {/* Component composition*/}
      <NavBar movies = {movies}> <Search query = {query} setQuery={setQuery} /> </NavBar>
      <Main>
        <List>  
        {isLoading && <Loader />}
        {error && <Error message = {error}/>}
        {!isLoading && !error && <Movie movies={movies} onSelect = {handleselect}/>}
        </List>
        <List> 
            {selected ? <MovieDetails selected = {selected} onClose = {handleclose} watched = {watched} onBookmark = {handlebookmark}/> :
            <>
            <MovieSummary watched = {watched}/>
            <ul className="list">
            {watched.map((movie) => (
              <MoviesWatched movie = {movie} key={movie.imdbID} onDelete = {handleDelete}/>
            ))}
            </ul>
            </>
            }
        </List>
      </Main>
      
    </>
  );
}
function Loader (){
  return <div className="loading">
        <span className="spinner"></span>
    </div>
}
function Error ({message}){
  return <p className="error"> 
  <span>⛔</span>{message}</p>
}
function NavBar ({movies, children}){
    return <nav className="nav-bar">
    <div className="logo">
      <span role="img">🍿</span>
      <h1>TerasMovies </h1>
    </div>
    {children}
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  </nav>
}
function Search ({query, setQuery}){
  const inputEl = useRef(null)
  // A Ref will be persisted after the component re-renders.

  // normal variable = never persist and doesn't re-render component
  // state - persist data and re-render component
  // refs - persist data and doesn't re-render component
  useEffect(() => {
    const callback = (e) => {
      // Guard clause
      if(document.activeElement === inputEl.current) return
      if(e.code === "Enter"){
        inputEl.current.focus()
        setQuery("")
      }  
    }
    document.addEventListener("keydown", callback)
    return () => {
      document.removeEventListener("keydown", callback)
    }
  }, [setQuery])

    return  <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    ref={inputEl}
  />
}
function Main ({children}){
  return <main className="main">
  {children}
</main>
}
function List ({children}){
  const [isOpen1, setIsOpen1] = useState(true);
  return <div className="box">
  <Button  isOpen={isOpen1} setIsOpen={setIsOpen1}/>
  {isOpen1 && children}
</div>
}
function MovieDetails ({selected, onClose, watched, onBookmark}){
  const [display, setDisplay] = useState({})
  const [load, setLoad] = useState(false)
  const test = [...watched]
  const ids = test.map(mv => mv.imdbID)
  const {
    Title: title, 
    Poster: poster, 
    Released: released, 
    Runtime: runtime, 
    Genre: genre,
    Year: year,
    Plot: plot,
    Actors: actors,
    Director: director,
    imdbRating

  } = display
  function handler (){
    onBookmark({title, poster, year, imdbRating: +imdbRating, imdbID: selected, runtime: runtime.split(' ')[0]})
    onClose(true)
  }
  useEffect(() => {
    const callback =  function(e){
      if(e.code === "Escape") onClose(true)
    }
    document.addEventListener("keydown", callback)
    return () => {
      document.removeEventListener("keydown", callback)
    }
  }, [onClose])
  useEffect(() => {
    const moviedata = async () => {
        setLoad(true)
        const res = await fetch(`http://www.omdbapi.com/?apikey=${apikey}&i=${selected}`)

        const data = await res.json()
        if(data.Response === "False") throw new Error('No details found for this movie')
        setLoad(false)
        setDisplay(data) 
    }
    
    moviedata()

  }, [selected])

  useEffect(() => {
    if(!title) return 
    document.title = title
    // cleanup function
    return function (){
      document.title = "TerasMovies"
    }
  }, [title])

  return <div className="details"> 
    {load ? <Loader/> : <>
    <header>
      <button className="btn btn-back" onClick={onClose}> &larr; </button>
      <img src={poster} alt= {`poster of ${title}`} />
      <div className="details-overview">
        <h2> {title}</h2>
        <p>{released} &bull; {runtime}</p>
        <p>{genre}</p>
        <p>
          <span>⭐️</span>
        {imdbRating} &nbsp; Imdb rating
        </p>
      </div>
    </header>
    <section>
      {ids.includes(selected) ? <h1 style={{marginBottom: "2rem"}}> Already on your List </h1> : <div className="rating">
          <StarRating maxLength={10} size= {24} color="#FFD700" full = {Math.round(imdbRating)} key={ Date.now()}/>
          <button className="btn-add" onClick={handler}> + Add to list </button>
      </div>}
      <p>
        <em> {plot} </em>
      </p>
      <p>
        <strong> Starring : </strong> &nbsp; {actors}
      </p>
      <p>
        <strong> Directed By : </strong> &nbsp; {director}
      </p>
    </section>
    </>
}
    </div>
}
function MoviesWatched ({movie, onDelete}){
  return <li>
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.title}</h3>
    <div>
      <p>
        <span>⭐️</span>
        <span>{movie.imdbRating}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{movie.runtime} min</span>
      </p>
      <p> 
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID) }> X </button>
      </p>
    </div>
</li>
}
function MovieSummary ({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return <div className="summary">
    <h2 style={{marginBottom: "3rem"}}>Your favorite Movies</h2>
    <div>
      <p>
        <span>#️⃣</span>
        <span>{watched.length} movies</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{avgImdbRating.toFixed(2)}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{avgRuntime.toFixed(2)} min</span>
      </p>
    </div>
</div>

}
function Button ({isOpen, setIsOpen}){
  return  <button
  className="btn-toggle"
  onClick={() => setIsOpen((open) => !open)}
>
  {isOpen ? "–" : "+"}
</button>
}
function Movie ({movies, onSelect}){
    return <ul className="list list-movies ">
    { movies.map(movie => <li key={movie.imdbID} onClick={() => onSelect(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
    </li> )
    }
  </ul>
}
