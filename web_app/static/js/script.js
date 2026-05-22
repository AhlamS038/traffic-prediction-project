// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeTheme();
    setupEventListeners();
    initializeWeatherIcons();
});

// Initialiser le formulaire
function initializeForm() {
    // Remplir les heures
    const hourSelect = document.getElementById('hour');
    for (let i = 0; i < 24; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i.toString().padStart(2, '0')}:00`;
        hourSelect.appendChild(option);
    }
    
    // Date par défaut
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('hour').value = 8; // 8:00 par défaut
    
    updateCloudsValue();
    
    // Pour les checkboxes avec hints
    const holidayCheckbox = document.getElementById('is_holiday');
    const holidayCard = holidayCheckbox.closest('.checkbox-card');
    
    holidayCheckbox.addEventListener('change', function() {
        const hint = holidayCard.querySelector('.checkbox-hint');
        if (this.checked) {
            hint.innerHTML = '<i class="fas fa-check-circle"></i> Activé';
            hint.style.color = 'var(--success)';
        } else {
            hint.innerHTML = '<i class="fas fa-info-circle"></i> Réduit le trafic';
            hint.style.color = '';
        }
    });
}

// Initialiser les icônes météo dans le select
function initializeWeatherIcons() {
    const weatherSelect = document.getElementById('weather_main');
    
    // Créer un div pour l'icône actuelle
    const iconDisplay = document.createElement('div');
    iconDisplay.className = 'weather-icon-display';
    iconDisplay.style.cssText = `
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--primary);
        font-size: 1rem;
        pointer-events: none;
        z-index: 2;
    `;
    
    weatherSelect.parentElement.appendChild(iconDisplay);
    
    // Mettre à jour l'icône quand la sélection change
    function updateWeatherIcon() {
        const selectedOption = weatherSelect.options[weatherSelect.selectedIndex];
        const text = selectedOption.text;
        const iconMatch = text.match(/<i class="([^"]+)"><\/i>/);
        
        if (iconMatch) {
            iconDisplay.innerHTML = `<i class="${iconMatch[1]}"></i>`;
            // Retirer l'icône du texte affiché
            selectedOption.text = text.replace(/<i class="[^"]+"><\/i>/, '').trim();
        }
    }
    
    // Initialiser l'icône
    updateWeatherIcon();
    
    // Écouter les changements
    weatherSelect.addEventListener('change', function() {
        updateWeatherIcon();
        
        // Animation sur changement
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
}

// Theme Toggle
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        themeIcon.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        themeIcon.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        this.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

// Event Listeners
function setupEventListeners() {
    const form = document.getElementById('predictionForm');
    const cloudsSlider = document.getElementById('clouds');
    
    form.addEventListener('submit', handleSubmit);
    cloudsSlider.addEventListener('input', updateCloudsValue);
    
    // Animation pour les cartes checkbox
    const checkboxes = document.querySelectorAll('.checkbox-card input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const card = this.closest('.checkbox-card');
            if (this.checked) {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // Effet au survol des inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
}

// Update Clouds Value
function updateCloudsValue() {
    const slider = document.getElementById('clouds');
    const value = document.getElementById('cloudsValue');
    const progress = document.getElementById('cloudsProgress');
    
    const sliderValue = slider.value;
    value.textContent = sliderValue;
    progress.style.width = `${sliderValue}%`;
    
    // Animation sur changement
    slider.style.transform = 'scale(1.02)';
    setTimeout(() => {
        slider.style.transform = 'scale(1)';
    }, 150);
}

// Handle Submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const btn = document.getElementById('predictBtn');
    btn.classList.add('loading');
    btn.disabled = true;
    
    // Animation sur le formulaire
    const formCard = document.querySelector('.form-card');
    formCard.style.boxShadow = '0 0 40px rgba(0, 102, 255, 0.3)';
    formCard.style.transform = 'translateY(-2px)';
    
    try {
        const formData = {
            date: document.getElementById('date').value,
            hour: parseInt(document.getElementById('hour').value),
            temperature: parseFloat(document.getElementById('temperature').value),
            is_raining: document.getElementById('is_raining').checked,
            is_snowing: document.getElementById('is_snowing').checked,
            clouds: parseInt(document.getElementById('clouds').value),
            weather_main: document.getElementById('weather_main').value,
            is_holiday: document.getElementById('is_holiday').checked
        };
        
        // Vérification des données
        if (formData.is_raining && formData.is_snowing) {
            showNotification('⚠️ La pluie et la neige ne peuvent pas être simultanées', 'error');
            throw new Error('Conditions météo incompatibles');
        }
        
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Animation de réussite
            formCard.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.3)';
            setTimeout(() => {
                formCard.style.boxShadow = '';
                formCard.style.transform = '';
            }, 1000);
            
            displayResults(data);
            showNotification('✅ Prédiction générée avec succès', 'success');
            
            // Effet de particules visuel
            createConfetti();
            
            // Animation de la carte résultats
            const resultsCard = document.querySelector('.results-card');
            resultsCard.style.animation = 'none';
            setTimeout(() => {
                resultsCard.style.animation = 'fadeIn 0.5s ease-out';
            }, 10);
        } else {
            formCard.style.boxShadow = '0 0 40px rgba(255, 71, 87, 0.3)';
            setTimeout(() => {
                formCard.style.boxShadow = '';
                formCard.style.transform = '';
            }, 1000);
            throw new Error(data.error || 'Erreur lors de la prédiction');
        }
    } catch (error) {
        showNotification('❌ ' + error.message, 'error');
        console.error('Error:', error);
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Display Results
function displayResults(data) {
    const results = document.getElementById('results');
    
    // Déterminer l'icône en fonction du niveau
    let levelIcon = '';
    switch(data.level_class) {
        case 'success':
            levelIcon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'warning':
            levelIcon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'danger':
            levelIcon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'critical':
            levelIcon = '<i class="fas fa-skull-crossbones"></i>';
            break;
        default:
            levelIcon = '<i class="fas fa-info-circle"></i>';
    }
    
    const html = `
        <div class="result-content">
            <div class="result-header">
                <div class="result-value">${data.prediction.toLocaleString()}</div>
                <div class="result-label">véhicules/heure</div>
                <div class="traffic-level ${data.level_class}">
                    ${levelIcon} ${data.level}
                </div>
            </div>
            <div class="result-message">
                ${data.message}
            </div>
        </div>
    `;
    
    results.innerHTML = html;
    
    // Animation supplémentaire pour les niveaux critiques
    if (data.level_class === 'critical') {
        const trafficLevel = document.querySelector('.traffic-level');
        let scale = 1;
        const pulseInterval = setInterval(() => {
            scale = scale === 1 ? 1.05 : 1;
            trafficLevel.style.transform = `scale(${scale})`;
        }, 500);
        
        // Nettoyer l'intervalle si l'utilisateur refait une prédiction
        setTimeout(() => {
            clearInterval(pulseInterval);
        }, 10000);
    }
}

// Effet confetti pour la réussite
function createConfetti() {
    const colors = ['#0066ff', '#00ccff', '#00ffcc', '#3399ff', '#66b3ff'];
    const confettiCount = 25;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 6}px;
            height: ${Math.random() * 10 + 6}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            top: 50%;
            left: 50%;
            opacity: 0.9;
            z-index: 9999;
            pointer-events: none;
        `;
        
        document.body.appendChild(confetti);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        const gravity = 0.1;
        const rotation = Math.random() * 360;
        
        let x = 0;
        let y = 0;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        
        const animate = () => {
            x += vx;
            y += vy;
            vy += gravity;
            
            confetti.style.transform = `translate(${x * 30}px, ${y * 30}px) rotate(${x * 10 + rotation}deg)`;
            confetti.style.opacity = 1 - (Math.abs(x) + Math.abs(y)) / 100;
            
            if (Math.abs(x) < 100 && Math.abs(y) < 100) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        animate();
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Ajouter une icône selon le type
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i> ';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i> ';
    else icon = '<i class="fas fa-info-circle"></i> ';
    
    notification.innerHTML = icon + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Ajouter un effet de particules pour le logo au survol
document.addEventListener('DOMContentLoaded', function() {
    const logoContainer = document.querySelector('.logo-container');
    
    logoContainer.addEventListener('mouseenter', function() {
        createLogoParticles();
    });
});

function createLogoParticles() {
    const logoRect = document.querySelector('.logo-container').getBoundingClientRect();
    const colors = ['#0066ff', '#00ccff', '#00ffcc'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            top: ${logoRect.top + logoRect.height / 2}px;
            left: ${logoRect.left + logoRect.width / 2}px;
            opacity: 0;
            z-index: 9998;
            pointer-events: none;
        `;
        
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 30;
        const duration = 0.5 + Math.random() * 0.5;
        
        const keyframes = [
            {
                transform: `translate(0, 0) scale(1)`,
                opacity: 0.8
            },
            {
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0
            }
        ];
        
        const timing = {
            duration: duration * 1000,
            easing: 'ease-out'
        };
        
        particle.animate(keyframes, timing).onfinish = () => {
            particle.remove();
        };
    }
}