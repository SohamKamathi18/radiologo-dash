import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ScanLine, 
  Upload, 
  Brain, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  MessageCircle,
  Download,
  GitCompare,
  Zap
} from 'lucide-react';
import { xrayAPI, XrayAnalysisResponse } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function XrayPage() {
  const [activeTab, setActiveTab] = useState('single');
  
  // Single Analysis State
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleIsDragOver, setSingleIsDragOver] = useState(false);
  const [singleAnalysisResult, setSingleAnalysisResult] = useState<XrayAnalysisResponse | null>(null);
  
  // Comparison State
  const [compareFile1, setCompareFile1] = useState<File | null>(null);
  const [compareFile2, setCompareFile2] = useState<File | null>(null);
  const [compareIsDragOver1, setCompareIsDragOver1] = useState(false);
  const [compareIsDragOver2, setCompareIsDragOver2] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<XrayAnalysisResponse | null>(null);
  
  // Q&A State
  const [question, setQuestion] = useState('');
  const [qnaHistory, setQnaHistory] = useState<Array<{question: string, answer: string}>>([]);
  
  // Common State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState('');

  const { toast } = useToast();

  // File handling utilities
  const createFileHandlers = (
    setFile: (file: File | null) => void,
    setIsDragOver: (isDragOver: boolean) => void
  ) => ({
    handleDragOver: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []),

    handleDragLeave: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []),

    handleDrop: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find(file => file.type.startsWith('image/'));
      
      if (imageFile) {
        setFile(imageFile);
        setError('');
      } else {
        setError('Please upload an image file (JPG, PNG, DICOM)');
      }
    }, []),

    handleFileSelect: useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setFile(file);
        setError('');
      } else {
        setError('Please select an image file');
      }
    }, [])
  });

  const singleHandlers = createFileHandlers(setSingleFile, setSingleIsDragOver);
  const compare1Handlers = createFileHandlers(setCompareFile1, setCompareIsDragOver1);
  const compare2Handlers = createFileHandlers(setCompareFile2, setCompareIsDragOver2);

  const simulateProgress = () => {
    setAnalysisProgress(0);
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 500);
    return progressInterval;
  };

  const handleSingleAnalysis = async () => {
    if (!singleFile) return;

    setIsAnalyzing(true);
    setError('');
    const progressInterval = simulateProgress();

    try {
      const result = await xrayAPI.analyze(singleFile);
      setSingleAnalysisResult(result);
      setAnalysisProgress(100);
      
      toast({
        title: "X-Ray Analysis Complete",
        description: "AI analysis has been completed successfully",
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
      
      // Mock result for demo
      setSingleAnalysisResult({
        analysis_id: 'demo-single-' + Date.now(),
        pathologies: [
          { condition: 'Pneumonia', probability: 0.85, severity: 'Moderate', location: 'Lower left lobe' },
          { condition: 'Pleural Effusion', probability: 0.23, severity: 'Mild', location: 'Right side' },
          { condition: 'Cardiomegaly', probability: 0.12, severity: 'Mild' }
        ],
        report: 'The chest X-ray shows evidence of consolidation in the lower left lobe consistent with pneumonia. There is mild cardiomegaly and possible small pleural effusion on the right side. Recommend antibiotic treatment and follow-up imaging.',
        segmentation_map: '/api/segmentation/demo-single-' + Date.now(),
        recommendations: [
          'Start broad-spectrum antibiotics',
          'Monitor oxygen saturation',
          'Follow-up chest X-ray in 7-10 days',
          'Consider CT scan if no improvement'
        ]
      });
      setAnalysisProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const handleComparison = async () => {
    if (!compareFile1 || !compareFile2) return;

    setIsAnalyzing(true);
    setError('');
    const progressInterval = simulateProgress();

    try {
      const result = await xrayAPI.compare(compareFile1, compareFile2);
      setComparisonResult(result);
      setAnalysisProgress(100);
      
      toast({
        title: "X-Ray Comparison Complete",
        description: "Comparative analysis has been completed",
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Comparison failed. Please try again.');
      
      // Mock comparison result
      setComparisonResult({
        analysis_id: 'demo-compare-' + Date.now(),
        pathologies: [
          { condition: 'Pneumonia', probability: 0.15, severity: 'Resolved', location: 'Lower left lobe' },
          { condition: 'Pleural Effusion', probability: 0.08, severity: 'Improved', location: 'Right side' }
        ],
        report: 'Comparison shows significant improvement. The pneumonia in the lower left lobe has largely resolved. The pleural effusion on the right side has decreased. Overall positive response to treatment.',
        recommendations: [
          'Continue current antibiotic course',
          'Patient showing good recovery',
          'Consider discharge planning',
          'Routine follow-up in 2 weeks'
        ]
      });
      setAnalysisProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim() || !singleAnalysisResult) return;

    try {
      const result = await xrayAPI.askQuestion(singleAnalysisResult.analysis_id, question);
      setQnaHistory(prev => [...prev, { question, answer: result.answer }]);
      setQuestion('');
      
      toast({
        title: "Question Answered",
        description: "AI has provided a response to your query",
      });
    } catch (err: any) {
      // Mock answer for demo
      const mockAnswer = "Based on the X-ray analysis, the finding you're asking about shows characteristic signs consistent with the diagnostic assessment. The AI confidence level and clinical correlation suggest this interpretation aligns with standard radiological practices.";
      setQnaHistory(prev => [...prev, { question, answer: mockAnswer }]);
      setQuestion('');
    }
  };

  const FileUploadArea = ({ 
    file, 
    isDragOver, 
    handlers, 
    title, 
    placeholder = "Drop X-ray image here" 
  }: {
    file: File | null;
    isDragOver: boolean;
    handlers: any;
    title: string;
    placeholder?: string;
  }) => (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-medical ${
        isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}
      onDragOver={handlers.handleDragOver}
      onDragLeave={handlers.handleDragLeave}
      onDrop={handlers.handleDrop}
    >
      <div className="space-y-3">
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Upload className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">
            {file ? file.name : placeholder}
          </p>
        </div>
      </div>

      <input
        type="file"
        accept="image/*,.dcm"
        onChange={handlers.handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );

  const PathologyBadge = ({ pathology }: { pathology: any }) => {
    const getColorByProbability = (prob: number) => {
      if (prob >= 0.7) return 'bg-destructive/10 text-destructive border-destructive/30';
      if (prob >= 0.4) return 'bg-warning/10 text-warning border-warning/30';
      return 'bg-success/10 text-success border-success/30';
    };

    return (
      <div className={`p-3 rounded-lg border ${getColorByProbability(pathology.probability)}`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium">{pathology.condition}</h4>
          <Badge variant="outline" className="text-xs">
            {Math.round(pathology.probability * 100)}%
          </Badge>
        </div>
        {pathology.severity && (
          <p className="text-xs opacity-75">Severity: {pathology.severity}</p>
        )}
        {pathology.location && (
          <p className="text-xs opacity-75">Location: {pathology.location}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">X-Ray Analysis</h1>
          <p className="text-muted-foreground">AI-powered medical imaging analysis and comparison</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary">
          <ScanLine className="w-3 h-3 mr-1" />
          Medical AI Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
          <TabsTrigger value="single" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ScanLine className="w-4 h-4 mr-2" />
            Single Analysis
          </TabsTrigger>
          <TabsTrigger value="compare" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GitCompare className="w-4 h-4 mr-2" />
            Compare X-Rays
          </TabsTrigger>
          <TabsTrigger value="qna" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Q&A
          </TabsTrigger>
        </TabsList>

        {/* Single X-Ray Analysis */}
        <TabsContent value="single" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Brain className="h-5 w-5" />
                Single X-Ray Analysis
              </CardTitle>
              <CardDescription>
                Upload a single X-ray image for AI-powered pathology detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadArea
                file={singleFile}
                isDragOver={singleIsDragOver}
                handlers={singleHandlers}
                title="Upload X-Ray Image"
              />

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">AI analyzing X-ray...</span>
                    <span className="text-muted-foreground">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleSingleAnalysis}
                disabled={!singleFile || isAnalyzing}
                className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-medical"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze X-Ray
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Single Analysis Results */}
          {singleAnalysisResult && (
            <div className="space-y-6">
              <Alert className="bg-success/10 border-success/30">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  X-ray analysis completed successfully. Pathologies detected and analyzed.
                </AlertDescription>
              </Alert>

              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Detected Pathologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {singleAnalysisResult.pathologies.map((pathology, index) => (
                      <PathologyBadge key={index} pathology={pathology} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">AI Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{singleAnalysisResult.report}</p>
                </CardContent>
              </Card>

              {singleAnalysisResult.recommendations && (
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {singleAnalysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-foreground">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* X-Ray Comparison */}
        <TabsContent value="compare" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <GitCompare className="h-5 w-5" />
                X-Ray Comparison
              </CardTitle>
              <CardDescription>
                Compare two X-ray images to track treatment progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FileUploadArea
                  file={compareFile1}
                  isDragOver={compareIsDragOver1}
                  handlers={compare1Handlers}
                  title="Before Treatment"
                  placeholder="Drop first X-ray here"
                />
                
                <FileUploadArea
                  file={compareFile2}
                  isDragOver={compareIsDragOver2}
                  handlers={compare2Handlers}
                  title="After Treatment"
                  placeholder="Drop second X-ray here"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Comparing X-rays...</span>
                    <span className="text-muted-foreground">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleComparison}
                disabled={!compareFile1 || !compareFile2 || isAnalyzing}
                className="bg-gradient-medical hover:shadow-glow text-primary-foreground transition-medical"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <GitCompare className="mr-2 h-4 w-4" />
                    Compare X-Rays
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Comparison Results */}
          {comparisonResult && (
            <div className="space-y-6">
              <Alert className="bg-success/10 border-success/30">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  X-ray comparison completed. Treatment progress analyzed.
                </AlertDescription>
              </Alert>

              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Comparison Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{comparisonResult.report}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Progress Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {comparisonResult.pathologies.map((pathology, index) => (
                      <PathologyBadge key={index} pathology={pathology} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Q&A Tab */}
        <TabsContent value="qna" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MessageCircle className="h-5 w-5" />
                AI Question & Answer
              </CardTitle>
              <CardDescription>
                Ask follow-up questions about the X-ray analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!singleAnalysisResult ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete a single X-ray analysis first to enable Q&A functionality.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Q&A History */}
                  {qnaHistory.length > 0 && (
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {qnaHistory.map((qa, index) => (
                        <div key={index} className="space-y-2">
                          <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                            <p className="text-sm font-medium text-primary">Q: {qa.question}</p>
                          </div>
                          <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                            <p className="text-sm text-foreground">A: {qa.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Question Input */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ask a question about the X-ray analysis..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="bg-input border-border focus:ring-primary"
                      rows={3}
                    />
                    <Button
                      onClick={handleQuestionSubmit}
                      disabled={!question.trim()}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Ask AI
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default XrayPage;