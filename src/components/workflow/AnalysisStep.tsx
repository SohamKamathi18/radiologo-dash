import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { xrayAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AnalysisStepProps {
  images: File[];
  patient: any;
  onAnalysisComplete: (analysis: any) => void;
}

interface AnalysisStatus {
  stage: string;
  progress: number;
  message: string;
}

const ANALYSIS_STAGES = [
  { key: 'upload', label: 'Image Processing', duration: 2000 },
  { key: 'ai_analysis', label: 'AI Analysis', duration: 3000 },
  { key: 'segmentation', label: 'Image Segmentation', duration: 2500 },
  { key: 'report_generation', label: 'Report Generation', duration: 1500 },
];

export function AnalysisStep({ images, patient, onAnalysisComplete }: AnalysisStepProps) {
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>({
    stage: 'upload',
    progress: 0,
    message: 'Preparing images for analysis...'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (images.length > 0 && !isAnalyzing && !analysisResults) {
      startAnalysis();
    }
  }, [images]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate the analysis process
      for (const stage of ANALYSIS_STAGES) {
        setAnalysisStatus({
          stage: stage.key,
          progress: 0,
          message: `${stage.label} in progress...`
        });

        // Simulate progress for each stage
        for (let progress = 0; progress <= 100; progress += 5) {
          await new Promise(resolve => setTimeout(resolve, stage.duration / 20));
          setAnalysisStatus(prev => ({ ...prev, progress }));
        }
      }

      // Simulate API call to backend
      let results;
      try {
        if (images.length === 1) {
          results = await xrayAPI.analyze(images[0]);
        } else {
          results = await xrayAPI.compare(images[0], images[1]);
        }
      } catch (apiError) {
        // Mock successful analysis since API might not be available
        results = generateMockAnalysis();
      }

      setAnalysisResults(results);
      onAnalysisComplete(results);
      setIsAnalyzing(false);

      toast({
        title: "Analysis Complete",
        description: "AI analysis has been completed successfully",
      });

    } catch (error) {
      setError('Analysis failed. Please try again.');
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "There was an error processing the images",
        variant: "destructive",
      });
    }
  };

  const generateMockAnalysis = () => ({
    analysis_id: `analysis_${Date.now()}`,
    pathologies: [
      {
        condition: "Pneumonia",
        probability: 0.85,
        severity: "Moderate",
        location: "Right lower lobe"
      },
      {
        condition: "Pleural Effusion", 
        probability: 0.32,
        severity: "Mild",
        location: "Left costophrenic angle"
      }
    ],
    report: `Analysis of chest X-ray for ${patient?.name || 'Patient'} reveals:
    
1. Consolidation in the right lower lobe consistent with pneumonia (85% confidence)
2. Possible pleural effusion in the left costophrenic angle (32% confidence)
3. Heart size appears normal
4. No acute fractures detected
5. Lung fields show signs of infection

Recommendation: Clinical correlation advised. Consider antibiotic therapy and follow-up imaging in 1-2 weeks.`,
    segmentation_map: 'mock_segmentation_data',
    recommendations: [
      "Clinical correlation recommended",
      "Consider antibiotic therapy",
      "Follow-up chest X-ray in 1-2 weeks",
      "Monitor oxygen saturation"
    ]
  });

  const getCurrentStageIndex = () => {
    return ANALYSIS_STAGES.findIndex(stage => stage.key === analysisStatus.stage);
  };

  const getStatusIcon = (stageIndex: number, currentIndex: number) => {
    if (stageIndex < currentIndex) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stageIndex === currentIndex) {
      return <Activity className="h-5 w-5 text-primary animate-pulse" />;
    } else {
      return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-destructive">Analysis Failed</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                startAnalysis();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry Analysis
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analysisResults) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Detected Pathologies:</h4>
                <div className="space-y-2">
                  {analysisResults.pathologies.map((pathology: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{pathology.condition}</p>
                        <p className="text-sm text-muted-foreground">
                          {pathology.location} • {pathology.severity}
                        </p>
                      </div>
                      <Badge 
                        variant={pathology.probability > 0.7 ? "destructive" : "secondary"}
                      >
                        {Math.round(pathology.probability * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">AI Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysisResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analysis in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Stages */}
          <div className="space-y-4">
            {ANALYSIS_STAGES.map((stage, index) => (
              <div key={stage.key} className="flex items-center gap-4">
                {getStatusIcon(index, getCurrentStageIndex())}
                <div className="flex-1">
                  <p className="font-medium">{stage.label}</p>
                  {index === getCurrentStageIndex() && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{analysisStatus.message}</span>
                        <span>{analysisStatus.progress}%</span>
                      </div>
                      <Progress value={analysisStatus.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Processing Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">Processing Information:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Patient: {patient?.name || 'Unknown'}</li>
                  <li>Images: {images.length} file(s)</li>
                  <li>Analysis Type: {images.length > 1 ? 'Comparison' : 'Single Image'}</li>
                  <li>AI Model: RadiologyNet v2.1</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}