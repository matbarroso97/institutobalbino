// Galeria Modal JavaScript - Versão Mobile Otimizada
class GalleryModalMobile {
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
        this.isInitialized = false;
        
        // Proteção contra extensões
        this.setupErrorHandling();
        this.init();
    }
    
    setupErrorHandling() {
        // Capturar erros globais para evitar conflitos com extensões
        window.addEventListener('error', (e) => {
            if (e.message && (
                e.message.includes('adjustDimensions') ||
                e.message.includes('calcXPos is not a function') ||
                e.message.includes('distanceMeter') ||
                e.message.includes('Runner')
            )) {
                console.log('Extension error caught and ignored:', e.message);
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
        
        // Proteger contra resize events de extensões
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.isInitialized && this.modal && this.modal.classList.contains('active')) {
                    this.adjustModalSize();
                }
            }, 100);
        });
        
        // Proteger contra erros de extensões específicas
        this.protectFromExtensions();
    }
    
    protectFromExtensions() {
        // Proteger contra extensões que modificam objetos globais
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('calcXPos is not a function') || 
                message.includes('distanceMeter') ||
                message.includes('Runner')) {
                console.log('Extension error filtered:', message);
                return;
            }
            originalConsoleError.apply(console, args);
        };
        
        // Proteger contra modificações de window
        const originalAddEventListener = window.addEventListener;
        window.addEventListener = (type, listener, options) => {
            if (type === 'resize' && listener.toString().includes('adjustDimensions')) {
                console.log('Extension resize listener blocked');
                return;
            }
            return originalAddEventListener.call(window, type, listener, options);
        };
    }
    
    adjustModalSize() {
        try {
            if (!this.modal || !this.modal.classList.contains('active')) return;
            
            // Ajustar tamanho do modal se necessário
            const modalContent = this.modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.maxHeight = '90vh';
                modalContent.style.maxWidth = '90vw';
            }
        } catch (error) {
            console.log('Modal resize adjustment skipped:', error.message);
        }
    }
    
    // Proteção adicional contra extensões
    createSafeModal() {
        // Criar um modal isolado que não pode ser afetado por extensões
        if (this.modal) {
            // Adicionar atributos de proteção
            this.modal.setAttribute('data-protected', 'true');
            this.modal.setAttribute('data-extension-safe', 'true');
            
            // Proteger o modal contra modificações externas
            Object.freeze(this.modal.style);
            
            // Adicionar observer para detectar modificações indesejadas
            if (window.MutationObserver) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && 
                            mutation.attributeName === 'style' && 
                            !mutation.target.hasAttribute('data-protected')) {
                            console.log('Unauthorized style modification detected and reverted');
                            // Reverter modificações não autorizadas
                            this.resetModalStyles();
                        }
                    });
                });
                
                observer.observe(this.modal, {
                    attributes: true,
                    attributeFilter: ['style']
                });
            }
        }
    }
    
    resetModalStyles() {
        if (this.modal) {
            // Restaurar estilos originais do modal
            this.modal.style.position = 'fixed';
            this.modal.style.top = '0';
            this.modal.style.left = '0';
            this.modal.style.width = '100vw';
            this.modal.style.height = '100vh';
            this.modal.style.zIndex = '99999';
        }
    }
    
    init() {
        this.collectMediaItems();
        this.setupEventListeners();
        this.createThumbnails();
        this.createSafeModal();
        this.isInitialized = true;
    }
    
    collectMediaItems() {
        // Coletar todas as imagens e vídeos da galeria
        const galleryItems = document.querySelectorAll('.gallery-item[data-type="image"]');
        const videoItems = document.querySelectorAll('.video-item[data-type="video"]');
        
        // Adicionar imagens - usar os caminhos originais
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            
            this.mediaItems.push({
                type: 'image',
                src: item.dataset.src, // Manter caminho original
                thumbnail: img.src // Manter caminho original
            });
        });
        
        // Adicionar vídeos - usar os caminhos originais
        videoItems.forEach(item => {
            const video = item.querySelector('video');
            
            this.mediaItems.push({
                type: 'video',
                src: item.dataset.src, // Manter caminho original
                thumbnail: video.src || video.poster // Manter caminho original
            });
        });
    }
    
    
    setupEventListeners() {
        // Event listeners para abrir modal
        const galleryItems = document.querySelectorAll('.gallery-item, .video-item');
        
        galleryItems.forEach((item, index) => {
            // Click event
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal(index);
            });
            
            // Touch event para mobile
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal(index);
            });
        });
        
        // Event listeners para fechar modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Event listeners para navegação
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousItem());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextItem());
        }
        
        // Event listeners para teclado
        document.addEventListener('keydown', (e) => {
            if (this.modal && this.modal.classList.contains('active')) {
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
    }
    
    createThumbnails() {
        if (!this.modalThumbnails) return;
        
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
        try {
            if (index < 0 || index >= this.mediaItems.length) return;
            
            this.currentIndex = index;
            this.showMedia();
            this.updateThumbnails();
            
            if (this.modal) {
                this.modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.log('Modal open error handled:', error.message);
        }
    }
    
    closeModal() {
        try {
            if (this.modal) {
                this.modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            // Pausar vídeo se estiver tocando
            if (this.isVideo && this.modalVideo) {
                this.modalVideo.pause();
            }
        } catch (error) {
            console.log('Modal close error handled:', error.message);
        }
    }
    
    showMedia() {
        if (!this.mediaItems[this.currentIndex]) return;
        
        const item = this.mediaItems[this.currentIndex];
        console.log('Loading media:', item);
        
        if (item.type === 'image') {
            // Esconder vídeo
            if (this.modalVideo) {
                this.modalVideo.style.display = 'none';
                this.modalVideo.pause();
            }
            
            // Mostrar imagem
            if (this.modalImage) {
                this.modalImage.style.display = 'block';
                console.log('Setting image src to:', item.src);
                
                // Tentar diferentes caminhos para carregar a imagem
                this.loadImageWithMultiplePaths(item.src);
            }
            
            this.isVideo = false;
        } else {
            // Esconder imagem
            if (this.modalImage) {
                this.modalImage.style.display = 'none';
            }
            
            // Mostrar vídeo
            if (this.modalVideo) {
                this.modalVideo.style.display = 'block';
                const source = this.modalVideo.querySelector('source');
                if (source) {
                    console.log('Setting video src to:', item.src);
                    source.src = item.src;
                    this.modalVideo.load();
                }
            }
            
            this.isVideo = true;
        }
    }
    
    loadImageWithMultiplePaths(originalSrc) {
        // Extrair apenas o nome do arquivo
        const fileName = originalSrc.split('/').pop();
        
        // Detectar se é Chrome e ajustar estratégia
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isLocalFile = window.location.protocol === 'file:';
        const isLocalServer = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        
        // Debug info removed for production
        
        // Para Chrome, usar estratégia específica
        if (isChrome) {
            this.loadImageForChrome(originalSrc, fileName);
        } else {
            // Para outros navegadores
            const paths = [
                originalSrc, // Caminho original: ../assets/images/foto13.jfif
                `assets/images/${fileName}`, // assets/images/foto13.jfif
                `./assets/images/${fileName}`, // ./assets/images/foto13.jfif
                `../assets/images/${fileName}`, // ../assets/images/foto13.jfif
            ];
            
            this.tryImagePaths(paths, 0);
        }
    }
    
    loadImageForChrome(originalSrc, fileName) {
        // Para Chrome, tentar usar o elemento img original da galeria primeiro
        const galleryItem = document.querySelector(`[data-src="${originalSrc}"]`);
        if (galleryItem) {
            const originalImg = galleryItem.querySelector('img');
            if (originalImg && originalImg.src) {
                this.modalImage.src = originalImg.src;
                return;
            }
        }
        
        // Se não encontrar, tentar usar canvas para converter a imagem
        this.tryImageWithCanvas(originalSrc, fileName);
    }
    
    tryImageWithCanvas(originalSrc, fileName) {
        // Tentar usar canvas para contornar restrições do Chrome
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Criar uma nova imagem
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Permitir CORS
        
        img.onload = () => {
            try {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Converter canvas para data URL
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                console.log('Image loaded with canvas for Chrome:', dataURL.substring(0, 50) + '...');
                this.modalImage.src = dataURL;
            } catch (error) {
                console.error('Canvas conversion failed:', error);
                this.tryChromeFallbackPaths(fileName);
            }
        };
        
        img.onerror = () => {
            console.error('Image load failed for canvas:', originalSrc);
            this.tryChromeFallbackPaths(fileName);
        };
        
        // Tentar diferentes caminhos para a imagem
        const paths = [
            originalSrc,
            `../assets/images/${fileName}`,
            `assets/images/${fileName}`,
            `./assets/images/${fileName}`,
        ];
        
        this.tryImageForCanvas(img, paths, 0);
    }
    
    tryImageForCanvas(img, paths, index) {
        if (index >= paths.length) {
            console.error('All canvas paths failed');
            this.tryChromeFallbackPaths(paths[0].split('/').pop());
            return;
        }
        
        const currentPath = paths[index];
        console.log(`Trying canvas path ${index + 1}/${paths.length}:`, currentPath);
        
        img.src = currentPath;
    }
    
    tryChromeFallbackPaths(fileName) {
        // Fallback final para Chrome
        const paths = [
            `../assets/images/${fileName}`,
            `assets/images/${fileName}`,
            `./assets/images/${fileName}`,
        ];
        
        this.tryImagePaths(paths, 0);
    }
    
    tryImagePaths(paths, index) {
        if (index >= paths.length) {
            console.error('All image paths failed, showing placeholder');
            this.modalImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPkVycm8gYW8gY2FycmVnYXIgaW1hZ2VtPC90ZXh0Pgo8L3N2Zz4=';
            return;
        }
        
        const currentPath = paths[index];
        
        const img = new Image();
        img.onload = () => {
            this.modalImage.src = currentPath;
        };
        img.onerror = () => {
            this.tryImagePaths(paths, index + 1);
        };
        img.src = currentPath;
    }
    
    
    updateThumbnails() {
        if (!this.modalThumbnails) return;
        
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
    new GalleryModalMobile();
});

// Fallback para garantir que funcione
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new GalleryModalMobile();
    });
} else {
    new GalleryModalMobile();
}
