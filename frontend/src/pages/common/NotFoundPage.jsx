import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 shadow-elevated dark:shadow-dark-elevated">
        <div className="w-16 h-16 rounded-2xl bg-unis-highlight dark:bg-unis-dark-highlight text-unis-forest dark:text-unis-dark-forest flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-unis-ink dark:text-unis-dark-text tracking-tight">
          Resource Not Found (404)
        </h2>
        <p className="text-xs text-unis-slate dark:text-unis-dark-muted mt-2 mb-6 leading-relaxed">
          The institutional page, ticket, or resource you are trying to reach does not exist or may have been relocated.
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
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
