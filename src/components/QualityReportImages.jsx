import React, { useState } from 'react';
import "../styles/components/QualityReportImage.scss";

const QualityReportImage = ({ images }) => {
    const [showGallery, setShowGallery] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleImageClick = () => {
        setShowGallery(true);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0? images.length - 1: prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === images.length - 1? 0: prevIndex + 1
        );
    };

    const closeGallery = () => {
        setShowGallery(false);
    }

    return (
        <div>
            {images && images.length > 0? (
                <div className="quality-report-image-container">
                    <img
                        src={images}
                        alt="Quality Report"
                        style={{ maxWidth: '100px', cursor: 'pointer' }}
                        onClick={handleImageClick}
                    />

                    {showGallery && (
                        <div className="image-gallery-overlay" onClick={closeGallery}>
                            <div className="image-gallery-content" onClick={e => e.stopPropagation()}>
                                <button className="gallery-close-button" onClick={closeGallery}>
                                    X
                                </button>
                                <img
                                    src={images[currentImageIndex]}
                                    alt="Quality Report"
                                    className="gallery-image"
                                />
                                <div className="gallery-controls">
                                    <button onClick={handlePrev} className="gallery-arrow">
                                        {'<'} {/* Left arrow */}
                                    </button>
                                    <p> {currentImageIndex + 1} / {images.length}</p>
                                    <button onClick={handleNext} className="gallery-arrow">
                                        {'>'} {/* Right arrow */}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ): (
                "No images"
            )}
        </div>
    );
};

export default QualityReportImage;