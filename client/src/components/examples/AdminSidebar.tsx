import AdminSidebar from '../AdminSidebar';

export default function AdminSidebarExample() {
  return (
    <div className="h-screen">
      <AdminSidebar 
        activeItem="dashboard"
        onItemClick={(item) => console.log('Navigate to:', item)} 
      />
    </div>
  );
}