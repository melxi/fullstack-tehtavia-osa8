const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const config = require('./utils/config')

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true})
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String
    born: Int
  }
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    _id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
  type Mutation {
    addBook(
      title: String!
      name: String!
      born: Int
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: String!
    ) : Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      return Book.find({})
      const byAuthor = book => book.author === args.author
      const byGenre = book => {
        for (let i = 0; i <= book.genres.length; i++) {
          if (book.genres[i] === args.genre) {
            return book
          }
        }
      }
      
      if (args.author && !args.genre) {
        return books.filter(byAuthor)
      } else if (!args.author && args.genre) {
        return books.filter(byGenre)
      } else if (args.author && args.genre) {
        return books.filter(byAuthor).filter(byGenre)
      } else {
        return books
      }
    },
    allAuthors: () => Author.find({})
  },
  Book: {
    author: async (root) => {
      const author = await Author.findById(root.author)      
      return {
        name: author.name,
        born: author.born
      }
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.name })

      if (!author) {
        author = await new Author({ name: args.name, born: args.born })
        await author.save()
      }

      const book = await new Book ({...args, author: author._id })
      await book.save()
      return await Book.findById(book._id).populate('author')
    },
    editAuthor: (root, args) => {
      const author = authors.find(author => author.name === args.name)

      if (!author) {
        return null
      }

      const updatedAuthor = { ...args, born: args.setBornTo}
      authors = authors.map(author => author.name === args.name ? updatedAuthor : author)
      return updatedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})