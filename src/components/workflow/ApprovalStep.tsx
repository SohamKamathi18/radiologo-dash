import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, FileCheck, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovalStepProps {
  report: any;
  patient: any;
  onApproval: () => void;
}

export function ApprovalStep({ report, patient, onApproval }: ApprovalStepProps) {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const { toast } = useToast();

  const handleApproval = () => {
    setIsApproved(true);
    onApproval();
    
    toast({
      title: "Report Approved",
      description: "Medical report has been approved and finalized",
    });
  };

  const generateReportSummary = () => {
    if (!report) return null;

    const highConfidenceFindings = report.pathologies?.filter((p: any) => p.probability > 0.7) || [];
    const moderateConfidenceFindings = report.pathologies?.filter((p: any) => p.probability <= 0.7 && p.probability > 0.3) || [];

    return {
      critical: highConfidenceFindings,
      moderate: moderateConfidenceFindings,
      totalFindings: report.pathologies?.length || 0,
      hasRecommendations: report.recommendations?.length > 0
    };
  };

  const summary = generateReportSummary();

  if (isApproved) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-green-600">Report Approved</h3>
              <p className="text-muted-foreground">
                The medical report has been approved and is ready for patient sharing
              </p>
            </div>
            
            {approvalNotes && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Approval Notes:</h4>
                  <p className="text-sm">{approvalNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Report Approval & Finalization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Patient Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{patient?.name || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Medical ID:</span>
                <span className="ml-2 font-medium">{patient?.medical_id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>
                <span className="ml-2 font-medium">{patient?.age || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <span className="ml-2 font-medium">{patient?.gender || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Report Summary */}
          {summary && (
            <Card>
              <CardHeader>
                <h4 className="font-medium">Report Summary</h4>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-destructive">
                      {summary.critical.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Critical Findings</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-warning">
                      {summary.moderate.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Moderate Findings</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-primary">
                      {report.recommendations?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Recommendations</div>
                  </div>
                </div>

                {summary.critical.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-destructive">Critical Findings Requiring Attention</span>
                    </div>
                    <div className="space-y-2">
                      {summary.critical.map((finding: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border border-destructive/20 rounded">
                          <span className="font-medium">{finding.condition}</span>
                          <Badge variant="destructive">
                            {Math.round(finding.probability * 100)}% confidence
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Approval Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                placeholder="Add any additional notes or comments about this report..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Approval Checklist
                  </p>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Report content has been reviewed and verified</li>
                    <li>• All critical findings have been noted</li>
                    <li>• Recommendations are appropriate for the patient</li>
                    <li>• Patient information is accurate and complete</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleApproval}
                size="lg"
                className="px-8"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve & Finalize Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}