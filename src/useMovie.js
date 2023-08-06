    import { useState, useEffect } from "react"

    export function useMovie (query, apikey){
        const [isLoading, setIsLoding] = useState(false)
        const [error, setError] = useState("")
        const [movies, setMovies] = useState([]);

        useEffect(() => {
            const controller = new AbortController()
            // Effect
            const fetchdata = async () => {
            try{
                setIsLoding(true)
                setError("")
        
                const res = await fetch(`http://www.omdbapi.com/?apikey=${apikey}&s=${query}`, {signal: controller.signal})
                
                const data = await res.json()
                if(!query) return
                // no results for search query
                if(data.Response === "False") throw new Error("No movies found")
        
                setMovies(data.Search)
            }
            catch(err){
                if(err.name !== 'AbortError'){
                console.error(err.message)
                setError(err.message)
                }
            }
            finally{
                setIsLoding(false)
            }
            }
            
            // handleclose(true)
            fetchdata()
        
            return () => {
            controller.abort()
            }
        }, [query, apikey])

        return {movies, isLoading, error}
    }