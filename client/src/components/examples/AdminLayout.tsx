import AdminLayout from '../AdminLayout';
import Dashboard from '../Dashboard';

export default function AdminLayoutExample() {
  return (
    <AdminLayout 
      currentPage="dashboard"
      onNavigate={(page) => console.log('Navigate to:', page)}
    >
      <Dashboard onQuickAction={(action) => console.log('Quick action:', action)} />
    </AdminLayout>
  );
}