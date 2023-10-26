import { useEffect } from 'react';
import Composer, { Account, SupportedNetwork } from "./components/Compose";
import Grid from "./components/Grid";
import Header from "./components/Header";
import PostList, { Post_Props } from "./components/PostList";
//Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eleifend consectetur massa at tempus. Suspendisse ut odio vitae ipsum blandit vulputate ac eget justo. Nunc pulvinar erat quis risus accumsan volutpat. Proin placerat leo sit amet ex ornare bibendum. Duis varius viverra risus ac dictum. Mauris feugiat augue sem, ut ultricies nulla fermentum id. Curabitur sed ipsum urna.
const posts: Post_Props[] = [
  {
    key: 2,
    title: 'Item One',
    text: 'Lorem ipsum dolor ',
    status: 'active',
  },
  {
    key: 99,
    title: 'Item Two',
    text: 'Proin placerat leo sit amet ex ornare bibendum. ',
    status: 'active',
  },
  {
    key: 87,
    title: 'Item Three',
    text: 'Nunc pulvinar erat quis',
    status: 'active',
  },
  {
    key: 17,
    title: 'Item Four',
    text: 'Proin placerat leo sit amet ex ornare bibendum. ',
    status: 'error',
  },
  {
    key: 19,
    title: 'Item Five',
    text: 'leo sit amet ex ornare ',
    status: 'active',
  },
];

const buttonOne = {
  children: 'Button One',
}

const buttonTwo = {
  children: 'Button Two',
  onClick: () => console.log('Button Two Clicked')
}


const network : SupportedNetwork = 'mastodon';
const accounts : Account[] = [
  {
    network,
    instanceUrl: 'https://mastodon.social',
    accountId: '1',
    accountName: 'Josh One',
    accountHandle: '@Josh412',

    accountAvatarUrl: 'https://files.mastodon.social/accounts/avatars/000/425/078/original/7006abf653ee7ca0.png',
  },
  {
    network,
    instanceUrl: 'https://fosstodon.org',
    accountId: '122',
    accountName: 'Josh Pollock',
    accountHandle: '@Josh412',
    accountAvatarUrl: 'https://cdn.fosstodon.org/accounts/avatars/109/276/361/938/539/865/original/ac052ce9bc796f07.png',
  }
].map(account => ({...account, key:`${account.network}-${account.instanceUrl.replace('https://', '')}-${account.accountId}`})
)

export default function App(){
  useEffect(() => {
    fetch('/api/scheduler').then(r => r.json()).then(r => console.log(r))
  },[])

  const onPublish = (text: string, enabledAccounts: Account[]) => {
    console.log({text,enabledAccounts})
  }

  return (
    <>
      <Header title={'App Title'} buttonOne={buttonOne} buttonTwo={buttonTwo} />
      <>
        <Composer onPublish={onPublish} accounts={accounts} />
      </>
      <Grid columns={2}>
        <PostList posts={posts} account={accounts[0]} />
        <PostList posts={posts} account={accounts[1]}/>
      </Grid>

    </>
  );
}
