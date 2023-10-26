import { PencilSquareIcon } from "@heroicons/react/20/solid";
import { Account } from "./Compose";

function List({ children }:{
    children: React.ReactNode;
}) {
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

  export function AccountTop({ account }: { account: Account }) {
    return (
      <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-full"
                  src={account.accountAvatarUrl}
                  alt=""
                />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {account.accountName}
                </h3>
                <p className="text-sm text-gray-500">
                  <a href="#">
                    {account.accountHandle}

                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 mt-4 flex flex-shrink-0">
            <button
              type="button"
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <PencilSquareIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              <span>Edit</span>
            </button>

          </div>
        </div>
      </div>
    )
  }

  export default function PostList({ posts,account }: {
    posts: Post_Props[];
    account: Account;
  }) {
    return (
      <>
        <List>
        <AccountTop account={account} />
          {posts.map((post) => (
            <PostListItem {...post} />
          ))}
        </List>
      </>
    );
  }
