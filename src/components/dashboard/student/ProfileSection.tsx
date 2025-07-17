"use client";

import { User, Camera, Edit } from "lucide-react";
import { ProfileData } from "./types";

interface ProfileSectionProps {
  profileData: ProfileData;
  onEditClick: () => void;
}

export default function ProfileSection({
  profileData,
  onEditClick,
}: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profileData.name}
            </h2>
            <p className="text-gray-600">Kelas: {profileData.class}</p>
            <p className="text-gray-600">Angkatan: {profileData.year}</p>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </div>
  );
}
