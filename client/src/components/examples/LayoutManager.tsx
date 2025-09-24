import LayoutManager from '../LayoutManager';

export default function LayoutManagerExample() {
  return (
    <LayoutManager 
      onAddSection={(type) => console.log('Add section:', type)}
      onEditSection={(id) => console.log('Edit section:', id)}
    />
  );
}