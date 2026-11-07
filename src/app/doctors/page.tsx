'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Stethoscope,
  Plus,
  Filter,
  Users,
  Trash2,
  Edit2,
  Calendar,
  X,
  Phone,
  Mail,
  Building,
  CheckCircle,
  AlertCircle,
  Eye,
  UserPlus,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/common/SearchBar';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import api from '@/lib/api';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 8,
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [hospital, setHospital] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterOptions, setFilterOptions] = useState<{
    specializations: string[];
    hospitals: string[];
  }>({ specializations: [], hospitals: [] });

  // Modals state
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctorPatientsModalOpen, setDoctorPatientsModalOpen] = useState(false);
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Sub-modal: Add Patient under specific doctor
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // Confirm delete dialogs
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);
  const [deletePatientTarget, setDeletePatientTarget] = useState<{
    doctorId: string;
    patientId: string;
    patientName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Forms state
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
    experienceYears: 5,
    status: 'Active',
  });

  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    phone: '',
    email: '',
    status: 'Active',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch filter options (specialties, hospitals)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get('/doctors/filters');
        if (res.data.success) {
          setFilterOptions(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load doctor filters:', err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch Doctors with query params
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (search) params.append('search', search);
      if (specialization !== 'All') params.append('specialization', specialization);
      if (hospital !== 'All') params.append('hospital', hospital);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/doctors?${params.toString()}`);
      if (res.data.success) {
        setDoctors(res.data.data);
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages,
        }));
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    specialization,
    hospital,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Load doctor details and corresponding patients
  const handleOpenDoctorPatients = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setDoctorPatientsModalOpen(true);
    setLoadingPatients(true);
    try {
      const res = await api.get(`/doctors/${doctor._id}`);
      if (res.data.success) {
        setDoctorPatients(res.data.data.patients || []);
      }
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Create Doctor
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post('/doctors', doctorForm);
      if (res.data.success) {
        setIsAddDoctorOpen(false);
        setDoctorForm({
          name: '',
          specialization: '',
          hospital: '',
          phone: '',
          email: '',
          experienceYears: 5,
          status: 'Active',
        });
        fetchDoctors();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create doctor record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Doctor
  const handleOpenEdit = (doctor: any) => {
    setSelectedDoctor(doctor);
    setDoctorForm({
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
      experienceYears: doctor.experienceYears || 1,
      status: doctor.status || 'Active',
    });
    setFormError(null);
    setIsEditDoctorOpen(true);
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await api.put(`/doctors/${selectedDoctor._id}`, doctorForm);
      if (res.data.success) {
        setIsEditDoctorOpen(false);
        setSelectedDoctor(null);
        fetchDoctors();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async () => {
    if (!deleteDoctorId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/doctors/${deleteDoctorId}`);
      setDeleteDoctorId(null);
      fetchDoctors();
    } catch (err) {
      console.error('Failed to delete doctor:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add Patient directly under doctor
  const handleAddPatientToDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post(`/doctors/${selectedDoctor._id}/patients`, {
        ...patientForm,
        age: Number(patientForm.age),
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
          status: 'Active',
          notes: '',
        });
        // Refresh doctor's patient list
        handleOpenDoctorPatients(selectedDoctor);
        fetchDoctors();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Patient from doctor's list
  const handleDeletePatientFromDoctor = async () => {
    if (!deletePatientTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(
        `/doctors/${deletePatientTarget.doctorId}/patients/${deletePatientTarget.patientId}`
      );
      setDeletePatientTarget(null);
      if (selectedDoctor) {
        handleOpenDoctorPatients(selectedDoctor);
      }
      fetchDoctors();
    } catch (err) {
      console.error('Failed to delete patient from doctor:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSpecialization('All');
    setHospital('All');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <AppLayout
      title="Doctor Management"
      subtitle="Manage medical staff, assign patients, and monitor clinical schedules"
    >
      <div className="space-y-6">
        {/* Controls Header: Search, Filters & Action Button */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Search by name, specialization, hospital, email..."
            />
            <button
              onClick={() => {
                setFormError(null);
                setDoctorForm({
                  name: '',
                  specialization: '',
                  hospital: '',
                  phone: '',
                  email: '',
                  experienceYears: 5,
                  status: 'Active',
                });
                setIsAddDoctorOpen(true);
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          </div>

          {/* Filter Bar: Specialization, Hospital, Date-wise filtering */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Specialization Filter */}
            <select
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Specializations</option>
              {filterOptions.specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* Hospital Filter */}
            <select
              value={hospital}
              onChange={(e) => {
                setHospital(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Hospitals</option>
              {filterOptions.hospitals.map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp}
                </option>
              ))}
            </select>

            {/* Date-wise Filter: Start Date */}
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600">
              <span className="text-[11px] text-slate-400">From:</span>
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
              specialization !== 'All' ||
              hospital !== 'All' ||
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

        {/* Doctors Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={8} cols={6} />
            </div>
          ) : doctors.length === 0 ? (
            <div className="py-16 text-center">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No doctors found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Try adjusting your search criteria, dates, or create a new doctor profile.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Doctor Info</th>
                    <th className="py-3.5 px-4">Specialization</th>
                    <th className="py-3.5 px-4">Hospital</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-center">Patients</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {doctors.map((doctor) => (
                    <tr
                      key={doctor._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                            {doctor.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                              {doctor.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {doctor.experienceYears} yrs experience
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {doctor.specialization}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {doctor.hospital}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {doctor.phone}
                        </p>
                        <p className="flex items-center gap-1 mt-0.5 text-slate-400">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {doctor.email}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenDoctorPatients(doctor)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200/60 text-teal-700 text-xs font-semibold transition"
                          title="View assigned patients"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{doctor.patientCount || 0}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(doctor.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenDoctorPatients(doctor)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="View patients"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(doctor)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit doctor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDoctorId(doctor._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete doctor"
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

      {/* MODAL 1: Create Doctor Modal */}
      <Modal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        title="Add New Doctor"
        subtitle="Register a new physician in the hospital tracking database"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={doctorForm.name}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, name: e.target.value })
              }
              placeholder="e.g. Dr. Catherine Cooper"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                required
                value={doctorForm.specialization}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, specialization: e.target.value })
                }
                placeholder="e.g. Cardiology, Neurology..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Hospital / Clinic *
              </label>
              <input
                type="text"
                required
                value={doctorForm.hospital}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, hospital: e.target.value })
                }
                placeholder="e.g. Johns Hopkins Hospital"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={doctorForm.phone}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={doctorForm.email}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, email: e.target.value })
                }
                placeholder="doctor@hospital.org"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={doctorForm.experienceYears}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    experienceYears: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={doctorForm.status}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddDoctorOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Doctor...' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Doctor Modal */}
      <Modal
        isOpen={isEditDoctorOpen}
        onClose={() => setIsEditDoctorOpen(false)}
        title="Edit Doctor Details"
        subtitle={`Update profile for ${selectedDoctor?.name}`}
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={doctorForm.name}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                required
                value={doctorForm.specialization}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, specialization: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Hospital *
              </label>
              <input
                type="text"
                required
                value={doctorForm.hospital}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, hospital: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={doctorForm.phone}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={doctorForm.email}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={doctorForm.experienceYears}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    experienceYears: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={doctorForm.status}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditDoctorOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving changes...' : 'Update Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Doctor's Corresponding Patients View */}
      <Modal
        isOpen={doctorPatientsModalOpen}
        onClose={() => setDoctorPatientsModalOpen(false)}
        title={selectedDoctor ? `${selectedDoctor.name} – Patient List` : 'Doctor Patients'}
        subtitle={`Specialty: ${selectedDoctor?.specialization} • Hospital: ${selectedDoctor?.hospital}`}
        maxWidth="3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-700">
                Total Assigned Patients: {doctorPatients.length}
              </span>
            </div>
            <button
              onClick={() => {
                setFormError(null);
                setIsAddPatientOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Patient Under This Doctor</span>
            </button>
          </div>

          {loadingPatients ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Loading patient records...
            </div>
          ) : doctorPatients.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                No patients currently assigned
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click &quot;Add Patient Under This Doctor&quot; to assign a new patient.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Age/Gender</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorPatients.map((pat) => (
                    <tr key={pat._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {pat.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {pat.age} yrs • {pat.gender}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-700">
                          {pat.condition}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{pat.phone}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            pat.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : pat.status === 'In Treatment'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {pat.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() =>
                            setDeletePatientTarget({
                              doctorId: selectedDoctor._id,
                              patientId: pat._id,
                              patientName: pat.name,
                            })
                          }
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove patient from doctor list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 4: Sub-Modal to Add Patient Under Current Doctor */}
      <Modal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title="Add Patient Under Doctor"
        subtitle={`Assigning patient to Dr. ${selectedDoctor?.name}`}
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddPatientToDoctor} className="space-y-3.5 text-xs">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Age *</label>
              <input
                type="number"
                required
                min="0"
                max="125"
                value={patientForm.age}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, age: e.target.value })
                }
                placeholder="42"
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
              placeholder="e.g. Hypertension, Cardiac Arrhythmia"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              placeholder="Prescriptions, allergies, or observations..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPatientOpen(false)}
              className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM 1: Delete Doctor Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDoctorId}
        onClose={() => setDeleteDoctorId(null)}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor Record"
        message="Are you sure you want to delete this doctor? All associated patient records under this doctor will be removed or unassigned. This action cannot be undone."
        confirmText="Confirm Delete"
        isLoading={isDeleting}
      />

      {/* CONFIRM 2: Delete Patient From Doctor Dialog */}
      <ConfirmDialog
        isOpen={!!deletePatientTarget}
        onClose={() => setDeletePatientTarget(null)}
        onConfirm={handleDeletePatientFromDoctor}
        title="Remove Patient From Doctor"
        message={`Are you sure you want to remove ${deletePatientTarget?.patientName} from this doctor's patient list?`}
        confirmText="Remove Patient"
        isLoading={isDeleting}
      />
    </AppLayout>
  );
}
