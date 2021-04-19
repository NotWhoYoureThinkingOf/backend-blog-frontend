import styles from "../styles/Home.module.css";
import Head from "next/head";
import axios from "../../axios";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import { Close } from "@material-ui/icons";

export default function Home({ posts }) {
  const [allPosts, setAllPosts] = useState([]);
  const [postToDelete, setPostToDelete] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lastPulled, setLastPulled] = useState({});

  // console.log("posts", posts);

  useEffect(() => {
    setAllPosts(posts);
  }, []);

  useEffect(() => {
    const pusher = new Pusher("a9b4e56c9cce7312822d", {
      cluster: "us2",
    });

    const channel = pusher.subscribe("posts");
    channel.bind("inserted", (data) => {
      console.log("pusher data", data);
      setAllPosts([data, ...allPosts]);
    });

    const deleteChannel = pusher.subscribe("posts");
    deleteChannel.bind("deleted", (data) => {
      console.log("deleted data", data);
      const newAllPosts = allPosts.filter(
        (post) => post?.id || post?._id !== data
      );
      console.log("newAllPosts", newAllPosts);
      setAllPosts([...newAllPosts]);
    });

    // setAllPosts([lastPulled, ...allPosts]);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [allPosts]);

  console.log("allPosts", allPosts);
  // console.log("postToDelete", postToDelete);

  const submitPost = (e) => {
    e.preventDefault();
    console.log("submit button");

    axios.post("/", {
      title: title,
      description: content,
    });
  };

  const checkDeletePost = (post) => {
    // e.preventDefault();
    setPostToDelete(post._id ? post._id : post.id);
    console.log("x pressed here's the post id ---->", postToDelete);
  };

  const deletePost = () => {
    console.log("yaasss button", postToDelete);
    axios.delete(`/${postToDelete}`);
  };

  return (
    <div className={styles.home}>
      <Head>
        <title>Backend Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className={styles.homeTitle}>Backend Blog</h1>

      <div className={styles.addPost}>
        <h2>Add a post here!</h2>
        <form>
          <div className={styles.addTitle}>
            <label>Title</label>
            <input
              type="text"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </div>
          <div className={styles.addDescription}>
            <label>Content</label>
            <textarea
              onChange={(e) => setContent(e.target.value)}
              value={content}
              cols="30"
              rows="10"
            ></textarea>
          </div>
          <button className={styles.submitButton} onClick={submitPost}>
            Submit
          </button>
        </form>
      </div>

      <div className={styles.posts}>
        <h2 className={styles.postsTitle}>Posts</h2>
        {allPosts.map((post) => (
          <div
            className={styles.post}
            id={post._id ? post._id : post.id}
            key={post._id ? post._id : post.id}
            onClick={() => setPostToDelete(post._id ? post._id : post.id)}
          >
            <div
              className={styles.delete}
              onClick={(post) => checkDeletePost(post)}
            >
              <Close />
            </div>
            <p>{post?.title}</p>
            <p>{post?.description}</p>
            <div className={styles.deleteWarning}>
              <h4>Are you sure you want to delete this post?</h4>
              <div className={styles.deleteButtons}>
                <p className={styles.deleteYes} onClick={deletePost}>
                  Yes
                </p>
                <p
                  className={styles.deleteNo}
                  onClick={() => console.log("do not delete")}
                >
                  No
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  const postsResponse = await fetch("http://localhost:3001/posts");

  const posts = await postsResponse.json();

  return {
    props: {
      posts: posts,
    },
  };
};
