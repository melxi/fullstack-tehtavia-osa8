const { ApolloServer, AuthenticationError, UserInputError, PubSub, gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const pubsub = new PubSub()
const User = require('./models/user')
const Book = require('./models/book')
const Author = require('./models/author')
const config = require('./utils/config')

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true})
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  type Mutation {
    addBook(
      title: String!
      name: String!
      born: Int
      published: String!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: String!
    ) : Author
    createUser(
      username: String!
      favoriteGenre: String!
    ) : User
    login(
      username: String!
      password: String!
    ) : Token
  }
  type Subscription {
    bookAdded: Book!
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
    },
    me: async (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: (root) => root.books.length
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
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser
      
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

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
        author.books = author.books.concat(book._id)
        author.save()
        pubsub.publish('BOOK ADDED', { bookAdded: book })
        return await Book.findById(book._id).populate('author')
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
    },
    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }
      
      if (!author) {
        throw new UserInputError('Author not found', {
          invalidArgs: args.name,
        })
      }

      const updatedAuthor = { ...args, born: args.setBornTo}
      return await Author.findByIdAndUpdate(author._id, updatedAuthor, { new: true })
    },
    createUser: async (root, args) => {
      const user = new User({username: args.username, favoriteGenre: args.favoriteGenre})

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, config.SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK ADDED'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), config.SECRET
      )

      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})