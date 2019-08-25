import React from 'react'

const Recommended = (props) => {
  const recommended = props.recommended.data.me || ''
  const books = props.result.data.allBooks
  props.setGenre(recommended.favoriteGenre)
  
  if (!props.show) {
    return null
  }

  if (props.result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <div>books in your favorite genre <strong>{recommended.favoriteGenre}</strong></div>
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
    </div>
  )
}

export default Recommended