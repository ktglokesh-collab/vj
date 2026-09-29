import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ResourceId } from '../domain/types';
import { useAppStore } from '../state/store';
import { PageHeader } from '../components/common/PageHeader';
import { ResourceDetail } from '../components/topology/ResourceDetail';
import { ChevronLeft } from 'lucide-react';

const VALID_RESOURCES: ResourceId[] = ['beds', 'icu', 'staff', 'or', 'emergency'];

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  const isValid = resourceId && VALID_RESOURCES.includes(resourceId as ResourceId);

  useEffect(() => {
    if (!isValid) {
      addToast({
        title: 'Resource Not Found',
        message: `Unknown resource identifier "${resourceId}". Redirected to Topology.`,
        type: 'warning',
      });
      navigate('/resources', { replace: true });
    }
  }, [isValid, resourceId, navigate, addToast]);

  if (!isValid) return null;

  const validResId = resourceId as ResourceId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={`Resource View: ${validResId.toUpperCase()}`}
        description="Focused operational census, skill distribution, schedule, and downstream propagation."
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/resources')}>
            <ChevronLeft size={16} />
            <span>Back to Topology</span>
          </button>
        }
      />

      <div className="panel" style={{ maxWidth: '800px' }}>
        <ResourceDetail resourceId={validResId} />
      </div>
    </div>
  );
};
