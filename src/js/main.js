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
            const albumNextButton = document.querySelector('[data-album-next]');
            const selectedArtist = document.querySelector('[data-selected-artist]');

            const artists = [
                {
                    name: 'Xeny',
                    image: '../assets/Artisti/XENY/Xeny1.jpeg',
                    albums: [
                        {
                            title: 'Altstar',
                            year: 'EP',
                            tracks: [
                                ['Intro', '', 'A5rWPxmroO4'],
                                ['Nopti la rand', '', 'l8YXOF53gTw'],
                                ['Flori ft. Amon', '', 'GsbOJzByv2k'],
                                ['Oglinda', '', 'sbH_dp9IDgw'],
                                ['Mixed Feelings', '', 'JMN0LjLq4Lw'],
                                ['Pleci ft. Adelisha', '', 'SNlC-D5N-bk']
                            ]
                        },
                        {
                            title: 'Singles',
                            year: '2026',
                            tracks: [
                                ['Day Drinker', '', 'xmODZbCyUWI'],
                                ['Toxici', '', 'bGT7dLrykdY'],
                                ['Slo-mo', '', 'rmLTzC-1YE8'],
                                ['Fine', '', 'W0GMlgkVdZI'],
                                ['Alo', '', 'P5TtoLSlWks'],
                                ['fvck that', '', 'fShDo9OkxHM']
                            ]
                        }
                    ]
                },
                {
                    name: '3fu',
                    image: '../assets/Artisti/3FU/3fu1.jpeg',
                    albums: [
                        {
                            title: 'Singles',
                            year: '',
                            tracks: [
                                ['4 Dimineata', '', 'PfVNHEj9M1Q'],
                                ['Alte petreceri', '', 'jBdpgLKsCqo'],
                                ['Tabu', '', 'ETcujhQuaMc']
                            ]
                        }
                    ]
                },
                {
                    name: 'Veart',
                    image: '../assets/Artisti/VEART/Veart1.jpeg',
                    albums: [
                        {
                            title: 'Singles',
                            year: '',
                            tracks: [
                                ['Nu vreau sa te vad', '', 'NsqYYCIKkn0'],
                                ['Valuri', '', 'sx-ANJdbLYM'],
                                ['Slo-mo', '', 'rmLTzC-1YE8'],
                                ['Alo', '', 'P5TtoLSlWks'],
                                ['Fvck that', '', 'fShDo9OkxHM']
                            ]
                        }
                    ]
                },
                {
                    name: 'Adelisha',
                    image: '../assets/Artisti/ADELISHA/Adelisha1.jpeg',
                    albums: [
                        { title: 'Singles', year: '', tracks: [['Pleci', '', 'SNlC-D5N-bk']] }
                    ]
                },
                {
                    name: 'Ciucan',
                    image: '../assets/Artisti/CIUCAN/Ciucan1.jpeg',
                    albums: [
                        {
                            title: 'Singles',
                            year: '',
                            tracks: [
                                ['Tabu', '', 'ETcujhQuaMc'],
                                ['Terorista', '', 'n3x9rDurYNc']
                            ]
                        }
                    ]
                },
                {
                    name: 'Amon',
                    image: '../assets/Artisti/AMON/Amon1.jpeg',
                    albums: [
                        { title: 'Singles', year: '', tracks: [['Flori', '', 'GsbOJzByv2k']] }
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

            // Extragem numele artistului din elementul de caption text
            const artistName = clone.querySelector('.artist-slide-caption')?.textContent?.trim() || '';
            const artistNameUpper = artistName.toUpperCase();

            // 1. Actualizăm textul masiv de fundal (Typography Stroke)
            const typographyStroke = clone.querySelector('.typography-stroke');
            if (typographyStroke && artistNameUpper) {
                typographyStroke.textContent = artistNameUpper;
            }

            // 2. Actualizăm imaginea din noul wrapper izolat
            const img = clone.querySelector('.artist-slide-image-wrapper img');
            if (img && artistName) {
                // Generăm calea locală corectă pe baza numelui extras
                const folderName = artistNameUpper === '3FU' ? '3FU' : artistNameUpper;
                const fileName = artistName.charAt(0).toUpperCase() + artistName.slice(1).toLowerCase();
                img.src = `../assets/Artisti/${folderName}/${fileName}1.jpeg`;
            }
        }


        const physicalSlides = [...track.children];
        let currentArtistIndex = 0;
        let currentPhysicalIndex = CLONE_COUNT; // Indexul pornește acum de la numărul de clone adăugate
        let currentAlbumIndex = 0;
        let activeTrackPlayer = null;
        let activeTrackButton = null;
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
            label.append(title);
            if (album.year) {
                const year = document.createElement('small');
                year.textContent = album.year;
                label.append(year);
            }
            const hole = document.createElement('span');
            hole.className = 'artist-record-hole';
            record.append(image, label, hole);
            record.addEventListener('click', () => renderAlbum(currentArtistIndex, index));
            return record;
        };

        const renderAlbum = (artistIndex, albumIndex) => {
            activeTrackPlayer?.remove();
            if (activeTrackButton) activeTrackButton.hidden = false;
            activeTrackPlayer = null;
            activeTrackButton = null;

            const artist = artists[artistIndex];
            if (!artist.albums.length) {
                currentAlbumIndex = 0;
                recordStack.replaceChildren();
                albumNextButton.hidden = true;
                albumDetails.closest('.artist-record-player').classList.add('has-no-releases');
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'artist-no-releases';
                emptyMessage.textContent = document.documentElement.lang === 'ro'
                    ? 'Nu sunt lansări disponibile momentan.'
                    : 'No releases available yet.';
                albumDetails.replaceChildren(emptyMessage);
                return;
            }

            currentAlbumIndex = (albumIndex + artist.albums.length) % artist.albums.length;
            const album = artist.albums[currentAlbumIndex];
            recordStack.replaceChildren(...artist.albums.map((item, index) => createAlbumRecord(item, artist, index, index === currentAlbumIndex)));
            albumNextButton.hidden = artist.albums.length < 2;
            albumDetails.closest('.artist-record-player').classList.remove('has-no-releases');

            const metadata = document.createElement('p');
            metadata.className = 'artist-album-meta';
            const artistName = document.createElement('span');
            artistName.textContent = artist.name;
            const year = document.createElement('span');
            year.textContent = album.year;
            metadata.append(artistName, year);

            const title = document.createElement('h4');
            title.className = 'artist-album-title';
            title.textContent = album.title;
            const trackHeading = document.createElement('p');
            trackHeading.className = 'artist-track-heading';
            const isRomanian = document.documentElement.lang === 'ro';
            trackHeading.textContent = isRomanian ? 'Piese selectate' : 'Track listing';

            const trackList = document.createElement('ol');
            trackList.className = 'artist-track-list';
            album.tracks.forEach(([trackName, duration, videoId], trackIndex) => {
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

                if (videoId) {
                    const playButton = document.createElement('button');
                    playButton.className = 'artist-track-play';
                    playButton.type = 'button';
                    playButton.textContent = isRomanian ? 'Redă' : 'Play';
                    playButton.setAttribute('aria-label', `${isRomanian ? 'Redă' : 'Play'} ${trackName}`);
                    playButton.addEventListener('click', () => {
                        activeTrackPlayer?.remove();
                        if (activeTrackButton) activeTrackButton.hidden = false;

                        const player = document.createElement('iframe');
                        player.className = 'artist-track-player';
                        player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`;
                        player.title = `${artist.name} - ${trackName}`;
                        player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                        player.referrerPolicy = 'strict-origin-when-cross-origin';
                        player.allowFullscreen = true;
                        playButton.after(player);
                        playButton.hidden = true;
                        activeTrackPlayer = player;
                        activeTrackButton = playButton;
                    });
                    row.append(playButton);
                }

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
            // Adăugați acest bloc în interiorul funcției selectArtist, imediat după ce se aplică clasa 'is-active'
            const allVisibleSlides = document.querySelectorAll('.artist-slide');
            allVisibleSlides.forEach(slide => {
                const textSpan = slide.querySelector('.typography-stroke');
                if (textSpan) {
                    const nameLength = textSpan.textContent.trim().length;
                    
                    // Dacă numele are mai mult de 5 litere (ex: ADELISHA are 8), micșorăm fontul dinamic
                    if (nameLength > 5) {
                        // Ajustează dimensiunea în funcție de numărul de caractere
                        const dynamicSize = Math.max(2.2, 7.5 - (nameLength - 5) * 0.7); 
                        textSpan.style.fontSize = `clamp(2rem, ${dynamicSize}vw, ${dynamicSize + 2}rem)`;
                    } else {
                        // Nume scurte (XENY, 3FU) își păstrează dimensiunea maximă standard
                        textSpan.style.fontSize = '';
                    }
                }
            });

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
        albumNextButton.addEventListener('click', () => {
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
    if (portfolioMenuButton && portfolioMenu) {
        let lastScrollY = window.scrollY;
        let navigationFrame = 0;
        const menuOpenLabel = portfolioMenuButton.dataset.menuOpenLabel || 'Open menu';
        const menuCloseLabel = portfolioMenuButton.dataset.menuCloseLabel || 'Close menu';

        const closePortfolioMenu = () => {
            portfolioMenu.classList.remove('active');
            portfolioMenuButton.classList.remove('menu-open');
            portfolioMenuButton.setAttribute('aria-expanded', 'false');
            portfolioMenuButton.setAttribute('aria-label', menuOpenLabel);
        };

        portfolioMenuButton.addEventListener('click', () => {
            const isOpen = portfolioMenu.classList.toggle('active');
            portfolioMenuButton.classList.toggle('menu-open', isOpen);
            portfolioMenuButton.setAttribute('aria-expanded', String(isOpen));
            portfolioMenuButton.setAttribute('aria-label', isOpen ? menuCloseLabel : menuOpenLabel);
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
            
            // REPARARE: Schimbăm pragul de verificare. 
            // Cât timp suntem la începutul paginii (sub 100px), meniul clasic e vizibil, deci hamburgerul stă ascuns.
            if (scrollY <= 100) {
                portfolioHeader?.classList.remove('is-hidden');
                portfolioMenuButton.classList.remove('visible');
                closePortfolioMenu();
            } else {
                // De îndată ce am trecut de 100px și coborâm pe site, hamburgerul RĂMÂNE vizibil mereu!
                portfolioHeader?.classList.add('is-hidden');
                portfolioMenuButton.classList.add('visible');
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

    const seriesSlideshow = document.querySelector('[data-series-slideshow]');
    if (seriesSlideshow) {
        const track = seriesSlideshow.querySelector('[data-series-track]');
        const slides = [...seriesSlideshow.querySelectorAll('[data-series-slide]')];
        const count = seriesSlideshow.querySelector('[data-series-count]');
        const previousButton = seriesSlideshow.querySelector('[data-series-previous]');
        const nextButton = seriesSlideshow.querySelector('[data-series-next]');
        let currentSlide = 0;
        let activePlayer;
        let activePoster;

        const stopPlayback = () => {
            if (!activePlayer || !activePoster) return;
            activePlayer.querySelector('iframe')?.remove();
            activePlayer.append(activePoster);
            activePlayer = undefined;
            activePoster = undefined;
        };

        const showSlide = index => {
            stopPlayback();
            currentSlide = (index + slides.length) % slides.length;
            if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
            slides.forEach((slide, slideIndex) => {
                const isCurrent = slideIndex === currentSlide;
                slide.setAttribute('aria-hidden', String(!isCurrent));
                slide.inert = !isCurrent;
            });
            if (count) {
                count.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
            }
        };

        previousButton?.addEventListener('click', () => showSlide(currentSlide - 1));
        nextButton?.addEventListener('click', () => showSlide(currentSlide + 1));
        seriesSlideshow.querySelectorAll('[data-series-poster]').forEach(poster => {
            poster.addEventListener('click', () => {
                const player = poster.closest('.project-player');
                const videoId = poster.dataset.videoId;
                if (!player || !videoId) return;

                stopPlayback();
                const iframe = document.createElement('iframe');
                if (poster.dataset.videoPlatform === 'tiktok') {
                    iframe.src = `https://www.tiktok.com/player/v1/${encodeURIComponent(videoId)}?autoplay=1`;
                } else if (poster.dataset.videoPlatform === 'instagram') {
                    iframe.src = `https://www.instagram.com/reel/${encodeURIComponent(videoId)}/embed/`;
                } else {
                    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`;
                }
                iframe.title = poster.dataset.videoTitle || 'CINEVRA series episode';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                iframe.referrerPolicy = 'strict-origin-when-cross-origin';
                iframe.allowFullscreen = true;

                activePlayer = player;
                activePoster = poster;
                poster.replaceWith(iframe);
            });
        });

        showSlide(0);
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