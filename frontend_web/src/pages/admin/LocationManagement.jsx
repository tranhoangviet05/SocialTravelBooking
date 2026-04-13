import React, { useState, useEffect, useMemo } from 'react';
import locationApi from '../../api/locationApi';
import LocationHeader from '../../components/admin/location/LocationHeader';
import LocationTable from '../../components/admin/location/LocationTable';
import LocationModal from '../../components/admin/location/LocationModal';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import AdminLayout from '../../components/admin/AdminLayout';

const LocationManagement = () => {
    const {
        locations,
        isLoadingLocations: isLoading,
        fetchLocations,
        addLocation,
        updateLocation,
        removeLocation
    } = useAdminData();

    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [isPopularActive, setIsPopularActive] = useState(false);

    const toast = useNotification();

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchSearch = searchTerm === '' ||
                loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (loc.parent?.name && loc.parent.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchPopular = !isPopularActive || loc.is_popular;

            return matchSearch && matchPopular;
        });
    }, [locations, searchTerm, isPopularActive]);

    const handleAddClick = () => {
        setEditingLocation(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (location) => {
        setEditingLocation(location);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        setIsSaving(true);
        try {
            let response;
            if (editingLocation) {
                response = await locationApi.update(editingLocation.id, data);
                if (response.success) {
                    toast.success('Cập nhật địa điểm thành công!');
                    updateLocation(response.data);
                }
            } else {
                response = await locationApi.create(data);
                if (response.success) {
                    toast.success('Thêm địa điểm mới thành công!');
                    addLocation(response.data);
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save location error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu.';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) return;

        try {
            const response = await locationApi.delete(id);
            if (response.success) {
                toast.success('Xóa địa điểm thành công!');
                removeLocation(id);
            }
        } catch (error) {
            console.error('Delete location error:', error);
            const msg = error.response?.data?.message || 'Không thể xóa địa điểm.';
            toast.error(msg);
        }
    };

    // Derived stats
    const popularCount = locations.filter(l => l.is_popular).length;

    return (
        <AdminLayout>
            <LocationHeader
                total={locations.length}
                popularCount={popularCount}
                onAddClick={handleAddClick}
                onReload={() => fetchLocations(true)} // Ép buộc gọi API lại nếu người dùng ấn Làm mới
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isPopularActive={isPopularActive}
                onPopularToggle={() => setIsPopularActive(!isPopularActive)}
            />

            <LocationTable
                locations={filteredLocations}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                isLoading={isLoading}
            />

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                location={editingLocation}
                locations={locations}
                isLoading={isSaving}
            />
        </AdminLayout>
    );
};

export default LocationManagement;
