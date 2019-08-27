import React, { useState, useEffect } from 'react'
import { useQuery, useSubscription, useApolloClient } from '@apollo/react-hooks'
import queries from '../graphql/queries'
import subscriptions from '../graphql/subscriptions'

const Recommended = (props) => {
  const client = useApolloClient()
  const [recommended, setRecommended] = useState('')

  useEffect(() => {
    const showRecommended = async () => {
      const { data } = await client.query({
        query: queries.FAVORITE_GENRE
      })
      setRecommended(data.me.favoriteGenre)
    }
    showRecommended()
  }, [])

  const books = useQuery(queries.RECOMMENDED_BOOKS, {
    variables: { genre: recommended }
  })

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(book => book.title).includes(object.title)
    
    const dataInStore = client.readQuery({
      query: queries.RECOMMENDED_BOOKS, 
      variables: { genre: recommended }
    })
    
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      books.refetch()
    }
  }

  useSubscription(subscriptions.BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)
    }
  })
  
  
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
          {books.data.allBooks.filter(book => book.genres.includes(recommended)).map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={() => books.refetch()}>Refetch</button>
    </div>
  )
}

export default Recommended