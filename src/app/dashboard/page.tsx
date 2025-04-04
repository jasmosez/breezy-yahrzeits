import Layout from '@/components/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>
          Yahrzeit Dashboard
        </h1>
        <p style={{ color: 'var(--text-light)' }}>
          Welcome to your Yahrzeit management dashboard. Here you can view and manage your organization's yahrzeit records.
        </p>
      </div>
    </Layout>
  );
} 