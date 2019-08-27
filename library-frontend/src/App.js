import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/react-hooks'
import queries from './graphql/queries'
import mutations from './graphql/mutations'
import subscriptions from './graphql/subscriptions'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'

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
  const [genre, setGenre] = useState(null)
  
  const authors = useQuery(queries.ALL_AUTHORS)
  const books = useQuery(queries.ALL_BOOKS, {
    variables: { genre }
  })
  const genres = useQuery(queries.ALL_GENRES)
  const [login] = useMutation(mutations.LOGIN, {
    onError: handleError
  })

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(book => book.title).includes(object.title)
    
    const dataInStore = client.readQuery({
      query: queries.ALL_BOOKS, 
      variables: { genre }
    })
    
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      dataInStore.allBooks.push(addedBook)
      client.writeQuery({
        query: queries.ALL_BOOKS,
        data: dataInStore
      })
    }
  }

  useSubscription(subscriptions.BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`${addedBook.title} added`)
      updateCacheWith(addedBook)
    }
  })

  const [addBook] = useMutation(mutations.ADD_BOOK, {
    onError: handleError,
    refetchQueries: [
      { query: queries.ALL_AUTHORS },
      { query: queries.ALL_BOOKS, variables: { genre } },
      { query: queries.ALL_GENRES }
    ],
    update: (store, response) => { 
      updateCacheWith(response.data.addBook)
    }
  })
  const [editAuthor] = useMutation(mutations.EDIT_AUTHOR, {
    onError: handleError,
    refetchQueries: [{ query: queries.ALL_AUTHORS }]
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
  
  useEffect(() => {
    setToken(window.localStorage.getItem('libraryUserLogin'))
  }, [])

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && <button onClick={() => setPage('recommended')}>recommended</button>}
        {token 
          ? <button onClick={logout}>logout</button>
          : <button onClick={() => setPage('login')}>login</button>
        }
      </div>
      {errorNotification()}
      <Authors editAuthor={editAuthor} result={authors} show={page === 'authors'} />

      <Books result={books} genres={genres} show={page === 'books'} setGenre={genre => setGenre(genre)}/>

      <NewBook addBook={addBook} show={page === 'add'} />

      <Recommended show={page === 'recommended'}/>

      <LoginForm login={login} setPage={setPage} setToken={token => setToken(token)} show={page === 'login'} />

    </div>
  )
}

export default App