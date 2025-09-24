import Dashboard from '../Dashboard';

export default function DashboardExample() {
  return (
    <Dashboard onQuickAction={(action) => console.log('Quick action:', action)} />
  );
}