import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px 0' }}>
      <EmptyState
        icon={<Compass size={48} />}
        title="Page or Route Not Found"
        description="The requested operational navigation destination does not exist within the simulation environment."
        action={
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Return to Command Center Overview
          </button>
        }
      />
    </div>
  );
};
