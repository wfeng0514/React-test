import React, { useState } from 'react';
import './index.css';

// 默认的图片列表
const images = ['https://via.placeholder.com/600x400?text=Image+1', 'https://via.placeholder.com/600x400?text=Image+2', 'https://via.placeholder.com/600x400?text=Image+3'];
const ImageViewer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  // 打开 Modal 查看图片
  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // 关闭 Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImageIndex(null);
  };

  // 切换到前一张图片
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  // 切换到后一张图片
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div>
      {/* 缩略图展示 */}
      <div className="thumbnail-gallery">
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Thumbnail ${index}`} className="thumbnail" onClick={() => openModal(index)} />
        ))}
      </div>

      {/* 图片 Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="closeBtn">
              <div onClick={closeModal}>&times;</div>
            </div>
            <button className="prev" onClick={prevImage}>
              ❮
            </button>
            <img src={images[currentImageIndex]} alt={`Full size ${currentImageIndex}`} className="full-image" />
            <button className="next" onClick={nextImage}>
              ❯
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
