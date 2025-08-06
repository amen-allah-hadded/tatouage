 // Configuration globale
        const SERVER_URL = 'https://audio-watermarker-production-328c.up.railway.app/';

        // Configuration Storj (sans exposer les identifiants sensibles)
        let storjConfig = {
            accessKey: 'jx463vfcabhrgitnwnowlr4k6k5a',
            secretKey: 'j2ykufmyoxuvja23oeohigbxjczvsntaaxqolnd24w3rlbja3vt7g',
            endpoint: 'https://gateway.storjshare.io',
            bucketName: 'watermark'
        };

        let downloadData = null;
        let downloadFilename = null;

        // Variables globales pour les fichiers
        let selectedAudioFile = null;
        let metadataHash = null;

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            loadWavelets();
            setupEventListeners();
            initAnimations();
            setCurrentDate();
            
            // Synchronisation des sliders
            document.getElementById('embed-modulation').addEventListener('input', function() {
                document.getElementById('modulation-value').textContent = this.value;
            });
            
            document.getElementById('extract-modulation').addEventListener('input', function() {
                document.getElementById('extract-modulation-value').textContent = this.value;
            });
        });

        function initAnimations() {
            // Effet de chargement progressif des éléments
            const animatedElements = document.querySelectorAll('.animate-fadeIn');
            animatedElements.forEach((el, index) => {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.style.opacity = '1';
                }, 100 * index);
            });
        }

        function setCurrentDate() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('creation-date').value = `${year}-${month}-${day}`;
        }

        function setupEventListeners() {
            // Advanced params toggles
            document.getElementById('embed-advanced-toggle').addEventListener('click', function() {
                toggleAdvancedParams('embed');
                this.querySelector('i').classList.toggle('rotate-180');
            });

            document.getElementById('extract-advanced-toggle').addEventListener('click', function() {
                toggleAdvancedParams('extract');
                this.querySelector('i').classList.toggle('rotate-180');
            });

            // License personalisation
            document.getElementById('license-info').addEventListener('change', function() {
                const customLicenseContainer = document.getElementById('custom-license-container');
                if (this.value === 'custom') {
                    customLicenseContainer.classList.remove('hidden');
                } else {
                    customLicenseContainer.classList.add('hidden');
                }
            });

            // Gestion des fichiers audio
            setupFileDropArea('audio-drop-area', 'audio-file', 'audio-file-info', (file) => {
                selectedAudioFile = file;
            });

            setupFileDropArea('extract-audio-drop-area', 'extract-audio-file', 'extract-file-info');
        }

        function setupFileDropArea(areaId, inputId, infoId, callback) {
            const dropArea = document.getElementById(areaId);
            const fileInput = document.getElementById(inputId);
            const fileInfo = document.getElementById(infoId);

            // Click to select
            dropArea.addEventListener('click', () => {
                fileInput.click();
            });

            // File selection change
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    displayFileInfo(file, fileInfo);
                    if (callback) callback(file);
                }
            });

            // Drag and drop
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.classList.add('border-primary-400');
                dropArea.classList.add('bg-primary-50');
            });

            dropArea.addEventListener('dragleave', () => {
                dropArea.classList.remove('border-primary-400');
                dropArea.classList.remove('bg-primary-50');
            });

            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.classList.remove('border-primary-400');
                dropArea.classList.remove('bg-primary-50');

                if (e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    fileInput.files = e.dataTransfer.files;
                    displayFileInfo(file, fileInfo);
                    if (callback) callback(file);
                }
            });
        }

        function displayFileInfo(file, infoElement) {
            const size = formatFileSize(file.size);
            infoElement.innerHTML = `
                <div class="mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 mr-3">
                            <i class="fa-solid fa-file-audio"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">${file.name}</p>
                            <p class="text-xs text-gray-500">${size}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        function toggleAdvancedParams(type) {
            const params = document.getElementById(`${type}-advanced`);
            params.classList.toggle('hidden');
        }

        // Gestion des onglets
        function switchTab(tabName) {
            document.querySelectorAll('.tab-button').forEach(tab => {
                tab.classList.remove('text-primary-800');
                tab.classList.add('text-gray-500');
                tab.classList.add('hover:text-primary-700');
                tab.querySelector('span').style.width = '0';
            });
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });

            const activeTab = document.getElementById(`${tabName}-tab-btn`);
            activeTab.classList.add('text-primary-800');
            activeTab.classList.remove('text-gray-500');
            activeTab.classList.remove('hover:text-primary-700');
            activeTab.querySelector('span').style.width = '100%';
            
            document.getElementById(`${tabName}-tab`).classList.remove('hidden');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        }

        // Copier dans le presse-papier
        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId);
            const text = element.innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                // Animation flash
                element.classList.add('bg-green-100');
                element.classList.add('border-green-200');
                
                setTimeout(() => {
                    element.classList.remove('bg-green-100');
                    element.classList.remove('border-green-200');
                }, 1000);
                
                showToast('Copié dans le presse-papier');
            });
        }
        
        // Toast notification
        function showToast(message) {
            // Create toast if it doesn't exist
            if (!document.getElementById('toast-notification')) {
                const toast = document.createElement('div');
                toast.id = 'toast-notification';
                toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 z-50';
                document.body.appendChild(toast);
            }
            
            const toast = document.getElementById('toast-notification');
            toast.textContent = message;
            toast.classList.remove('translate-y-full', 'opacity-0');
            
            setTimeout(() => {
                toast.classList.add('translate-y-full', 'opacity-0');
            }, 3000);
        }

        // Génération d'ID intelligent pour les droits d'auteur
        function generateCopyrightID() {
            const timestamp = Date.now().toString(36).slice(-4); // 4 chars
            const random = Math.random().toString(36).slice(-4); // 4 chars
            const prefix = 'SP'; // SonicProof prefix - 2 chars
            const sequence = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 chars

            return `${prefix}${timestamp}${random}${sequence}`.toUpperCase();
        }

        // Collecte des métadonnées de droits d'auteur
        function collectMetadata() {
            const author = document.getElementById('author-name').value.trim();
            const creationDate = document.getElementById('creation-date').value;
            const licenseType = document.getElementById('license-info').value;
            let licenseInfo = '';

            if (licenseType === 'custom') {
                licenseInfo = document.getElementById('custom-license').value.trim();
            } else {
                const licenseMap = {
                    'all-rights-reserved': 'Tous droits réservés',
                    'cc-by': 'Creative Commons - Attribution',
                    'cc-by-sa': 'Creative Commons - Attribution - Partage dans les mêmes conditions',
                    'cc-by-nc': 'Creative Commons - Attribution - Pas d\'utilisation commerciale',
                    'cc-by-nc-sa': 'Creative Commons - Attribution - Pas d\'utilisation commerciale - Partage dans les mêmes conditions',
                    'cc-by-nd': 'Creative Commons - Attribution - Pas de modification',
                    'cc-by-nc-nd': 'Creative Commons - Attribution - Pas d\'utilisation commerciale - Pas de modification',
                    'cc0': 'Creative Commons - CC0 / Domaine Public'
                };
                licenseInfo = licenseMap[licenseType] || licenseType;
            }

            const additionalInfo = document.getElementById('additional-info').value.trim();

            return {
                author: author || 'Non spécifié',
                creationDate: creationDate || new Date().toISOString().split('T')[0],
                licenseInfo: licenseInfo || 'Tous droits réservés',
                additionalInfo: additionalInfo || ''
            };
        }

        // Vérification des métadonnées requises
        function validateMetadata() {
            const author = document.getElementById('author-name').value.trim();
            if (!author) {
                showStatus('Veuillez spécifier l\'auteur/créateur', 'warning', 'embed-status');
                return false;
            }

            const creationDate = document.getElementById('creation-date').value;
            if (!creationDate) {
                showStatus('Veuillez spécifier la date de création', 'warning', 'embed-status');
                return false;
            }

            const licenseType = document.getElementById('license-info').value;
            if (licenseType === 'custom') {
                const customLicense = document.getElementById('custom-license').value.trim();
                if (!customLicense) {
                    showStatus('Veuillez spécifier les détails de votre licence personnalisée', 'warning', 'embed-status');
                    return false;
                }
            }

            return true;
        }

        // Chargement des ondelettes
        async function loadWavelets() {
            try {
                const response = await fetch(`${SERVER_URL}/api/wavelets`);
                const data = await response.json();

                const selects = document.querySelectorAll('[id$="dwt-wavelet"]');
                selects.forEach(select => {
                    select.innerHTML = '';
                    data.wavelets.forEach(wavelet => {
                        const option = document.createElement('option');
                        option.value = wavelet;
                        option.textContent = wavelet;
                        if (wavelet === 'haar') option.selected = true;
                        select.appendChild(option);
                    });
                });
            } catch (error) {
                console.error('Erreur lors du chargement des ondelettes:', error);
            }
        }

        function validateConfig() {
            // Vérification des paramètres Storj
            if (!storjConfig.accessKey || !storjConfig.secretKey || !storjConfig.bucketName) {
                showStatus('Erreur de configuration de stockage. Contactez l\'administrateur.', 'danger', 'embed-status');
                return false;
            }
            return true;
        }

        // Processus d'embedding
        async function processEmbedding() {
            // Validation
            if (!selectedAudioFile) {
                showStatus('Veuillez sélectionner un fichier audio', 'danger', 'embed-status');
                return;
            }

            if (!validateMetadata()) return;
            if (!validateConfig()) return;

            const button = document.getElementById('embed-btn');
            const progress = document.getElementById('embed-progress');
            const progressFill = document.getElementById('embed-progress-fill');
            const progressText = document.getElementById('embed-progress-text');
            const progressPercent = document.getElementById('embed-progress-percent');
            const result = document.getElementById('embed-result');

            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            progress.classList.remove('hidden');
            result.classList.add('hidden');
            hideStatus('embed-status');

            try {
                // Étape 1: Générer un ID unique
                const uniqueID = generateCopyrightID();
                document.getElementById('generated-id').textContent = uniqueID;

                showStatus('Génération de l\'identifiant unique...', 'info', 'embed-status');
                updateProgress('embed-progress-fill', 'embed-progress-percent', 20);
                progressText.textContent = 'Génération de l\'identifiant unique...';

                // Étape 2: Collecter et traiter les métadonnées
                const metadata = collectMetadata();
                showStatus('Traitement des métadonnées de droits d\'auteur...', 'info', 'embed-status');
                progressText.textContent = 'Traitement des métadonnées de droits d\'auteur...';
                updateProgress('embed-progress-fill', 'embed-progress-percent', 40);

                // Étape 3: Créer l'objet métadonnées pour la génération du hash
                const metadataForHash = {
                    id: uniqueID,
                    author: metadata.author,
                    creationDate: metadata.creationDate,
                    licenseInfo: metadata.licenseInfo,
                    additionalInfo: metadata.additionalInfo,
                    timestamp: Date.now()
                };

                // Étape 4: Générer le hash pour vérification d'intégrité
                metadataHash = await generateMetadataHash(metadataForHash);
                document.getElementById('generated-hash').textContent = metadataHash;
                updateProgress('embed-progress-fill', 'embed-progress-percent', 60);

                // Étape 5: Stocker les métadonnées avec le hash
                showStatus('Stockage des informations de droits d\'auteur...', 'info', 'embed-status');
                progressText.textContent = 'Stockage des informations de droits d\'auteur...';
                await storeMetadata(uniqueID, metadata, metadataHash, metadataForHash);
                updateProgress('embed-progress-fill', 'embed-progress-percent', 80);

                // Étape 6: Insérer l'ID dans l'audio via watermarking
                showStatus('Application du watermark dans l\'audio...', 'info', 'embed-status');
                progressText.textContent = 'Application du watermark dans l\'audio...';
                await embedWatermarkInAudio(uniqueID, selectedAudioFile);
                updateProgress('embed-progress-fill', 'embed-progress-percent', 100);

                // Afficher le résultat
                setTimeout(() => {
                    progress.classList.add('hidden');
                    result.classList.remove('hidden');
                    showStatus('Protection des droits d\'auteur appliquée avec succès', 'success', 'embed-status');
                }, 500);

            } catch (error) {
                progress.classList.add('hidden');
                showStatus(`Erreur: ${error.message}`, 'danger', 'embed-status');
            } finally {
                button.disabled = false;
                button.innerHTML = '<i class="fa-solid fa-shield-halved mr-2"></i>Protéger le contenu';
            }
        }

        // Génération du hash de métadonnées
        async function generateMetadataHash(metadataObj) {
            const metadataString = JSON.stringify(metadataObj);
            const encoder = new TextEncoder();
            const data = encoder.encode(metadataString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            return hashHex;
        }

        // Stockage des métadonnées avec données de hashage
        async function storeMetadata(id, metadata, hash, metadataForHash) {
            const metadataObj = {
                id: id,
                author: metadata.author,
                creationDate: metadata.creationDate,
                licenseInfo: metadata.licenseInfo,
                additionalInfo: metadata.additionalInfo,
                integrityHash: hash,
                created: metadataForHash.timestamp,
                // Inclure les informations utilisées pour le hash
                hashData: metadataForHash
            };

            const filename = `${id}_metadata.json`;
            const fileData = new Blob([JSON.stringify(metadataObj, null, 2)], { type: 'application/json' });

            const url = `${storjConfig.endpoint}/${storjConfig.bucketName}/${encodeURIComponent(filename)}`;
            const basicAuth = btoa(`${storjConfig.accessKey}:${storjConfig.secretKey}`);

            let response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/json'
                },
                body: fileData
            });

            if (!response.ok && response.status === 403) {
                const urlObj = new URL(url);
                const hostHeader = urlObj.hostname;

                const headers = {
                    'Content-Type': 'application/json',
                    'Host': hostHeader
                };

                const signedHeaders = await createAWS4Signature('PUT', url, headers, fileData);

                response = await fetch(url, {
                    method: 'PUT',
                    headers: signedHeaders,
                    body: fileData
                });
            }

            if (!response.ok) {
                throw new Error(`Échec du stockage des métadonnées: ${response.status} - ${response.statusText}`);
            }
        }

        // Insertion du watermark dans l'audio
        async function embedWatermarkInAudio(watermarkText, audioFile) {
            const formData = new FormData();
            formData.append('audio_file', audioFile);
            formData.append('watermark_text', watermarkText);
            formData.append('method', document.getElementById('embed-method').value);
            formData.append('segment_length', document.getElementById('embed-segment-length').value);
            formData.append('seed', document.getElementById('embed-seed').value);
            formData.append('modulation_strength', document.getElementById('embed-modulation').value);
            formData.append('band_lower_pct', document.getElementById('embed-band-lower').value);
            formData.append('band_upper_pct', document.getElementById('embed-band-upper').value);
            formData.append('n_coeffs', document.getElementById('embed-n-coeffs').value);
            formData.append('dwt_level', document.getElementById('embed-dwt-level').value);
            formData.append('dwt_wavelet', document.getElementById('embed-dwt-wavelet').value);
            formData.append('dwt_coeff_type', document.getElementById('embed-dwt-coeff').value);

            const response = await fetch(`${SERVER_URL}/api/embed`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erreur lors de l\'insertion du watermark');
            }

            downloadData = data.file_data;
            downloadFilename = data.filename;
        }

        // Processus d'extraction
        async function processExtraction() {
            const audioFile = document.getElementById('extract-audio-file').files[0];

            if (!audioFile) {
                showStatus('Veuillez sélectionner un fichier audio', 'danger', 'extract-status');
                return;
            }

            if (!validateConfig()) return;

            const button = document.getElementById('extract-btn');
            const progress = document.getElementById('extract-progress');
            const progressFill = document.getElementById('extract-progress-fill');
            const progressText = document.getElementById('extract-progress-text');
            const progressPercent = document.getElementById('extract-progress-percent');
            const result = document.getElementById('extract-result');

            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Extraction en cours...';
            progress.classList.remove('hidden');
            result.classList.add('hidden');
            hideStatus('extract-status');

            try {
                // Étape 1: Extraire l'ID du watermark
                showStatus('Analyse du fichier audio...', 'info', 'extract-status');
                progressText.textContent = 'Analyse du fichier audio...';
                const extractedID = await extractWatermarkFromAudio(audioFile);
                updateProgress('extract-progress-fill', 'extract-progress-percent', 30);

                document.getElementById('extracted-id').textContent = extractedID;

                // Étape 2: Récupérer les métadonnées de droits d'auteur
                showStatus('Récupération des métadonnées de droits d\'auteur...', 'info', 'extract-status');
                progressText.textContent = 'Récupération des métadonnées de droits d\'auteur...';
                const metadata = await retrieveMetadata(extractedID);
                updateProgress('extract-progress-fill', 'extract-progress-percent', 60);

                // Étape 3: Afficher les métadonnées
                document.getElementById('extracted-author').textContent = metadata.author || 'Non spécifié';
                document.getElementById('extracted-date').textContent = formatDate(metadata.creationDate) || 'Non spécifiée';
                document.getElementById('extracted-license').textContent = metadata.licenseInfo || 'Non spécifiée';
                document.getElementById('extracted-additional').textContent = metadata.additionalInfo || 'Aucune information additionnelle';

                showStatus('Vérification de l\'intégrité des métadonnées...', 'info', 'extract-status');
                progressText.textContent = 'Vérification de l\'intégrité des métadonnées...';

                // Étape 4: Vérifier l'intégrité en recalculant le hash des données stockées
                const isIntegrityValid = await verifyIntegrity(metadata);
                updateProgress('extract-progress-fill', 'extract-progress-percent', 100);

                // Afficher le résultat de la vérification d'intégrité
                const integrityCheckResult = document.getElementById('integrity-check-result');
                if (isIntegrityValid) {
                    integrityCheckResult.innerHTML = `
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-800">Intégrité vérifiée</p>
                                <p class="text-xs text-gray-500">Les métadonnées sont authentiques et n'ont pas été modifiées.</p>
                            </div>
                        </div>
                    `;
                    integrityCheckResult.parentElement.classList.add('bg-green-50');
                    integrityCheckResult.parentElement.classList.add('border-green-200');
                } else {
                    integrityCheckResult.innerHTML = `
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-800">Intégrité compromise</p>
                                <p class="text-xs text-gray-500">Les métadonnées pourraient avoir été modifiées après leur création.</p>
                            </div>
                        </div>
                    `;
                    integrityCheckResult.parentElement.classList.add('bg-red-50');
                    integrityCheckResult.parentElement.classList.add('border-red-200');
                }

                // Afficher le résultat
                setTimeout(() => {
                    progress.classList.add('hidden');
                    result.classList.remove('hidden');
                    showStatus('Extraction et vérification terminées', 'success', 'extract-status');
                }, 500);

            } catch (error) {
                progress.classList.add('hidden');
                showStatus(`Erreur: ${error.message}`, 'danger', 'extract-status');
            } finally {
                button.disabled = false;
                button.innerHTML = '<i class="fa-solid fa-magnifying-glass mr-2"></i>Extraire et vérifier';
            }
        }

        // Extraction du watermark depuis l'audio
        async function extractWatermarkFromAudio(audioFile) {
            const formData = new FormData();
            formData.append('audio_file', audioFile);
            formData.append('watermark_length', '12');
            formData.append('method', document.getElementById('extract-method').value);
            formData.append('segment_length', document.getElementById('extract-segment-length').value);
            formData.append('seed', document.getElementById('extract-seed').value);
            formData.append('modulation_strength', document.getElementById('extract-modulation').value);
            formData.append('band_lower_pct', document.getElementById('extract-band-lower').value);
            formData.append('band_upper_pct', document.getElementById('extract-band-upper').value);
            formData.append('n_coeffs', document.getElementById('extract-n-coeffs').value);
            formData.append('dwt_level', document.getElementById('extract-dwt-level').value);
            formData.append('dwt_wavelet', document.getElementById('extract-dwt-wavelet').value);
            formData.append('dwt_coeff_type', document.getElementById('extract-dwt-coeff').value);

            const response = await fetch(`${SERVER_URL}/api/extract`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erreur lors de l\'extraction du watermark');
            }

            return data.extracted_watermark.trim();
        }

        // Récupération des métadonnées
        async function retrieveMetadata(id) {
            const filename = `${id}_metadata.json`;
            const url = `${storjConfig.endpoint}/${storjConfig.bucketName}/${encodeURIComponent(filename)}`;
            const basicAuth = btoa(`${storjConfig.accessKey}:${storjConfig.secretKey}`);

            try {
                let response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${basicAuth}`
                    }
                });

                if (!response.ok && response.status === 403) {
                    const urlObj = new URL(url);
                    const hostHeader = urlObj.host;
                    const headers = { 'Host': hostHeader };
                    const signedHeaders = await createAWS4Signature('GET', url, headers);

                    response = await fetch(url, {
                        method: 'GET',
                        headers: signedHeaders
                    });
                }

                if (!response.ok) {
                    throw new Error(`Métadonnées non trouvées (${response.status})`);
                }

                const metadata = await response.json();
                return metadata;
            } catch (error) {
                console.error('Erreur lors de la récupération des métadonnées:', error);
                throw new Error('Impossible de récupérer les métadonnées de droits d\'auteur');
            }
        }

        // Vérification de l'intégrité des métadonnées en utilisant les données hashées
        async function verifyIntegrity(metadata) {
            // Vérifier si le hash stocké et les données de hash existent
            if (!metadata.integrityHash || !metadata.hashData) {
                return false;
            }

            // Récupérer le hash stocké
            const storedHash = metadata.integrityHash;

            // Recalculer le hash à partir des données originales utilisées lors de la création
            const recalculatedHash = await generateMetadataHash(metadata.hashData);

            // Comparer les deux hash
            return recalculatedHash === storedHash;
        }

        // Utilitaires
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('fr-FR', options);
        }

        function updateProgress(fillElementId, percentElementId, percent) {
            document.getElementById(fillElementId).style.width = percent + '%';
            document.getElementById(percentElementId).textContent = percent + '%';
        }

        function showStatus(message, type, elementId) {
            const statusDiv = document.getElementById(elementId);
            
            const alertClasses = {
                'success': 'bg-green-50 border-green-200 text-green-800',
                'danger': 'bg-red-50 border-red-200 text-red-800',
                'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
                'info': 'bg-blue-50 border-blue-200 text-blue-800'
            };
            
            const iconClasses = {
                'success': 'fa-circle-check text-green-500',
                'danger': 'fa-circle-exclamation text-red-500',
                'warning': 'fa-triangle-exclamation text-yellow-500',
                'info': 'fa-circle-info text-blue-500'
            };
            
            statusDiv.innerHTML = `
                <div class="rounded-lg p-4 mb-4 border ${alertClasses[type]} animate-fadeIn">
                    <div class="flex">
                        <i class="fa-solid ${iconClasses[type]} mt-0.5 mr-3"></i>
                        <div>${message}</div>
                    </div>
                </div>
            `;
        }

        function hideStatus(elementId) {
            document.getElementById(elementId).innerHTML = '';
        }

        function downloadWatermarkedAudio() {
            if (!downloadData || !downloadFilename) {
                showStatus('Aucun fichier disponible pour téléchargement', 'danger', 'embed-status');
                return;
            }

            const byteCharacters = atob(downloadData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray]);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadFilename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showToast('Téléchargement démarré');
        }

        // Fonctions cryptographiques pour AWS4
        async function createAWS4Signature(method, url, headers, payload) {
            const AWS_ALGORITHM = 'AWS4-HMAC-SHA256';
            const AWS_SERVICE = 's3';
            const AWS_REGION = 'us-east-1';

            const now = new Date();
            const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
            const dateStamp = amzDate.substr(0, 8);

            let payloadHash;
            if (payload instanceof Blob || payload instanceof ArrayBuffer) {
                payloadHash = await sha256ArrayBuffer(await payload.arrayBuffer ? await payload.arrayBuffer() : payload);
            } else if (typeof payload === 'string') {
                payloadHash = await sha256(payload);
            } else if (!payload) {
                payloadHash = await sha256('');
            } else {
                payloadHash = await sha256('');
            }

            headers['x-amz-content-sha256'] = payloadHash;
            headers['x-amz-date'] = amzDate;

            const canonicalHeaders = Object.keys(headers)
                .sort()
                .map(key => `${key.toLowerCase()}:${headers[key]}`)
                .join('\n') + '\n';

            const signedHeaders = Object.keys(headers)
                .sort()
                .map(key => key.toLowerCase())
                .join(';');

            const canonicalRequest = [
                method,
                new URL(url).pathname,
                new URL(url).search.slice(1),
                canonicalHeaders,
                signedHeaders,
                payloadHash
            ].join('\n');

            const credentialScope = `${dateStamp}/${AWS_REGION}/${AWS_SERVICE}/aws4_request`;
            const stringToSign = [
                AWS_ALGORITHM,
                amzDate,
                credentialScope,
                await sha256(canonicalRequest)
            ].join('\n');

            const signingKey = await getSignatureKey(storjConfig.secretKey, dateStamp, AWS_REGION, AWS_SERVICE);
            const signature = await hmacSha256(stringToSign, signingKey);

            const authHeader = `${AWS_ALGORITHM} Credential=${storjConfig.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

            return {
                'Authorization': authHeader,
                ...headers
            };
        }

        async function sha256ArrayBuffer(buffer) {
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function sha256(data) {
            const encoder = new TextEncoder();
            const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
            return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function hmacSha256(data, key) {
            const encoder = new TextEncoder();
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                typeof key === 'string' ? encoder.encode(key) : key,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
            return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function getSignatureKey(key, dateStamp, regionName, serviceName) {
            const encoder = new TextEncoder();
            const kDate = await hmacSha256Raw(dateStamp, encoder.encode('AWS4' + key));
            const kRegion = await hmacSha256Raw(regionName, kDate);
            const kService = await hmacSha256Raw(serviceName, kRegion);
            const kSigning = await hmacSha256Raw('aws4_request', kService);
            return kSigning;
        }

        async function hmacSha256Raw(data, key) {
            const encoder = new TextEncoder();
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
        }

