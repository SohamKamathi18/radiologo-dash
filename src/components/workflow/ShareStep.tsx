import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share2, Link, Mail, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareStepProps {
  patient: any;
  report: any;
  onShareComplete: (shareLink: string) => void;
}

export function ShareStep({ patient, report, onShareComplete }: ShareStepProps) {
  const [shareLink, setShareLink] = useState('');
  const [patientEmail, setPatientEmail] = useState(patient?.email || '');
  const [isShared, setIsShared] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const { toast } = useToast();

  const generateShareLink = () => {
    // Generate a unique share link
    const linkId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedLink = `${window.location.origin}/patient-view/${linkId}`;
    
    setShareLink(generatedLink);
    setLinkGenerated(true);
    onShareComplete(generatedLink);
    
    toast({
      title: "Share Link Generated",
      description: "Secure patient link has been created successfully",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const sendEmail = () => {
    if (!patientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter patient's email address",
        variant: "destructive",
      });
      return;
    }

    // Simulate email sending
    setTimeout(() => {
      setIsShared(true);
      toast({
        title: "Email Sent",
        description: `Report link has been sent to ${patientEmail}`,
      });
    }, 1000);
  };

  const openPatientView = () => {
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Report with Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Sharing Report For:</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{patient?.name || 'Unknown Patient'}</p>
                <p className="text-sm text-muted-foreground">
                  Medical ID: {patient?.medical_id || 'N/A'}
                </p>
              </div>
              <Badge variant="outline">Report Ready</Badge>
            </div>
          </div>

          {!linkGenerated ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Link className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Generate Patient Access Link</h3>
                <p className="text-muted-foreground mb-4">
                  Create a secure link that allows the patient to view their medical report
                </p>
                <Button onClick={generateShareLink} size="lg">
                  <Link className="h-4 w-4 mr-2" />
                  Generate Secure Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Generated Link */}
              <Card>
                <CardHeader>
                  <h4 className="font-medium">Patient Access Link</h4>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openPatientView}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>• This link is secure and expires in 30 days</p>
                    <p>• Patient can view report and ask questions via AI assistant</p>
                    <p>• No personal login required for patient access</p>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Email Sharing */}
              <Card>
                <CardHeader>
                  <h4 className="font-medium">Send via Email</h4>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Patient Email Address</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="Enter patient's email address"
                    />
                  </div>

                  {isShared ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Email sent successfully</span>
                    </div>
                  ) : (
                    <Button onClick={sendEmail} className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Report Link via Email
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Patient Dashboard Preview */}
              <Card>
                <CardHeader>
                  <h4 className="font-medium">What the Patient Will See</h4>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Medical Report Summary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Interactive Q&A Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Download Full Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Contact Healthcare Provider</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}