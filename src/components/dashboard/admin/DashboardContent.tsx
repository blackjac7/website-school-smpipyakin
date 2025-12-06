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

/**
 * DashboardContent component.
 * Displays the main content for the admin dashboard, including stats cards, quick action buttons, and activity list.
 * @param {DashboardContentProps} props - The component props.
 * @param {StatCard[]} props.stats - The array of statistics to display.
 * @param {Activity[]} props.activities - The array of recent activities to display.
 * @param {function} props.onAddUser - Callback function to add a new user.
 * @param {function} props.onAddContent - Callback function to add new content.
 * @returns {JSX.Element} The rendered DashboardContent component.
 */
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
