document.addEventListener('DOMContentLoaded', async function() {
    const slideshow = document.querySelector('.slideshow');
    
    if (!slideshow) return;
    
    try {
        // Fetch slider data from JSON file
        const response = await fetch('/static/data/sliderData.json');
        const sliderData = await response.json();
        
        if (!sliderData || sliderData.length === 0) {
            slideshow.innerHTML = '<p class="text-center p-4">No slider images available</p>';
            return;
        }
        
        // Clear loading placeholder
        slideshow.innerHTML = '';
        
        // Create slides
        sliderData.forEach((slide, index) => {
            const img = document.createElement('img');
            img.src = slide.imageUrl;
            img.alt = slide.altText || `Slideshow Image ${index + 1}`;
            img.className = 'w-full h-auto rounded-lg shadow-lg';
            
            // For all slides except the first, add positioning and opacity classes
            if (index > 0) {
                img.classList.add('absolute', 'top-0', 'left-0', 'opacity-0', 'transition-opacity', 'duration-500', 'ease-in-out');
            }
            
            slideshow.appendChild(img);
        });
        
        // Start the slideshow
        const slides = slideshow.children;
        let currentIndex = 0;
        
        // Add active class to first slide
        if (slides.length > 0) {
            slides[0].classList.add('active');
        }
        
        function showNextImage() {
            slides[currentIndex].classList.remove('active');
            slides[currentIndex].classList.add('opacity-0');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
            slides[currentIndex].classList.remove('opacity-0');
            setTimeout(showNextImage, 5000); // Change slide every 5 seconds
        }
        
        if (slides.length > 1) {
            setTimeout(showNextImage, 5000);
        }
        
    } catch (error) {
        console.error('Error loading slider data:', error);
        slideshow.innerHTML = '<p class="text-center p-4 text-red-500">Error loading slider</p>';
    }
});
