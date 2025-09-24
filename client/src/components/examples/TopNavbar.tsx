import TopNavbar from '../TopNavbar';

export default function TopNavbarExample() {
  return (
    <TopNavbar onSearch={(query) => console.log('Search:', query)} />
  );
}