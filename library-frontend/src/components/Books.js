import React from 'react'

const Books = (props) => {
  const books = props.result.data.allBooks || []
  const genres = props.genres.data.allBooks || []
  
  const showGenres = () => {
    const allGenres = genres.map(book => book.genres).reduce((acc, cur) => acc.concat(cur), [])
    return allGenres.filter((genre, index) => allGenres.indexOf(genre) === index)
  }
  
  if (!props.show) {
    return null
  }

  if (props.result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>
      <div>in genre 
        <strong> {props.result.variables.genre ? props.result.variables.genre : 'all genres'}</strong>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {showGenres()
        .map(genre => 
        <button key={genre} onClick={({ target }) => props.setGenre(target.textContent)}>
          {genre}
        </button>)
      }
      <button onClick={({ target }) => props.setGenre(null)}>all genres</button>
    </div>
  )
}

export default Books