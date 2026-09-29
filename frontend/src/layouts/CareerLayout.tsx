import { Outlet } from 'react-router-dom';

export const CareerLayout: React.FC = () => {
  return (
    <div className="w-full h-full min-h-screen bg-white">
      <Outlet />
    </div>
  );
};
