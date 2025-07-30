import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Search, FileText } from 'lucide-react';
import { patientsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id?: string;
  name: string;
  age?: number;
  gender?: string;
  medical_id?: string;
  email?: string;
  phone?: string;
}

interface PatientFormStepProps {
  patient: Patient | null;
  onPatientChange: (patient: Patient) => void;
}

export function PatientFormStep({ patient, onPatientChange }: PatientFormStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [existingPatients, setExistingPatients] = useState<Patient[]>([]);
  const [pastReports, setPastReports] = useState<any[]>([]);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [formData, setFormData] = useState<Patient>({
    name: '',
    age: 0,
    gender: '',
    medical_id: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      setIsNewPatient(!patient.id);
      if (patient.id) {
        fetchPastReports(patient.id);
      }
    }
  }, [patient]);

  const fetchPastReports = async (patientId: string) => {
    try {
      // Mock past reports - replace with actual API call
      const mockReports = [
        { id: '1', date: '2024-01-15', type: 'Chest X-Ray', status: 'Completed' },
        { id: '2', date: '2024-01-10', type: 'Blood Test', status: 'Completed' },
      ];
      setPastReports(mockReports);
    } catch (error) {
      console.error('Error fetching past reports:', error);
    }
  };

  const searchPatients = async (term: string) => {
    if (!term.trim()) {
      setExistingPatients([]);
      return;
    }

    try {
      const patients = await patientsAPI.search(term);
      setExistingPatients(patients);
    } catch (error) {
      // Use mock data if API fails
      setExistingPatients([
        { id: '1', name: 'John Doe', age: 45, gender: 'Male', medical_id: 'MED001' },
        { id: '2', name: 'Jane Smith', age: 32, gender: 'Female', medical_id: 'MED002' }
      ]);
    }
  };

  const handleInputChange = (field: keyof Patient, value: string | number) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onPatientChange(updatedData);
  };

  const selectExistingPatient = (selectedPatient: Patient) => {
    setFormData(selectedPatient);
    setIsNewPatient(false);
    onPatientChange(selectedPatient);
    setExistingPatients([]);
    setSearchTerm('');
    if (selectedPatient.id) {
      fetchPastReports(selectedPatient.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search existing patients */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Existing Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or medical ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchPatients(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            
            {existingPatients.length > 0 && (
              <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                {existingPatients.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => selectExistingPatient(p)}
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {p.medical_id}</p>
                    </div>
                    <Badge variant="outline">{p.gender}, {p.age}y</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Patient form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter patient name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_id">Medical ID *</Label>
              <Input
                id="medical_id"
                value={formData.medical_id}
                onChange={(e) => handleInputChange('medical_id', e.target.value)}
                placeholder="Enter medical ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                placeholder="Enter age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past Reports */}
      {!isNewPatient && pastReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Past Reports ({pastReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{report.type}</p>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                  </div>
                  <Badge variant="secondary">{report.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}