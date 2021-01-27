# obi-wan

## DataStore with Lambda

### Create GraphQL Schema
```graphql
type Comment {
	id: ID!
	postID: ID!
	content: String!
	_version: Int!
	_deleted: Boolean
	_lastChangedAt: AWSTimestamp!
	createdAt: AWSDateTime!
	updatedAt: AWSDateTime!
}

input CreateCommentInput {
	id: ID
	postID: ID!
	content: String!
	_version: Int
}

input CreatePostInput {
	id: ID
	title: String!
	_version: Int
}

input DeleteCommentInput {
	id: ID
	_version: Int
}

input DeletePostInput {
	id: ID
	_version: Int
}

type ModelCommentConnection {
	items: [Comment]
	nextToken: String
	startedAt: AWSTimestamp
}

type ModelPostConnection {
	items: [Post]
	nextToken: String
	startedAt: AWSTimestamp
}

type Mutation {
	createPost(input: CreatePostInput!): Post
	updatePost(input: UpdatePostInput!): Post
	deletePost(input: DeletePostInput!): Post
	createComment(input: CreateCommentInput!): Comment
	updateComment(input: UpdateCommentInput!): Comment
	deleteComment(input: DeleteCommentInput!): Comment
}

type Post {
	id: ID!
	title: String!
	comments(
		content: String,
		filter: String,
		sortDirection: String,
		limit: Int,
		nextToken: String
	): ModelCommentConnection
	_version: Int!
	_deleted: Boolean
	_lastChangedAt: AWSTimestamp!
	createdAt: AWSDateTime!
	updatedAt: AWSDateTime!
}

type Query {
	foo: String
	syncPosts(
		filter: String,
		limit: Int,
		nextToken: String,
		lastSync: AWSTimestamp
	): ModelPostConnection
	syncComments(
		filter: String,
		limit: Int,
		nextToken: String,
		lastSync: AWSTimestamp
	): ModelCommentConnection
}

type Subscription {
	onCreatePost: Post
		@aws_subscribe(mutations: ["createPost"])
	onUpdatePost: Post
		@aws_subscribe(mutations: ["updatePost"])
	onDeletePost: Post
		@aws_subscribe(mutations: ["deletePost"])
	onCreateComment: Comment
		@aws_subscribe(mutations: ["createComment"])
	onUpdateComment: Comment
		@aws_subscribe(mutations: ["updateComment"])
	onDeleteComment: Comment
		@aws_subscribe(mutations: ["deleteComment"])
}

input UpdateCommentInput {
	id: ID!
	postID: ID
	content: String
	_version: Int
}

input UpdatePostInput {
	id: ID!
	title: String
	_version: Int
}
```

#### Deploy with amplify-cli with `@function`

### Create Lambda
- See index.js
- In-memory store
- Query for Post, Comment
- Mutation for Post, Comment

### Create app

- `create-react-app`
- `amplify codegen models`
- `yarn add @aws-amplify/core @aws-amplify/datastore`