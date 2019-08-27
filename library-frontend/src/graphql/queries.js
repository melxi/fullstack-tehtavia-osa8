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
query allBooks($genre: String) {
  allBooks(genre: $genre) {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`

const ALL_GENRES = gql`
{
  allBooks {
    genres
  }
}
`

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

export default {
  ALL_AUTHORS,
  ALL_BOOKS,
  ALL_GENRES,
  FAVORITE_GENRE,
  RECOMMENDED_BOOKS
}