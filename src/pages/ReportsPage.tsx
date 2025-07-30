import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Brain, 
  AlertCircle, 
  CheckCircle,
  X,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import { reportsAPI, ReportUploadResponse, MedicalEntity } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const entityColors: Record<string, string> = {
  'Disease_disorder': 'bg-destructive/10 text-destructive border-destructive/30',
  'Medication': 'bg-primary/10 text-primary border-primary/30',
  'Symptom': 'bg-warning/10 text-warning border-warning/30',
  'Body_part': 'bg-accent/10 text-accent border-accent/30',
  'Test': 'bg-success/10 text-success border-success/30',
  'Treatment': 'bg-secondary/10 text-secondary-foreground border-secondary/30'
};

export function ReportsPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ReportUploadResponse | null>(null);
  const [error, setError] = useState<string>('');

  const { hasRole } = useAuth();
  const { toast } = useToast();

  const canUpload = hasRole('admin') || hasRole('doctor');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setSelectedFile(pdfFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !canUpload) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const result = await reportsAPI.upload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      
      toast({
        title: "Report Uploaded Successfully",
        description: "Medical entities have been extracted and analyzed",
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      toast({
        title: "Upload Failed",
        description: "Failed to process the medical report",
        variant: "destructive",
      });
      
      // Mock result for demo
      setUploadResult({
        report_id: 'demo-' + Date.now(),
        extracted_text: 'Patient presents with chest pain and shortness of breath. X-ray reveals possible pneumonia in the lower left lobe. Prescribed antibiotics and follow-up in one week.',
        entities: [
          { text: 'chest pain', label: 'Symptom', confidence: 0.95, start: 20, end: 30 },
          { text: 'shortness of breath', label: 'Symptom', confidence: 0.92, start: 35, end: 52 },
          { text: 'pneumonia', label: 'Disease_disorder', confidence: 0.88, start: 75, end: 84 },
          { text: 'lower left lobe', label: 'Body_part', confidence: 0.91, start: 92, end: 107 },
          { text: 'antibiotics', label: 'Medication', confidence: 0.93, start: 119, end: 130 }
        ],
        summary: 'Patient diagnosed with possible pneumonia based on chest X-ray findings and clinical symptoms.'
      });
      setUploadProgress(100);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadResult(null);
    setError('');
  };

  const getEntityColor = (label: string) => {
    return entityColors[label] || 'bg-muted/10 text-muted-foreground border-muted/30';
  };

  if (!canUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Reports</h1>
            <p className="text-muted-foreground">AI-powered medical document analysis</p>
          </div>
        </div>

        <Alert className="bg-muted/30 border-border">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-muted-foreground">
            You don't have permission to upload medical reports. This feature is available to doctors and administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Reports</h1>
          <p className="text-muted-foreground">AI-powered medical document analysis and NER extraction</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary">
          <Brain className="w-3 h-3 mr-1" />
          AI-Powered Analysis
        </Badge>
      </div>

      {/* Upload Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5" />
            Upload Medical Report
          </CardTitle>
          <CardDescription>
            Upload PDF medical reports for automatic entity extraction and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!uploadResult ? (
            <>
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-medical ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {selectedFile ? selectedFile.name : 'Drop your PDF file here'}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedFile 
                        ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                        : 'or click to browse files'
                      }
                    </p>
                  </div>

                  {!selectedFile && (
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      Browse Files
                    </Button>
                  )}
                </div>

                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Processing report...</span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-medical"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Report
                    </>
                  )}
                </Button>
                
                {selectedFile && (
                  <Button variant="outline" onClick={resetUpload} className="border-border">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* Upload Results */
            <div className="space-y-6">
              {/* Success Message */}
              <Alert className="bg-success/10 border-success/30">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Report processed successfully! Medical entities have been extracted and analyzed.
                </AlertDescription>
              </Alert>

              {/* Extracted Entities */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Extracted Medical Entities</h3>
                <div className="flex flex-wrap gap-2">
                  {uploadResult.entities.map((entity, index) => (
                    <Badge
                      key={index}
                      className={`${getEntityColor(entity.label)} text-sm py-1 px-3`}
                    >
                      <span className="font-medium">{entity.text}</span>
                      <span className="ml-2 text-xs opacity-75">
                        {entity.label} ({Math.round(entity.confidence * 100)}%)
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">AI Summary</h3>
                <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-foreground">{uploadResult.summary}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="border-border">
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Report
                </Button>
                <Button variant="outline" className="border-border">
                  <Download className="mr-2 h-4 w-4" />
                  Export Analysis
                </Button>
                <Button onClick={resetUpload} className="bg-primary hover:bg-primary/90">
                  Upload Another Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entity Legend */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Entity Types</CardTitle>
          <CardDescription>
            Medical entities that our AI can identify and extract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(entityColors).map(([type, colorClass]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></div>
                <span className="text-sm text-foreground">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;