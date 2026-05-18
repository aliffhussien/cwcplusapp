import React, { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';

const MediaUploader = ({ value, onChange, label = "Select Media Asset", contentId, contentType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-black uppercase text-slate-500 ml-2">{label}</label>
      <div className="flex gap-4 items-center">
        {value && (
          <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900">
            {typeof value === 'string' && value.includes('.mp4') ? (
              <video src={value} className="w-full h-full object-cover" />
            ) : (
              <img 
                src={typeof value === 'string' ? value : value?.thumb_url || value?.hero_url} 
                loading="lazy" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
        )}
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            value={typeof value === 'string' ? value : value?.filename || ''}
            className="w-full bg-slate-950 border-2 border-slate-800 rounded-full px-6 py-4 text-sm md:text-lg font-bold outline-none text-white pr-[160px] cursor-pointer"
            onClick={() => setIsModalOpen(true)}
            placeholder="Click to select from Library ->"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(true)} 
              className="cursor-pointer bg-accent-dim hover:bg-accent text-white text-xs font-black uppercase px-4 py-3 rounded-full transition-colors inline-block shadow-lg whitespace-nowrap"
            >
              Open Library
            </button>
          </div>
        </div>
      </div>
      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentId={contentId}
        contentType={contentType}
        onSelect={(mediaObj) => {
          onChange(mediaObj); // Pass full media object to be saved as cover_image_id
        }}
      />
    </div>
  );
};

export default MediaUploader;
