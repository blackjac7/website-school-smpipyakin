import { UserPlus, FileText } from "lucide-react";
import { StatCard, Activity } from './types';
import StatsCards from './StatsCards';
import ActivityList from './ActivityList';

interface DashboardContentProps {
  stats: StatCard[];
  activities: Activity[];
  onAddUser: () => void;
  onAddContent: () => void;
}

export default function DashboardContent({ stats, activities, onAddUser, onAddContent }: DashboardContentProps) {
  return (
    <>
      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={onAddUser}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna
        </button>
        <button
          onClick={onAddContent}
          className="btn-secondary flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Tambah Pengumuman
        </button>
      </div>

      {/* Activities */}
      <ActivityList activities={activities} />
    </>
  );
}
