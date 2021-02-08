//@ts-check
const AWS = require('aws-sdk');

const { util: { uuid: { v4: uuid } } } = AWS;

const posts = [
    { id: uuid(), title: "First post", _version: 1, _lastChangedAt: 1611776141395, _deleted: null },
    { id: uuid(), title: "Second post", _version: 2, _lastChangedAt: 1611776141396, _deleted: null },
    { id: uuid(), title: "Third post", _version: 1, _lastChangedAt: 1611776141397, _deleted: null },
    { id: uuid(), title: "Fourth post", _version: 3, _lastChangedAt: 1611776141398, _deleted: null },
    { id: uuid(), title: "Fifth post", _version: 1, _lastChangedAt: 1611776141399, _deleted: null },
];

const comments = [
    { id: uuid(), postID: posts[2].id, content: "Some content", _version: 1, _lastChangedAt: 1611776141397, _deleted: null },
    { id: uuid(), postID: posts[2].id, content: "Some content", _version: 1, _lastChangedAt: 1611776141398, _deleted: null },
    { id: uuid(), postID: posts[3].id, content: "Some content", _version: 1, _lastChangedAt: 1611776141399, _deleted: null },
];

const operations = {
    syncPosts,
    syncComments,
    // foo: () => "Bla",
    createPost,
    updatePost,
    deletePost,
    createComment,
    updateComment,
    deleteComment,
}

exports.handler = async (event, context) => {
    console.log("Received event {}", JSON.stringify(event, null, 2));

    const { field: operation, arguments } = event;

    console.log("Got an Invoke Request.", operation);

    if (operation in operations) {
        return operations[operation].apply(undefined, [arguments]);
    }
};

function syncPosts(args) {
    return _query(posts, args)
}

function syncComments(args) {
    return _query(comments, args)
}

function createPost(args) {
    return _create(posts, args);
}

function updatePost(args) {
    return _update(posts, args);
}

function deletePost(args) {
    return _delete(posts, args);
}

function createComment(args) {
    return _create(comments, args);
}

function updateComment(args) {
    console.log(args);
}

function deleteComment(args) {
    console.log(args);
}

function _query(records = [], { limit, lastSync } = { limit: 0, lastSync: undefined }) {
    const items = records
        .filter(({ _deleted, _lastChangedAt }) => {
            let include = true;

            include = include && !_deleted;

            include = include && (!lastSync || _lastChangedAt >= lastSync);

            return include;
        })
        .slice(0, limit);

    const startedAt = Date.now();
    const nextToken = null;

    return { items, startedAt, nextToken };
}

function _create(records = [], { input: { id = uuid(), ...input } }) {
    const item = {
        ...input,
        id,
        _version: 1,
        _lastChangedAt: Date.now(),
        _deleted: null,
    };

    records.push(item);

    return item;
}

function _update(records = [], { input }) {
    const { id, _version = 0, ...rest } = input;

    const item = records.find(p => p.id === id);

    if (item) {
        if (_version < item._version) {
            return {
                data: item,
                errorMessage: 'Conflict',
                errorType: 'ConflictUnhandled',
            };
        }

        Object.assign(item, rest);
        item._version++;
        item._lastChangedAt = Date.now();
    }

    return {
        data: item,
    };
}

function _delete(records = [], { input }) {
    const { id, _version = 0 } = input;

    const item = records.find(p => p.id === id);

    if (item) {
        if (_version < item._version) {
            return {
                data: item,
                errorMessage: 'Conflict',
                errorType: 'ConflictUnhandled',
            };
        }

        item._deleted = true;
        item._version++;
        item._lastChangedAt = Date.now();
    }

    return {
        data: item
    };
}