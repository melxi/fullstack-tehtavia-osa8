const { ApolloServer, UserInputError, gql } = require('apollo-server')
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
    bookCount: async () => {
      const books = await Book.find({})
      return books.length
    },
    authorCount: async () => {
      const authors = await Author.find({})
      return authors.length
    },
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author')
      const byAuthor = book => book.author.name === args.author
      
      if (args.author && !args.genre) {
        return books.filter(byAuthor)
      } else if (!args.author && args.genre) {
        const books = await Book.find({ genres: { $in: [args.genre]}})        
        return books
      } else if (args.author && args.genre) {
        const books = await Book.find({ genres: { $in: [args.genre]}}).populate('author')
        return books.filter(byAuthor)
      } else {
        return books
      }
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      return authors
    }
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
          .catch(error => {
            throw new UserInputError(error.message, {
              invalidArgs: args
            })
          })
      }

      try {
        const book = await new Book ({...args, author: author._id })
        await book.save()
        return await Book.findById(book._id).populate('author')
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
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