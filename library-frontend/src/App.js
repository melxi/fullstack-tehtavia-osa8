import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import LoginForm from './components/LoginForm';

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

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
    author {
      name
    }
    published
  }
}
`

const ADD_BOOK = gql`
mutation addBook($title: String!, $name: String!, $published: String!, $genres: [String!]!) {
  addBook(
    title: $title,
    name: $name,
    published: $published,
    genres: $genres
  ) {
    title
    author {
      name
    }
    published
    genres
  }
}
`

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: String!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    } 
  }
`

const App = () => {
  const client = useApolloClient()
  const [errorMessage, setErrorMessage] = useState('')

  const handleError = error => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 3000)
  }

  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const [login] = useMutation(LOGIN, {
    onError: handleError
  })
  const [addBook] = useMutation(ADD_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS}]
  })
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: handleError,
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_AUTHORS })
      dataInStore.allAuthors.push(response.data.editAuthor)
      store.writeQuery({
        query: ALL_AUTHORS,
        data: dataInStore
      })
    }
  })
  
  const logout = () => {
    setToken(null)
    setPage('authors')
    localStorage.clear()
    client.resetStore()
  }

  const errorNotification = () => errorMessage && 
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>
  
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token 
          ? <button onClick={logout}>logout</button>
          : <button onClick={() => setPage('login')}>login</button>
        }
      </div>
      {errorNotification()}
      <Authors editAuthor={editAuthor} result={authors} show={page === 'authors'} />

      <Books result={books} show={page === 'books'} />

      <NewBook addBook={addBook} show={page === 'add'} />

      <LoginForm login={login} setPage={setPage} setToken={token => setToken(token)} show={page === 'login'} />

    </div>
  )
}

export default App