import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from 'apollo-boost'
import App from './App'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('libraryUserLogin')
  
  operation.setContext({
    headers: {
      authorization: token ? `bearer ${token}` : null
    }
  })
  
  return forward(operation)
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

ReactDOM.render(<ApolloProvider client={client}><App /></ApolloProvider>, document.getElementById('root'))