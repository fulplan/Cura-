import UsersManager from '../UsersManager';

export default function UsersManagerExample() {
  return (
    <UsersManager 
      onCreateUser={() => console.log('Create new user')}
      onEditUser={(id) => console.log('Edit user:', id)}
    />
  );
}