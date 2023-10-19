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

export default function App(){
  return (
    <>
      <Header title={'App Title'} />
      <Grid columns={2}>
        <PostList posts={posts} />
        <PostList posts={posts} />
      </Grid>
    </>
  );
};
