const express = require('express')
const expressGraphQL = require('express-graphql')
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql')
const { books, authors } = require('./data')

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'Author of a book.',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => books.filter((book) => book.authorId === author.id),
    },
  }),
})

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'A book written by an author.',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => authors.find((author) => author.id === book.authorId),
    },
  }),
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of authors.',
      resolve: () => authors,
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of books.',
      resolve: () => books,
    },
    book: {
      type: BookType,
      description: 'A single book.',
      resolve: (_parent, args) => books.find((book) => book.id === args.id),
      args: {
        id: {
          type: GraphQLInt,
        },
      },
    },
    author: {
      type: AuthorType,
      description: 'A single author.',
      resolve: (_parent, args) => authors.find((author) => author.id === args.id),
      args: {
        id: {
          type: GraphQLInt,
        },
      },
    },
  }),
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a book.',
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        authorId: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (_parent, args) => {
        const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
        books.push(book)
        return book
      },
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author.',
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_parent, args) => {
        const author = { id: authors.length + 1, name: args.name }
        authors.push(author)
        return author
      },
    },
  }),
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
})

const app = express()
app.use(
  '/graphql',
  expressGraphQL.graphqlHTTP({
    graphiql: true,
    schema,
  })
)

app.listen(5555, () => console.log('Server is running'))
