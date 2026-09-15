import React from 'react';
import { useGame } from '../../context/GameContext';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';
import { PixelValleyBackground } from '../common/PixelValleyBackground';

export const GroupDashboard = () => {
  const { userRole } = useGame();

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden flex flex-col justify-between select-none bg-[#74c2e8] p-2 sm:p-4 md:p-6 pb-28 text-left">
      {/* Detailed Stardew Valley Background */}
      <PixelValleyBackground overlay="medium" />

      {/* Solid Master Wooden Panel */}
      <div className="max-w-6xl mx-auto w-full relative z-10 rounded-2xl md:rounded-3xl border-4 md:border-8 border-[#241005] bg-[#3a1d0b] p-3 sm:p-5 md:p-6 shadow-[0_10px_0_#150802,0_16px_24px_rgba(0,0,0,0.6)] space-y-4 text-left">
        {userRole === 'guru' ? <TeacherDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
};
