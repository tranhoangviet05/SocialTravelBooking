import React, { useState, useEffect, useMemo } from 'react';
import categoryApi from '../../api/categoryApi';
import CategoryHeader from '../../components/admin/category/CategoryHeader';
import CategoryTable from '../../components/admin/category/CategoryTable';
import CategoryModal from '../../components/admin/category/CategoryModal';
import { useNotification } from '../../contexts/NotificationContext';
import AdminLayout from '../../components/admin/AdminLayout';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    const toast = useNotification();

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await categoryApi.getAll();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
            toast.error('Không thể tải danh sách danh mục.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Logic lọc dữ liệu
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleAddClick = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        setIsSaving(true);
        try {
            let response;
            if (editingCategory) {
                response = await categoryApi.update(editingCategory.id, data);
                if (response.success) {
                    toast.success('Cập nhật danh mục thành công!');
                    setCategories(prev => prev.map(cat => 
                        cat.id === response.data.id ? response.data : cat
                    ));
                }
            } else {
                response = await categoryApi.create(data);
                if (response.success) {
                    toast.success('Thêm danh mục mới thành công!');
                    setCategories(prev => [...prev, response.data]);
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save category error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu.';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

        try {
            const response = await categoryApi.delete(id);
            if (response.success) {
                toast.success('Xóa danh mục thành công!');
                setCategories(prev => prev.filter(cat => cat.id !== id));
            }
        } catch (error) {
            console.error('Delete category error:', error);
            const msg = error.response?.data?.message || 'Không thể xóa danh mục.';
            toast.error(msg);
        }
    };

    return (
        <AdminLayout>
            <CategoryHeader
                total={categories.length}
                onAddClick={handleAddClick}
                onReload={fetchCategories}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <CategoryTable
                categories={filteredCategories}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                isLoading={isLoading}
            />

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                category={editingCategory}
                isLoading={isSaving}
            />
        </AdminLayout>
    );
};

export default CategoryManagement;
