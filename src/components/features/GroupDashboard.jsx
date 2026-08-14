import React from 'react';
import { useGame } from '../../context/GameContext';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

export const GroupDashboard = () => {
  const { userRole } = useGame();

  return (
    <div className="w-full min-h-screen bg-[#faf6ee] select-none flex flex-col p-4 md:p-8 text-left">
      {userRole === 'guru' ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  );
};
