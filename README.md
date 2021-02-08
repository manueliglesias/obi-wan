# obi-wan

## DataStore with Lambda

### Create GraphQL Schema
```graphql
type Comment {
	id: ID!
	postID: ID!
	post: Post
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

enum ModelAttributeTypes {
	binary
	binarySet
	bool
	list
	map
	number
	numberSet
	string
	stringSet
	_null
}

input ModelCommentConditionInput {
	postID: ModelIDInput
	content: ModelStringInput
	and: [ModelCommentConditionInput]
	or: [ModelCommentConditionInput]
	not: ModelCommentConditionInput
}

type ModelCommentConnection {
	items: [Comment]
	nextToken: String
	startedAt: AWSTimestamp
}

input ModelCommentFilterInput {
	filter: String
}

input ModelIDInput {
	ne: ID
	eq: ID
	le: ID
	lt: ID
	ge: ID
	gt: ID
	contains: ID
	notContains: ID
	between: [ID]
	beginsWith: ID
	attributeExists: Boolean
	attributeType: ModelAttributeTypes
	size: ModelSizeInput
}

input ModelPostConditionInput {
	title: ModelStringInput
	blogID: ModelIDInput
	and: [ModelPostConditionInput]
	or: [ModelPostConditionInput]
	not: ModelPostConditionInput
}

type ModelPostConnection {
	items: [Post]
	nextToken: String
	startedAt: AWSTimestamp
}

input ModelPostFilterInput {
	filter: String
}

input ModelSizeInput {
	ne: Int
	eq: Int
	le: Int
	lt: Int
	ge: Int
	gt: Int
	between: [Int]
}

input ModelStringInput {
	ne: String
	eq: String
	le: String
	lt: String
	ge: String
	gt: String
	contains: String
	notContains: String
	between: [String]
	beginsWith: String
	attributeExists: Boolean
	attributeType: ModelAttributeTypes
	size: ModelSizeInput
}

type Mutation {
	createPost(input: CreatePostInput!, condition: ModelPostConditionInput): Post
	updatePost(input: UpdatePostInput!, condition: ModelPostConditionInput): Post
	deletePost(input: DeletePostInput!, condition: ModelPostConditionInput): Post
	createComment(input: CreateCommentInput!, condition: ModelCommentConditionInput): Comment
	updateComment(input: UpdateCommentInput!, condition: ModelCommentConditionInput): Comment
	deleteComment(input: DeleteCommentInput!, condition: ModelCommentConditionInput): Comment
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
		filter: ModelPostFilterInput,
		limit: Int,
		nextToken: String,
		lastSync: AWSTimestamp
	): ModelPostConnection
	syncComments(
		filter: ModelCommentFilterInput,
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

### Resolvers for mutations

#### Request
```
#**
    The value of 'payload' after the template has been evaluated
    will be passed as the event to AWS Lambda.
*#
{
    "version" : "2017-02-28",
    "operation": "Invoke",
    "payload": {
        "field": "$context.info.fieldName",
        "arguments":  $utils.toJson($context.arguments)
    }
}
```

#### Response
```
#if($context.result && $context.result.errorMessage )
    $utils.error($context.result.errorMessage, $context.result.errorType, $context.result.data)
#else
    $utils.toJson($context.result.data)
#end
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