// This file contains JavaScript functionality for the media team website.
// It includes form validation, interactive elements, and dynamic content loading.

document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const artistSlider = document.querySelector('[data-artist-slider]');
        if (artistSlider) {
            const viewport = artistSlider.querySelector('[data-artist-viewport]');
            const track = artistSlider.querySelector('[data-artist-track]');
            const slides = [...artistSlider.querySelectorAll('[data-artist-slide]')];
            const recordStack = document.querySelector('[data-artist-records]');
            const albumDetails = document.querySelector('[data-current-album]');
            const selectedArtist = document.querySelector('[data-selected-artist]');

            const artists = [
                {
                    name: 'Xeny',
                    image: '../assets/Artisti/XENY/Xeny1.jpeg',
                    albums: [
                        { title: 'Glass Garden', year: '2025', tracks: [['Afterglow', '03:42'], ['Slow Motion', '02:58'], ['Paper Moons', '04:06']] },
                        { title: 'Neon Veil', year: '2024', tracks: [['Velvet Static', '03:17'], ['Blue Hours', '03:51'], ['Quiet Fire', '02:46']] }
                    ]
                },
                {
                    name: '3fu',
                    image: '../assets/Artisti/3FU/3fu1.jpeg',
                    albums: [
                        { title: 'Night Signals', year: '2025', tracks: [['No Reply', '02:49'], ['Streetlight', '03:21'], ['Low Battery', '02:37']] },
                        { title: 'Concrete Dreams', year: '2024', tracks: [['Cold Start', '03:14'], ['Sideways', '02:56'], ['Last Train', '03:33']] }
                    ]
                },
                {
                    name: 'Veart',
                    image: '../assets/Artisti/VEART/Veart1.jpeg',
                    albums: [
                        { title: 'Red Horizon', year: '2025', tracks: [['Open Roads', '03:26'], ['Northbound', '04:02'], ['Dust & Gold', '03:18']] },
                        { title: 'Soft Focus', year: '2023', tracks: [['Almost There', '02:57'], ['Warm Lights', '03:40'], ['First Rain', '03:09']] }
                    ]
                },
                {
                    name: 'Adelisha',
                    image: '../assets/Artisti/ADELISHA/Adelisha1.jpeg',
                    albums: [
                        { title: 'Silver Lining', year: '2025', tracks: [['Satellite Heart', '03:38'], ['In Between', '03:04'], ['Stay a While', '04:13']] },
                        { title: 'Soft Geometry', year: '2024', tracks: [['Half Awake', '02:53'], ['Make Believe', '03:31'], ['Slow Burn', '03:46']] }
                    ]
                },
                {
                    name: 'Ciucan',
                    image: '../assets/Artisti/CIUCAN/Ciucan1.jpeg',
                    albums: [
                        { title: 'Silver Lining', year: '2025', tracks: [['Satellite Heart', '03:38'], ['In Between', '03:04'], ['Stay a While', '04:13']] },
                        { title: 'Soft Geometry', year: '2024', tracks: [['Half Awake', '02:53'], ['Make Believe', '03:31'], ['Slow Burn', '03:46']] }
                    ]
                },
                {
                    name: 'Amon',
                    image: '../assets/Artisti/AMON/Amon1.jpeg',
                    albums: [
                        { title: 'After the Echo', year: '2025', tracks: [['Small Hours', '03:27'], ['Fade Out', '03:56'], ['Nothing Personal', '02:59']] },
                        { title: 'The Quiet Machine', year: '2023', tracks: [['Signal Loss', '03:10'], ['Runaway Season', '04:05'], ['Home Again', '03:22']] }
                    ]
                }
            ];

        // REPARARE CLONARE MULTIPLĂ (3 în stânga, 3 în dreapta pentru umplerea ecranului)
        const CLONE_COUNT = 3;
        
        // Adăugăm clone la sfârșit (primele 3 slide-uri)
        for (let i = 0; i < CLONE_COUNT; i++) {
            const clone = slides[i % slides.length].cloneNode(true);
            cleanClone(clone);
            track.append(clone);
        }
        
        // Adăugăm clone la început (ultimele 3 slide-uri)
        for (let i = 0; i < CLONE_COUNT; i++) {
            const index = (slides.length - 1 - i + slides.length) % slides.length;
            const clone = slides[index].cloneNode(true);
            cleanClone(clone);
            track.prepend(clone);
        }

        function cleanClone(clone) {
            clone.classList.remove('is-active');
            clone.removeAttribute('data-artist-slide');
            clone.removeAttribute('data-artist-index');
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('tabindex', '-1');
            clone.setAttribute('aria-pressed', 'false');
            clone.disabled = true;
            // Ne asigurăm că imaginea internă folosește calea corectă din HTML
            const img = clone.querySelector('img');
            if (img && img.getAttribute('src').startsWith('http')) {
                const artistName = clone.querySelector('.artist-slide-caption')?.textContent?.trim()?.toUpperCase() || '';
                if (artistName) {
                    img.src = `../assets/Artisti/${artistName}/${artistName.charAt(0) + artistName.slice(1).toLowerCase()}1.jpeg`;
                }
            }
        }

        const physicalSlides = [...track.children];
        let currentArtistIndex = 0;
        let currentPhysicalIndex = CLONE_COUNT; // Indexul pornește acum de la numărul de clone adăugate
        let currentAlbumIndex = 0;
        let wrapResetPending = false;
        let isArtistTransitioning = false;
        let artistTransitionTimer = 0;
        const queuedArtistMoves = [];

        const createAlbumRecord = (album, artist, index, active) => {
            const record = document.createElement('button');
            record.className = `artist-record ${active ? 'is-active' : 'is-behind'}`;
            record.type = 'button';
            record.setAttribute('aria-pressed', String(active));
            record.setAttribute('aria-label', `${album.title}, ${artist.name}`);
            record.dataset.albumIndex = String(index);

            const image = document.createElement('img');
            image.src = artist.image;
            image.alt = '';
            image.loading = 'lazy';
            const label = document.createElement('span');
            label.className = 'artist-record-label';
            const title = document.createElement('strong');
            title.textContent = album.title;
            const year = document.createElement('small');
            year.textContent = album.year;
            label.append(title, year);
            const hole = document.createElement('span');
            hole.className = 'artist-record-hole';
            record.append(image, label, hole);
            record.addEventListener('click', () => renderAlbum(currentArtistIndex, index));
            return record;
        };

        const renderAlbum = (artistIndex, albumIndex) => {
            const artist = artists[artistIndex];
            currentAlbumIndex = (albumIndex + artist.albums.length) % artist.albums.length;
            const album = artist.albums[currentAlbumIndex];
            recordStack.replaceChildren(...artist.albums.map((item, index) => createAlbumRecord(item, artist, index, index === currentAlbumIndex)));

            const metadata = document.createElement('p');
            metadata.className = 'artist-album-meta';
            const artistName = document.createElement('span');
            artistName.textContent = artist.name;
            const year = document.createElement('span');
            year.textContent = `${album.year} / SAMPLE`;
            metadata.append(artistName, year);

            const title = document.createElement('h4');
            title.className = 'artist-album-title';
            title.textContent = album.title;
            const trackHeading = document.createElement('p');
            trackHeading.className = 'artist-track-heading';
            trackHeading.textContent = document.documentElement.lang === 'ro' ? 'Piese selectate' : 'Track listing';
            const trackList = document.createElement('ol');
            trackList.className = 'artist-track-list';
            album.tracks.forEach(([trackName, duration], trackIndex) => {
                const row = document.createElement('li');
                const number = document.createElement('span');
                number.className = 'artist-track-number';
                number.textContent = String(trackIndex + 1).padStart(2, '0');
                const name = document.createElement('span');
                name.textContent = trackName;
                const length = document.createElement('span');
                length.className = 'artist-track-duration';
                length.textContent = duration;
                row.append(number, name, length);
                trackList.append(row);
            });
            albumDetails.replaceChildren(metadata, title, trackHeading, trackList);
        };

        const centerSlide = (physicalIndex, animate = true) => {
            const slide = physicalSlides[physicalIndex];
            if (!animate || prefersReducedMotion) track.style.transition = 'none';
            const offset = viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);
            track.style.transform = `translate3d(${offset}px, 0, 0)`;
            if (!animate || prefersReducedMotion) {
                track.getBoundingClientRect();
                track.style.removeProperty('transition');
            }
        };

        const selectArtist = (index, physicalIndex = (index + 1), animate = true) => {
            const nextIndex = (index + artists.length) % artists.length;
            const artist = artists[nextIndex];
            slides.forEach((slide, slideIndex) => {
                slide.setAttribute('aria-pressed', String(slideIndex === nextIndex));
            });
            physicalSlides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === physicalIndex));
            currentArtistIndex = nextIndex;
            selectedArtist.textContent = artist.name;
            renderAlbum(nextIndex, 0);
            currentPhysicalIndex = physicalIndex;
            centerSlide(physicalIndex, animate);
            artistSlider.dataset.activeIndex = String(nextIndex);
        };

        const moveArtist = direction => {
            if (isArtistTransitioning) {
                queuedArtistMoves.push(direction);
                return;
            }

            const nextIndex = (currentArtistIndex + direction + artists.length) % artists.length;
            const nextPhysicalIndex = currentPhysicalIndex + direction;
            
            // Verifică dacă am intrat în zona de clone din stânga (sub CLONE_COUNT) sau din dreapta
            wrapResetPending = nextPhysicalIndex < CLONE_COUNT || nextPhysicalIndex >= physicalSlides.length - CLONE_COUNT;
            isArtistTransitioning = !prefersReducedMotion;
            selectArtist(nextIndex, nextPhysicalIndex);
            
            if (isArtistTransitioning) {
                artistTransitionTimer = window.setTimeout(finishArtistTransition, 900);
            }
            if (wrapResetPending && prefersReducedMotion) {
                currentPhysicalIndex = nextPhysicalIndex < CLONE_COUNT ? slides.length + nextPhysicalIndex : nextPhysicalIndex - slides.length;
                centerSlide(currentPhysicalIndex, false);
                wrapResetPending = false;
            }
        };


        const finishArtistTransition = () => {
            if (!isArtistTransitioning) return;
            window.clearTimeout(artistTransitionTimer);
            artistTransitionTimer = 0;
            if (wrapResetPending) {
                // Salt invizibil înapoi în zona centrală
                if (currentPhysicalIndex < CLONE_COUNT) {
                    currentPhysicalIndex = slides.length + currentPhysicalIndex;
                } else if (currentPhysicalIndex >= physicalSlides.length - CLONE_COUNT) {
                    currentPhysicalIndex = currentPhysicalIndex - slides.length;
                }
                wrapResetPending = false;
                physicalSlides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === currentPhysicalIndex));
                centerSlide(currentPhysicalIndex, false);
            }
            isArtistTransitioning = false;
            if (queuedArtistMoves.length) moveArtist(queuedArtistMoves.shift());
        };


        track.addEventListener('transitionend', event => {
            if (event.target !== track || event.propertyName !== 'transform' || !isArtistTransitioning) return;
            finishArtistTransition();
        });

        slides.forEach((slide, index) => slide.addEventListener('click', () => {
            if (isArtistTransitioning || index === currentArtistIndex) return;
            isArtistTransitioning = !prefersReducedMotion;
            selectArtist(index);
        }));
        artistSlider.querySelector('[data-artist-previous]').addEventListener('click', () => moveArtist(-1));
        artistSlider.querySelector('[data-artist-next]').addEventListener('click', () => moveArtist(1));
        document.querySelector('[data-album-next]').addEventListener('click', () => {
            renderAlbum(currentArtistIndex, currentAlbumIndex + 1);
        });
        artistSlider.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                moveArtist(event.key === 'ArrowRight' ? 1 : -1);
            }
        });
        window.addEventListener('resize', () => centerSlide(currentPhysicalIndex, false), { passive: true });

        selectArtist(0, CLONE_COUNT, false);
    }

    const portfolioHeader = document.querySelector('.portfolio-header');
    const portfolioMenuButton = document.querySelector('[data-portfolio-menu-toggle]');
    const portfolioMenu = document.querySelector('[data-portfolio-menu]');
    if (portfolioHeader && portfolioMenuButton && portfolioMenu) {
        let lastScrollY = window.scrollY;
        let navigationFrame = 0;

        const closePortfolioMenu = () => {
            portfolioMenu.classList.remove('active');
            portfolioMenuButton.classList.remove('menu-open');
            portfolioMenuButton.setAttribute('aria-expanded', 'false');
            portfolioMenuButton.setAttribute('aria-label', 'Open menu');
        };

        portfolioMenuButton.addEventListener('click', () => {
            const isOpen = portfolioMenu.classList.toggle('active');
            portfolioMenuButton.classList.toggle('menu-open', isOpen);
            portfolioMenuButton.setAttribute('aria-expanded', String(isOpen));
            portfolioMenuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        });

        portfolioMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closePortfolioMenu);
        });
        portfolioMenu.addEventListener('click', event => {
            if (event.target === portfolioMenu) closePortfolioMenu();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closePortfolioMenu();
        });

        const updatePortfolioNavigation = () => {
            const scrollY = window.scrollY;
            if (scrollY <= 32) {
                portfolioHeader.classList.remove('is-hidden');
                portfolioMenuButton.classList.remove('visible');
                closePortfolioMenu();
            } else if (scrollY > lastScrollY + 2) {
                portfolioHeader.classList.add('is-hidden');
                portfolioMenuButton.classList.add('visible');
            } else if (scrollY < lastScrollY - 2) {
                portfolioHeader.classList.remove('is-hidden');
                portfolioMenuButton.classList.remove('visible');
            }
            lastScrollY = scrollY;
            navigationFrame = 0;
        };

        window.addEventListener('scroll', () => {
            if (!navigationFrame) {
                navigationFrame = window.requestAnimationFrame(updatePortfolioNavigation);
            }
        }, { passive: true });
        updatePortfolioNavigation();
    }

    const portfolioProjects = [...document.querySelectorAll('[data-project]')];
    if (portfolioProjects.length) {
        const progressBar = document.querySelector('.portfolio-progress span');
        let progressFrame = 0;
        let activePlayer;
        let activePoster;

        portfolioProjects.forEach((project, index) => {
            const number = String(index + 1).padStart(2, '0');
            const indexLabel = project.querySelector('.project-index');
            if (indexLabel) {
                indexLabel.innerHTML = `${number} <span>/ ${String(portfolioProjects.length).padStart(2, '0')}</span>`;
            }

            const poster = project.querySelector('.project-poster');
            poster?.addEventListener('click', () => {
                const player = poster.closest('.project-player');
                const videoId = poster.dataset.videoId;
                if (!player || !videoId) return;

                if (activePlayer && activePlayer !== player) {
                    activePlayer.querySelector('iframe')?.remove();
                    activePlayer.append(activePoster);
                }

                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`;
                iframe.title = poster.dataset.videoTitle || 'CINEVRA project film';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                iframe.referrerPolicy = 'strict-origin-when-cross-origin';
                iframe.allowFullscreen = true;

                activePlayer = player;
                activePoster = poster;
                poster.replaceWith(iframe);
            });
        });

        if ('IntersectionObserver' in window) {
            const projectObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('is-visible');
                });
            }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
            portfolioProjects.forEach(project => projectObserver.observe(project));
        } else {
            portfolioProjects.forEach(project => project.classList.add('is-visible'));
        }

        const updateProgress = () => {
            if (progressBar) {
                const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
                progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
            }
            progressFrame = 0;
        };

        window.addEventListener('scroll', () => {
            if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
        }, { passive: true });
        updateProgress();
    }

    document.querySelectorAll('.btn-primary').forEach(button => {
        const particleLayer = button.querySelector('.glow-particles');
        let pointerX = 0;
        let pointerY = 0;
        let particleInterval;

        const updatePointerPosition = event => {
            const bounds = button.getBoundingClientRect();
            pointerX = event.clientX - bounds.left;
            pointerY = event.clientY - bounds.top;
            button.style.setProperty('--glow-x', `${(pointerX / bounds.width) * 100}%`);
            button.style.setProperty('--glow-y', `${(pointerY / bounds.height) * 100}%`);
            button.classList.add('is-pointer-active');
        };

        const emitParticle = () => {
            const bounds = button.getBoundingClientRect();
            const x = pointerX;
            const y = pointerY;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const directionX = Math.cos(angle);
                const directionY = Math.sin(angle);
                const distanceToHorizontalEdge = directionX > 0
                    ? (bounds.width - x) / directionX
                    : x / -directionX;
                const distanceToVerticalEdge = directionY > 0
                    ? (bounds.height - y) / directionY
                    : y / -directionY;
                const distanceToEdge = Math.min(distanceToHorizontalEdge, distanceToVerticalEdge);
                const particleX = x + directionX * (distanceToEdge + 2);
                const particleY = y + directionY * (distanceToEdge + 2);
                const drift = 18 + Math.random() * 24;
                const particle = document.createElement('span');

                particle.className = 'glow-particle';
                particle.style.left = `${particleX}px`;
                particle.style.top = `${particleY}px`;
                particle.style.setProperty('--particle-drift-x', `${directionX * drift}px`);
                particle.style.setProperty('--particle-drift-y', `${directionY * drift}px`);
                particle.style.setProperty('--particle-size', `${2 + Math.random() * 2}px`);
                particleLayer.append(particle);
                particle.addEventListener('animationend', () => particle.remove(), { once: true });
            }

            while (particleLayer.childElementCount > 18) {
                particleLayer.firstElementChild.remove();
            }
        };

        button.addEventListener('pointerenter', event => {
            if (event.pointerType === 'touch' || !particleLayer) return;
            updatePointerPosition(event);
            if (prefersReducedMotion) return;

            emitParticle();
            particleInterval = window.setInterval(emitParticle, 180);
        });

        button.addEventListener('pointermove', event => {
            if (event.pointerType === 'touch' || !particleLayer) return;
            updatePointerPosition(event);
        });

        button.addEventListener('pointerleave', () => {
            window.clearInterval(particleInterval);
            particleInterval = undefined;
            button.classList.remove('is-pointer-active');
            button.style.removeProperty('--glow-x');
            button.style.removeProperty('--glow-y');
        });
    });

    // 1. Inițializare Slider Video (Coverflow)
    if (window.Swiper && document.querySelector('.video-swiper')) {
        new Swiper('.video-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            speed: 800,
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 150,
                modifier: 1,
                slideShadows: false,
            },
            slideToClickedSlide: true,
            navigation: {
                nextEl: '.video-swiper .swiper-button-next',
                prevEl: '.video-swiper .swiper-button-prev',
            },
            observer: true,
            observeParents: true,
        });
    }


    // 2. REPARARE: Inițializare Slider Testimoniale și legarea săgeților unice
    if (window.Swiper && document.querySelector('.testimonial-swiper')) {
        new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            speed: 600,
            allowTouchMove: false,
            navigation: {
                nextEl: '.test-next', // Conectează săgeata dreapta din HTML
                prevEl: '.test-prev', // Conectează săgeata stânga din HTML
            },
            observer: true,
            observeParents: true,
        });
    }

    // Example of form validation for the contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                event.preventDefault();
                alert('Please fill in all fields.');
            } else {
                alert('Thank you for your message!');
            }
        });
    }

    // Example of interactive elements (e.g., portfolio item hover effect)
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseover', function() {
            item.classList.add('hover');
        });
        item.addEventListener('mouseout', function() {
            item.classList.remove('hover');
        });
    });
});