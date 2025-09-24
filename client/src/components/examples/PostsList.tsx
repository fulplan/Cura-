import PostsList from '../PostsList';

export default function PostsListExample() {
  return (
    <PostsList 
      onCreatePost={() => console.log('Create new post')}
      onEditPost={(id) => console.log('Edit post:', id)}
    />
  );
}