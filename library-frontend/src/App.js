import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    born
    bookCount
  }
}
`

const ALL_BOOKS = gql`
{
  allBooks {
    title
    author
    published
  }
}
`

const App = () => {
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const [page, setPage] = useState('authors')
  
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors result={authors} show={page === 'authors'} />

      <Books result={books} show={page === 'books'} />

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App