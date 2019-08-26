import React, { useState, useEffect } from 'react'
import { gql } from 'apollo-boost'
import { useApolloClient } from '@apollo/react-hooks'

const FAVORITE_GENRE = gql`
{
  me {
    favoriteGenre
  }
}
`

const RECOMMENDED_BOOKS = gql`
query allBooks($genre: String) {
  allBooks(genre: $genre) {
    title
    author {
      name
    }
    published
    genres
  }
}
`

const Recommended = (props) => {
  const client = useApolloClient(FAVORITE_GENRE)
  const [recommended, setRecommended] = useState('')
  const [books, setBooks] = useState(null)

  useEffect(() => {
    const showRecommended = async () => {
      const { data } = await client.query({
        query: FAVORITE_GENRE
      })
      setRecommended(data.me.favoriteGenre)
      const books = await client.query({
        query: RECOMMENDED_BOOKS,
        variables: { genre: data.me.favoriteGenre }
      })
      setBooks(books.data.allBooks)
    }
    showRecommended()
  }, [])
  
  if (!props.show) {
    return null
  }

  if (!books) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <div>books in your favorite genre <strong>{recommended}</strong></div>
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
          {books.filter(book => book.genres.includes(recommended)).map(a =>
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