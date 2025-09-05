// Galeria Modal JavaScript
class GalleryModal {
    constructor() {
        this.modal = document.getElementById('gallery-modal');
        this.modalImage = document.getElementById('modal-image');
        this.modalVideo = document.getElementById('modal-video');
        this.modalThumbnails = document.getElementById('modal-thumbnails');
        this.closeBtn = document.querySelector('.modal-close');
        this.prevBtn = document.getElementById('modal-prev');
        this.nextBtn = document.getElementById('modal-next');
        
        this.currentIndex = 0;
        this.mediaItems = [];
        this.isVideo = false;
        
        this.init();
    }
    
    async init() {
        await this.collectMediaItems();
        this.setupEventListeners();
        this.createThumbnails();
        
    }
    
    async collectMediaItems() {
        // Coletar todas as imagens e vídeos da galeria
        const galleryItems = document.querySelectorAll('.gallery-item[data-type="image"]');
        const videoItems = document.querySelectorAll('.video-item[data-type="video"]');
        
        // Adicionar imagens
        galleryItems.forEach(item => {
            this.mediaItems.push({
                type: 'image',
                src: item.dataset.src,
                thumbnail: item.querySelector('img').src
            });
        });
        
        // Adicionar vídeos com thumbnails assíncronos
        for (const item of videoItems) {
            const thumbnail = await this.createVideoThumbnail(item);
            this.mediaItems.push({
                type: 'video',
                src: item.dataset.src,
                thumbnail: thumbnail
            });
        }
    }
    
    createVideoThumbnail(videoItem) {
        // Criar thumbnail do vídeo usando o poster ou primeiro frame
        const video = videoItem.querySelector('video');
        
        // Se o vídeo tem poster, usar ele
        if (video.poster) {
            return Promise.resolve(video.poster);
        }
        
        // Tentar capturar o primeiro frame do vídeo
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 60;
            canvas.height = 60;
            
            // Placeholder SVG para vídeo
            const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAxNUw0MCAzMEwyMCA0NVYxNVoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
            
            const tryCapture = () => {
                try {
                    ctx.drawImage(video, 0, 0, 60, 60);
                    const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(thumbnail);
                } catch (e) {
                    resolve(placeholder);
                }
            };
            
            // Se o vídeo já carregou
            if (video.readyState >= 2) {
                tryCapture();
            } else {
                video.addEventListener('loadeddata', tryCapture, { once: true });
                video.addEventListener('error', () => resolve(placeholder), { once: true });
                
                // Timeout de segurança
                setTimeout(() => resolve(placeholder), 3000);
            }
        });
    }
    
    setupEventListeners() {
        // Event listeners para abrir modal
        const galleryItems = document.querySelectorAll('.gallery-item, .video-item');
        
        galleryItems.forEach((item, index) => {
            // Remover listeners existentes para evitar duplicação
            item.removeEventListener('click', this.handleItemClick);
            
            // Adicionar novo listener
            this.handleItemClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal(index);
            };
            
            item.addEventListener('click', this.handleItemClick);
            
            // Adicionar também touch events para mobile
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal(index);
            });
        });
        
        // Event listeners para fechar modal
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Event listeners para navegação
        this.prevBtn.addEventListener('click', () => this.previousItem());
        this.nextBtn.addEventListener('click', () => this.nextItem());
        
        // Event listeners para teclado
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeModal();
                        break;
                    case 'ArrowLeft':
                        this.previousItem();
                        break;
                    case 'ArrowRight':
                        this.nextItem();
                        break;
                }
            }
        });
        
        // Event listeners para touch (mobile)
        let startX = 0;
        let startY = 0;
        
        this.modal.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.modal.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Swipe horizontal
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextItem(); // Swipe left = next
                } else {
                    this.previousItem(); // Swipe right = previous
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    createThumbnails() {
        this.modalThumbnails.innerHTML = '';
        
        this.mediaItems.forEach((item, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = item.thumbnail;
            thumbnail.className = 'modal-thumbnail';
            thumbnail.addEventListener('click', () => this.openModal(index));
            
            this.modalThumbnails.appendChild(thumbnail);
        });
    }
    
    openModal(index) {
        this.currentIndex = index;
        this.showMedia();
        this.updateThumbnails();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll do body
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Pausar vídeo se estiver tocando
        if (this.isVideo) {
            this.modalVideo.pause();
        }
    }
    
    showMedia() {
        const item = this.mediaItems[this.currentIndex];
        
        if (item.type === 'image') {
            // Esconder vídeo
            this.modalVideo.style.display = 'none';
            this.modalVideo.pause();
            
            // Mostrar imagem
            this.modalImage.style.display = 'block';
            this.modalImage.style.visibility = 'visible';
            this.modalImage.src = item.src;
            
            this.isVideo = false;
        } else {
            // Esconder imagem
            this.modalImage.style.display = 'none';
            
            // Mostrar vídeo
            this.modalVideo.style.display = 'block';
            this.modalVideo.style.visibility = 'visible';
            
            // Carregar vídeo
            const source = this.modalVideo.querySelector('source');
            source.src = item.src;
            this.modalVideo.load();
            
            this.isVideo = true;
        }
    }
    
    updateThumbnails() {
        document.querySelectorAll('.modal-thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    previousItem() {
        this.currentIndex = (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
        this.showMedia();
        this.updateThumbnails();
    }
    
    nextItem() {
        this.currentIndex = (this.currentIndex + 1) % this.mediaItems.length;
        this.showMedia();
        this.updateThumbnails();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        new GalleryModal();
    }, 100);
});

// Fallback para garantir que funcione mesmo se o DOMContentLoaded já tiver passado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            new GalleryModal();
        }, 100);
    });
} else {
    // DOM já carregado
    setTimeout(() => {
        new GalleryModal();
    }, 100);
}
