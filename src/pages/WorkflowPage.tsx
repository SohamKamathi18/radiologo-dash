import React, { useState, useEffect } from 'react';
import { WorkflowStepper } from '@/components/WorkflowStepper';
import { PatientFormStep } from '@/components/workflow/PatientFormStep';
import { ImageUploadStep } from '@/components/workflow/ImageUploadStep';
import { AnalysisStep } from '@/components/workflow/AnalysisStep';
import { ReportReviewStep } from '@/components/workflow/ReportReviewStep';
import { ApprovalStep } from '@/components/workflow/ApprovalStep';
import { ShareStep } from '@/components/workflow/ShareStep';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "Patient Info",
    description: "Enter patient details"
  },
  {
    id: 2,
    title: "Upload Image",
    description: "Upload medical images"
  },
  {
    id: 3,
    title: "AI Analysis",
    description: "Processing & segmentation"
  },
  {
    id: 4,
    title: "Review Report",
    description: "Review AI findings"
  },
  {
    id: 5,
    title: "Approve",
    description: "Edit & finalize"
  },
  {
    id: 6,
    title: "Share",
    description: "Share with patient"
  }
];

interface WorkflowData {
  patient: any;
  images: File[];
  analysis: any;
  report: any;
  approved: boolean;
  shareLink?: string;
}

export function WorkflowPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    patient: null,
    images: [],
    analysis: null,
    report: null,
    approved: false
  });

  const updateWorkflowData = (key: keyof WorkflowData, value: any) => {
    setWorkflowData(prev => ({ ...prev, [key]: value }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return workflowData.patient !== null;
      case 2:
        return workflowData.images.length > 0;
      case 3:
        return workflowData.analysis !== null;
      case 4:
        return workflowData.report !== null;
      case 5:
        return workflowData.approved;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < WORKFLOW_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PatientFormStep
            patient={workflowData.patient}
            onPatientChange={(patient) => updateWorkflowData('patient', patient)}
          />
        );
      case 2:
        return (
          <ImageUploadStep
            images={workflowData.images}
            onImagesChange={(images) => updateWorkflowData('images', images)}
          />
        );
      case 3:
        return (
          <AnalysisStep
            images={workflowData.images}
            patient={workflowData.patient}
            onAnalysisComplete={(analysis) => updateWorkflowData('analysis', analysis)}
          />
        );
      case 4:
        return (
          <ReportReviewStep
            analysis={workflowData.analysis}
            patient={workflowData.patient}
            onReportChange={(report) => updateWorkflowData('report', report)}
          />
        );
      case 5:
        return (
          <ApprovalStep
            report={workflowData.report}
            patient={workflowData.patient}
            onApproval={() => updateWorkflowData('approved', true)}
          />
        );
      case 6:
        return (
          <ShareStep
            patient={workflowData.patient}
            report={workflowData.report}
            onShareComplete={(shareLink) => updateWorkflowData('shareLink', shareLink)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border shadow-elegant p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Medical Imaging Workflow</h1>
            <p className="text-muted-foreground">Complete patient analysis from start to finish</p>
          </div>

          <WorkflowStepper currentStep={currentStep} steps={WORKFLOW_STEPS} />

          <div className="mt-8 min-h-[500px]">
            {renderCurrentStep()}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceedToNext() || currentStep === WORKFLOW_STEPS.length}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}