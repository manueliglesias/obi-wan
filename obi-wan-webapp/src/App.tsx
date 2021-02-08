import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { Amplify } from "@aws-amplify/core";
import { DataStore, OpType } from "@aws-amplify/datastore";
import { default as awsConfig } from "./aws-exports";

import { Post } from "./models";

Amplify.configure(awsConfig);

function App() {
  const [posts, setPosts] = useState([] as Post[]);

  useEffect(() => {
    const subscription = DataStore.observe(Post).subscribe(
      ({ element, opType }) => {
        setPosts((posts) => {
          const tmp = [...posts];

          switch (opType) {
            case OpType.INSERT: {
              tmp.push(element);
              break;
            }
            case OpType.UPDATE: {
              let index = tmp.findIndex((p) => p.id === element.id);

              if (index !== -1) {
                tmp.splice(index, 1, element);
              }
              break;
            }
            case OpType.DELETE: {
              let index = tmp.findIndex((p) => p.id === element.id);

              if (index !== -1) {
                tmp.splice(index, 1);
              }
              break;
            }
          }

          return tmp;
        });
      }
    );

    DataStore.query(Post).then((posts) => setPosts(() => posts));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function deletePost(post: Post) {
    if (window.confirm(`Do you want to delete the post with ID ${post.id}?`)) {
      await DataStore.delete(post);
    }
  }

  async function editPost(post: Post) {
    const newTitle = window.prompt("Update title", post.title);

    if (newTitle !== null) {
      await DataStore.save(
        Post.copyOf(post, (p) => {
          p.title = newTitle;
          return p;
        })
      );
    }
  }

  async function savePost(post: Post) {
    await DataStore.save(post);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <section className="App-body">
        <NewPost onSave={savePost} />
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Version</th>
              <th>Last Changed At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={7}>No posts</td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id}>
                  <td title={p.id}>{p.title}</td>
                  <td>{(p as any)._version}</td>
                  <td>{(p as any)._lastChangedAt}</td>
                  <td>
                    <button onClick={() => editPost(p)}>EDIT</button>
                    <button onClick={() => deletePost(p)}>DELETE</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function NewPost({ onSave }: { onSave: (post: Post) => void }) {
  const [title, setTile] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSave(new Post({ title }));

    setTile("");
  }

  return (
    <form onSubmit={onSubmit}>
      <fieldset>
        <legend>New Post</legend>
        <label htmlFor="title">
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTile(e.target.value)}
          />
        </label>
        <input type="submit" value="Save" disabled={!title} />
      </fieldset>
    </form>
  );
}

export default App;
