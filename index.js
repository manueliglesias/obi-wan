//@ts-check
const posts = [
    { id: "1", title: "First book", _version: 1, _lastChangedAt: 1611776141395, _deleted: null },
    { id: "2", title: "Second book", _version: 2, _lastChangedAt: 1611776141396, _deleted: null },
    { id: "3", title: "Third book", _version: 1, _lastChangedAt: 1611776141397, _deleted: null },
    { id: "4", title: "Fourth book", _version: 3, _lastChangedAt: 1611776141398, _deleted: null },
    { id: "5", title: "Fifth book", _version: 1, _lastChangedAt: 1611776141399, _deleted: null },
];

const comments = [
    { id: "1", postID: "3", content: "Some content", _version: 1, _lastChangedAt: 1611776141397, _deleted: null },
    { id: "2", postID: "3", content: "Some content", _version: 1, _lastChangedAt: 1611776141398, _deleted: null },
    { id: "3", postID: "4", content: "Some content", _version: 1, _lastChangedAt: 1611776141399, _deleted: null },
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

function _query(records = [], { limit, lastSync } = { limit: 0, lastSync: undefined}) {
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

function _create(records = [], { input }) {
    const id = `${records.length + 1}`;

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
        if (item._version >= _version) {
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
        data: item
    };
}

function _delete(records = [], { input }) {
    const { id, _version = 0 } = input;

    const item = records.find(p => p.id === id);

    if (item) {
        if (item._version >= _version) {
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