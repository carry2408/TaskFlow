import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { CreateIssueModal } from '../issues/CreateIssueModal';

export function AppLayout() {
  const [createIssueOpen, setCreateIssueOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onOpenCreateIssue={() => setCreateIssueOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ openCreateIssue: () => setCreateIssueOpen(true) }} />
        </main>
      </div>

      <CreateIssueModal
        isOpen={createIssueOpen}
        onClose={() => setCreateIssueOpen(false)}
        onIssueCreated={() => {
          setCreateIssueOpen(false);
          window.dispatchEvent(new CustomEvent('taskflow:issue-created'));
        }}
      />
    </div>
  );
}

