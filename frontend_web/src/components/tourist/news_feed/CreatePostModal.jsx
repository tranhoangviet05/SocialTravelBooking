import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Smile, MapPin, Hash, ChevronDown, Globe, Plus, ChevronRight, ArrowRight } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useAdminData } from '../../../contexts/AdminDataContext';


const CreatePostModal = ({ isOpen, onClose }) => {
    const { locations, fetchLocations } = useAdminData();
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [showLocationList, setShowLocationList] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showHashtagInput, setShowHashtagInput] = useState(false);
    const [hashtagValue, setHashtagValue] = useState('');
    const [hashtags, setHashtags] = useState([]);

    const modalRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setMediaFiles([]);
            setSelectedLocation(null);
            setHashtags([]);
            setContent('');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (showLocationList.current && !showLocationList.current.contains(event.target)) {
                setShowLocationList(false);
            }
        };

        if (showEmojiPicker || showLocationList) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, showLocationList]);

    const handleLocationToggle = () => {
        if (!showLocationList) {
            fetchLocations();
        }
        setShowLocationList(!showLocationList);
    };

    if (!isOpen) return null;

    const handleMediaClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video'
        }));
        setMediaFiles(prev => [...prev, ...newFiles]);
    };
    const removeMedia = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const addHashtag = () => {
        if (hashtagValue.trim()) {
            const cleanHash = hashtagValue.trim().replace(/^#/, '');
            if (!hashtags.includes(cleanHash)) {
                setHashtags(prev => [...prev, cleanHash]);
            }
            setHashtagValue('');
        }
    };

    const onEmojiClick = (emojiData) => {
        setContent(prev => prev + emojiData.emoji);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                className="bg-white w-full max-w-[600px] rounded-3xl shadow-2xl relative flex flex-col animate-in fade-in zoom-in duration-200"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <button
                        onClick={onClose}
                        className="text-[15px] font-medium text-gray-500 hover:text-black transition-colors"
                    >
                        Hủy
                    </button>
                    <h2 className="text-[16px] font-bold">News Feed</h2>
                    <button
                        disabled={!content.trim() && mediaFiles.length === 0}
                        className={`px-5 py-1.5 rounded-full font-bold text-sm transition-all ${(content.trim() || mediaFiles.length > 0)
                            ? 'bg-black text-white hover:scale-105 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Đăng
                    </button>
                </div>

                <div className="p-6 flex gap-4 max-h-[70vh] overflow-y-visible">
                    <div className="flex flex-col items-center">
                        <img
                            src="https://i.pravatar.cc/150?u=myprofile"
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                        <div className="w-[2px] flex-grow bg-gray-100 mt-2 rounded-full" />
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-[15px]">tzitttt.2909</span>

                            {/* Hashtag / Topic Input Section - Moved to top */}
                            {showHashtagInput && (
                                <div className="flex items-center gap-1 text-gray-400 animate-in slide-in-from-left-1 duration-200">
                                    <ChevronDown size={14} className="-rotate-90" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Chủ đề..."
                                        value={hashtagValue}
                                        onChange={(e) => setHashtagValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                                        className="bg-transparent border-none outline-none text-[15px] font-medium text-sky-500 w-24 p-0 placeholder:text-gray-300"
                                    />
                                </div>
                            )}

                            {selectedLocation && (
                                <div className="flex items-center gap-1 text-[12px] text-sky-500 font-medium bg-sky-50 px-2 py-0.5 rounded-full ml-auto">
                                    <MapPin size={12} />
                                    <span>{selectedLocation.name}</span>
                                    <X size={10} className="cursor-pointer" onClick={() => setSelectedLocation(null)} />
                                </div>
                            )}
                        </div>

                        <textarea
                            autoFocus
                            placeholder="Có gì mới?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full min-h-[100px] text-[15px] outline-none border-none focus:ring-0 p-0 placeholder:text-gray-400 bg-transparent resize-none leading-relaxed"
                        />

                        {/* Media Preview Area - Fixed width constraint to prevent pushing avatar */}
                        {mediaFiles.length > 0 && (
                            <div className="w-full max-w-[480px] overflow-hidden">
                                <div className="flex gap-2 overflow-x-auto py-2 pb-4">
                                    {mediaFiles.map((media, index) => (
                                        <div key={index} className="relative flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
                                            {media.type === 'image' ? (
                                                <img src={media.url} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <video src={media.url} className="w-full h-full object-cover" />
                                            )}
                                            <button
                                                onClick={() => removeMedia(index)}
                                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleMediaClick}
                                        className="w-24 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all flex-shrink-0"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>
                        )}


                        {hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {hashtags.map((tag, idx) => (
                                    <span key={idx} className="text-[13px] text-sky-600 font-medium bg-sky-50 px-3 py-1 rounded-lg flex items-center gap-1">
                                        #{tag}
                                        <X size={12} className="cursor-pointer" onClick={() => setHashtags(prev => prev.filter((_, i) => i !== idx))} />
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-4 text-gray-400 relative">
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />

                            <button onClick={handleMediaClick} className="hover:text-black transition-colors"><Image size={20} /></button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`transition-colors ${showEmojiPicker ? 'text-sky-500' : 'hover:text-black'}`}
                                >
                                    <Smile size={20} />
                                </button>
                                {showEmojiPicker && (
                                    <div ref={emojiPickerRef} className="absolute bottom-10 left-0 z-[120] shadow-2xl rounded-2xl overflow-hidden">
                                        <EmojiPicker onEmojiClick={onEmojiClick} theme="light" width={320} height={400} />
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={handleLocationToggle}
                                    className={`transition-colors ${showLocationList ? 'text-sky-500' : 'hover:text-black'}`}
                                >
                                    <MapPin size={20} />
                                </button>
                                {showLocationList && (
                                    <div className="absolute bottom-10 left-0 w-64 bg-white shadow-2xl rounded-2xl p-2 border border-gray-100 z-[120] animate-in slide-in-from-bottom-2 duration-200">
                                        <h3 className="text-[13px] font-bold px-3 py-2 border-b border-gray-50 mb-1">Gắn vị trí</h3>
                                        <div className="max-h-48 overflow-y-auto">
                                            {locations.length > 0 ? (
                                                locations.map(loc => (
                                                    <div
                                                        key={loc.id}
                                                        onClick={() => { setSelectedLocation(loc); setShowLocationList(false); }}
                                                        className="px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer text-sm flex items-center gap-2"
                                                    >
                                                        <MapPin size={14} className="text-gray-400" />
                                                        <span className="truncate">{loc.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-400 text-xs italic">Đang tải dữ liệu...</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Topic Toggle */}
                            <button
                                onClick={() => {
                                    setShowHashtagInput(!showHashtagInput);
                                    if (showHashtagInput) setHashtagValue('');
                                }}
                                className={`transition-colors ${showHashtagInput ? 'text-sky-500' : 'hover:text-black'}`}
                            >
                                <Hash size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/5 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-black transition-colors font-medium">
                        <Globe size={16} />
                        <span>Bất kỳ ai cũng có thể trả lời</span>
                        <ChevronDown size={14} />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-300 font-medium">Auto-delete 24h</span>
                        <div className="w-8 h-4 bg-gray-200 rounded-full cursor-pointer relative">
                            <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal;
