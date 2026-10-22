import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 shadow-elevated dark:shadow-dark-elevated">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-unis-ink dark:text-unis-dark-text tracking-tight">
          Institutional Access Restricted
        </h2>
        <p className="text-xs text-unis-slate dark:text-unis-dark-muted mt-2 mb-6 leading-relaxed">
          Your current account role does not have authorization to access this administrative section. Please contact your department coordinator or institutional system administrator if you believe this is an error.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            icon={ArrowLeft}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={Home}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
