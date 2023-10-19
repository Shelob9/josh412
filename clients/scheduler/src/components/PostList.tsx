function List({ children }) {
    return (
      <div>
        <ul className="bg-white shadow overflow-hidden sm:rounded-md max-w-sm mx-auto mt-16">
          {children}
        </ul>
      </div>
    );
  }

  type ItemStatus = 'active' | 'error';
  function PostStatus({ status }: { status: ItemStatus }) {
    const color = 'error' === status ? 'red' : 'green';

    return (
      <p className="text-sm font-medium text-gray-500">
        Status: <span className={`text-${color}-600`}>{status}</span>
      </p>
    );
  }
  export type Post_Props = {
    title: string;
    text: string;
    status: ItemStatus;
    key: number;
  };
  function PostListItem({ title, text, status }: Post_Props) {
    return (
      <li className={`border-2 rounded-md mb-1`}>
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{text}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <PostStatus status={status} />
            <button className="font-medium text-indigo-600 hover:text-indigo-500">
              Edit
            </button>
            <button className="font-medium text-indigo-600 hover:text-indigo-500">
              View
            </button>
          </div>
        </div>
      </li>
    );
  }

  export default function PostList({ posts }: { posts: Post_Props[] }) {
    return (
      <>
        <List>
          {posts.map((post) => (
            <PostListItem key={post.key} {...post} />
          ))}
        </List>
      </>
    );
  }
