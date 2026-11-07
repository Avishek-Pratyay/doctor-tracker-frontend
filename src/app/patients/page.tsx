'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  X,
  Phone,
  Stethoscope,
  HeartPulse,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import api from '@/lib/api';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('All');
  const [status, setStatus] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [filterOptions, setFilterOptions] = useState<{
    conditions: string[];
    statuses: string[];
    doctors: { id: string; name: string; specialization: string; hospital: string }[];
  }>({ conditions: [], statuses: [], doctors: [] });

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    phone: '',
    email: '',
    doctor: '',
    status: 'Active',
    admissionDate: '',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch filter options (conditions, statuses, doctors)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get('/patients/filters');
        if (res.data.success) {
          setFilterOptions(res.data.data);
          if (res.data.data.doctors?.length > 0 && !patientForm.doctor) {
            setPatientForm((prev) => ({
              ...prev,
              doctor: res.data.data.doctors[0].id,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load patient filter options:', err);
      }
    };
    fetchFilters();
  }, [patientForm.doctor]);

  // Fetch Patients
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (search) params.append('search', search);
      if (condition !== 'All') params.append('condition', condition);
      if (status !== 'All') params.append('status', status);
      if (selectedDoctor !== 'All') params.append('doctor', selectedDoctor);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/patients?${params.toString()}`);
      if (res.data.success) {
        setPatients(res.data.data);
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages,
        }));
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    condition,
    status,
    selectedDoctor,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Create Patient
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post('/patients', {
        ...patientForm,
        age: Number(patientForm.age),
        admissionDate: patientForm.admissionDate || new Date().toISOString(),
      });
      if (res.data.success) {
        setIsAddPatientOpen(false);
        setPatientForm({
          name: '',
          age: '',
          gender: 'Male',
          condition: '',
          phone: '',
          email: '',
          doctor: filterOptions.doctors[0]?.id || '',
          status: 'Active',
          admissionDate: '',
          notes: '',
        });
        fetchPatients();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Patient Modal
  const handleOpenEdit = (patient: any) => {
    setSelectedPatient(patient);
    setPatientForm({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      condition: patient.condition,
      phone: patient.phone,
      email: patient.email || '',
      doctor: patient.doctor?._id || patient.doctor || '',
      status: patient.status || 'Active',
      admissionDate: patient.admissionDate
        ? new Date(patient.admissionDate).toISOString().split('T')[0]
        : '',
      notes: patient.notes || '',
    });
    setFormError(null);
    setIsEditPatientOpen(true);
  };

  // Update Patient
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await api.put(`/patients/${selectedPatient._id}`, {
        ...patientForm,
        age: Number(patientForm.age),
      });
      if (res.data.success) {
        setIsEditPatientOpen(false);
        setSelectedPatient(null);
        fetchPatients();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Patient
  const handleDeletePatient = async () => {
    if (!deletePatientId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/patients/${deletePatientId}`);
      setDeletePatientId(null);
      fetchPatients();
    } catch (err) {
      console.error('Failed to delete patient:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCondition('All');
    setStatus('All');
    setSelectedDoctor('All');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <AppLayout
      title="Patient Management"
      subtitle="Complete clinical registry, diagnosis tracking, and doctor allocations"
    >
      <div className="space-y-6">
        {/* Controls: Search, Multi-Filter & Add Button */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Search patients by name, condition, phone..."
            />
            <button
              onClick={() => {
                setFormError(null);
                setPatientForm({
                  name: '',
                  age: '',
                  gender: 'Male',
                  condition: '',
                  phone: '',
                  email: '',
                  doctor: filterOptions.doctors[0]?.id || '',
                  status: 'Active',
                  admissionDate: new Date().toISOString().split('T')[0],
                  notes: '',
                });
                setIsAddPatientOpen(true);
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          </div>

          {/* Filtering Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Condition Filter */}
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Conditions</option>
              {filterOptions.conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              {filterOptions.statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Assigned Doctor Filter */}
            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[200px] truncate"
            >
              <option value="All">All Assigned Doctors</option>
              {filterOptions.doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>

            {/* Date-wise Filter: Start Date */}
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600">
              <span className="text-[11px] text-slate-400">Admitted From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="bg-transparent focus:outline-none text-slate-700 text-xs"
              />
            </div>

            {/* Date-wise Filter: End Date */}
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600">
              <span className="text-[11px] text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="bg-transparent focus:outline-none text-slate-700 text-xs"
              />
            </div>

            {(search ||
              condition !== 'All' ||
              status !== 'All' ||
              selectedDoctor !== 'All' ||
              startDate ||
              endDate) && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={10} cols={6} />
            </div>
          ) : patients.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No patients found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Try modifying your search or filter selections, or register a new patient.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Patient Name</th>
                    <th className="py-3.5 px-4">Demographics</th>
                    <th className="py-3.5 px-4">Condition / Diagnosis</th>
                    <th className="py-3.5 px-4">Assigned Doctor</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Clinical Status</th>
                    <th className="py-3.5 px-4">Admission Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {patients.map((pat) => (
                    <tr
                      key={pat._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
                            {pat.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                              {pat.name}
                            </p>
                            {pat.notes && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                {pat.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {pat.age} yrs • {pat.gender}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/60">
                          {pat.condition}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-emerald-600" />
                            {pat.doctor?.name || 'Unassigned'}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            {pat.doctor?.specialization || 'Clinical Staff'}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {pat.phone}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            pat.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : pat.status === 'In Treatment'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : pat.status === 'Critical'
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {pat.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(pat.admissionDate).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEdit(pat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit patient"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletePatientId(pat._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-5">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(limit) =>
                setPagination((prev) => ({ ...prev, limit, page: 1 }))
              }
            />
          </div>
        </div>
      </div>

      {/* MODAL 1: Register Patient */}
      <Modal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title="Register New Patient"
        subtitle="Add patient details and allocate an attending physician"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={patientForm.name}
              onChange={(e) =>
                setPatientForm({ ...patientForm, name: e.target.value })
              }
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                required
                min="0"
                max="125"
                value={patientForm.age}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, age: e.target.value })
                }
                placeholder="35"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={patientForm.gender}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, gender: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Medical Condition / Diagnosis *
              </label>
              <input
                type="text"
                required
                value={patientForm.condition}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, condition: e.target.value })
                }
                placeholder="e.g. Hypertension, Asthma..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Attending Doctor *
              </label>
              <select
                required
                value={patientForm.doctor}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, doctor: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {filterOptions.doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} – {doc.specialization} ({doc.hospital})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={patientForm.phone}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Clinical Status
              </label>
              <select
                value={patientForm.status}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="In Treatment">In Treatment</option>
                <option value="Critical">Critical</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                value={patientForm.admissionDate}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    admissionDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, email: e.target.value })
                }
                placeholder="patient@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Clinical Notes
            </label>
            <textarea
              rows={2}
              value={patientForm.notes}
              onChange={(e) =>
                setPatientForm({ ...patientForm, notes: e.target.value })
              }
              placeholder="Treatment plan, notes or patient history..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPatientOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Patient */}
      <Modal
        isOpen={isEditPatientOpen}
        onClose={() => setIsEditPatientOpen(false)}
        title="Edit Patient Information"
        subtitle={`Update clinical records for ${selectedPatient?.name}`}
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePatient} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={patientForm.name}
              onChange={(e) =>
                setPatientForm({ ...patientForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                required
                min="0"
                max="125"
                value={patientForm.age}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, age: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={patientForm.gender}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, gender: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Medical Condition *
              </label>
              <input
                type="text"
                required
                value={patientForm.condition}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, condition: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Attending Doctor *
              </label>
              <select
                required
                value={patientForm.doctor}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, doctor: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {filterOptions.doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} – {doc.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={patientForm.phone}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={patientForm.status}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="In Treatment">In Treatment</option>
                <option value="Critical">Critical</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Clinical Notes
            </label>
            <textarea
              rows={2}
              value={patientForm.notes}
              onChange={(e) =>
                setPatientForm({ ...patientForm, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditPatientOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving changes...' : 'Update Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM: Delete Patient */}
      <ConfirmDialog
        isOpen={!!deletePatientId}
        onClose={() => setDeletePatientId(null)}
        onConfirm={handleDeletePatient}
        title="Delete Patient Record"
        message="Are you sure you want to permanently delete this patient record? This action will remove all associated clinical notes and history."
        confirmText="Confirm Delete"
        isLoading={isDeleting}
      />
    </AppLayout>
  );
}
