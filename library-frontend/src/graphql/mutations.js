import { gql } from 'apollo-boost'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author {
      name
    }
    published
    genres
  }
`

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
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
    ...BookDetails
  }
}
${BOOK_DETAILS}
`

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: String!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
      bookCount
    } 
  }
`

export default {
  LOGIN,
  ADD_BOOK,
  EDIT_AUTHOR
}