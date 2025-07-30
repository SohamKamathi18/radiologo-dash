import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  UserX, 
  Users, 
  Calendar, 
  MoreVertical,
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { patientsAPI, Patient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { hasRole } = useAuth();
  const { toast } = useToast();

  const canDelete = hasRole('admin') || hasRole('doctor');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search query
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.medical_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      const data = await patientsAPI.getAll();
      setPatients(data);
    } catch (error) {
      toast({
        title: "Error Loading Patients",
        description: "Failed to fetch patient data",
        variant: "destructive",
      });
      // Mock data for demo
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'John Mitchell',
          age: 45,
          gender: 'Male',
          medical_id: 'PT001',
          created_at: '2024-01-15',
          last_visit: '2024-01-20'
        },
        {
          id: '2',
          name: 'Sarah Connor',
          age: 32,
          gender: 'Female',
          medical_id: 'PT002',
          created_at: '2024-01-16',
          last_visit: '2024-01-25'
        },
        {
          id: '3',
          name: 'Michael Davis',
          age: 67,
          gender: 'Male',
          medical_id: 'PT003',
          created_at: '2024-01-17',
          last_visit: '2024-01-22'
        }
      ];
      setPatients(mockPatients);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    try {
      await patientsAPI.delete(selectedPatient.id);
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
      toast({
        title: "Patient Deleted",
        description: `${selectedPatient.name} has been removed from the system`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete patient record",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedPatient(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGenderBadgeColor = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case 'male': return 'bg-primary/10 text-primary border-primary/30';
      case 'female': return 'bg-accent/10 text-accent border-accent/30';
      default: return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
          <p className="text-muted-foreground">Manage patient records and medical history</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary">
          <Users className="w-3 h-3 mr-1" />
          {patients.length} Total Patients
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-12 text-center">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No patients found' : 'No patients registered'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Try adjusting your search criteria' 
                : 'Patient records will appear here once added to the system'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="bg-card/50 backdrop-blur-sm border-border hover:shadow-clinical transition-medical">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {patient.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ID: {patient.medical_id}</span>
                        {patient.age && <span>Age: {patient.age}</span>}
                        {patient.gender && (
                          <Badge className={`text-xs ${getGenderBadgeColor(patient.gender)}`}>
                            {patient.gender}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {patient.last_visit && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Last Visit</p>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(patient.last_visit)}
                        </div>
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem className="text-foreground hover:bg-secondary">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Patient
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Patient Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete <strong>{selectedPatient?.name}</strong>? 
              This action cannot be undone and will permanently remove all associated medical records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePatient}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role-based access note */}
      {!canDelete && (
        <Alert className="bg-muted/30 border-border">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-muted-foreground">
            You have read-only access to patient records. Contact an administrator for modification permissions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default PatientsPage;