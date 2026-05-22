from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import pandas as pd
from datetime import datetime

app = Flask(__name__)

# Charger le modèle
with open('models/xgboost_optimized_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('models/xgboost_optimized_results.pkl', 'rb') as f:
    results = pickle.load(f)

FEATURE_NAMES = results['features']

print(f"Model loaded: {len(FEATURE_NAMES)} features")
print(f"R2: {results['r2']:.4f}")

def create_input_features(date, hour, temp, is_raining, is_snowing, clouds, weather_main, is_holiday):
    """EXACTEMENT comme Streamlit"""
    
    features = {name: 0 for name in FEATURE_NAMES}
    
    features['temp_celsius'] = float(temp)
    features['rain_1h'] = 1.0 if is_raining else 0.0
    features['snow_1h'] = 1.0 if is_snowing else 0.0
    features['clouds_all'] = int(clouds)
    features['year'] = date.year
    features['month'] = date.month
    features['day'] = date.day
    features['hour'] = int(hour)
    features['day_of_week'] = date.weekday()
    features['week_of_year'] = date.isocalendar()[1]
    features['is_weekend'] = 1 if date.weekday() >= 5 else 0
    features['is_rush_hour'] = 1 if hour in [7, 8, 16, 17, 18] else 0
    features['is_holiday'] = 1 if is_holiday else 0
    features['is_raining'] = 1 if is_raining else 0
    features['is_snowing'] = 1 if is_snowing else 0
    
    if 'holiday_None' in features:
        features['holiday_None'] = 1
    if is_holiday:
        features['holiday_None'] = 0
        if 'holiday_New Years Day' in features:
            features['holiday_New Years Day'] = 1
    
    # Time of day - Modèle a: Matin/Nuit/Soir
    if 6 <= hour < 12:
        tod = 'Matin'
    elif 12 <= hour < 18:
        tod = 'Soir'  # Pas d'Après-midi dans le modèle
    else:
        tod = 'Nuit'
    if f'time_of_day_{tod}' in features:
        features[f'time_of_day_{tod}'] = 1
    
    # Season - Modèle a: Hiver/Printemps/Été
    if date.month in [3, 4, 5]:
        season = 'Printemps'
    elif date.month in [6, 7, 8, 9, 10, 11]:  # Automne -> Été
        season = 'Été'
    else:
        season = 'Hiver'
    if f'season_{season}' in features:
        features[f'season_{season}'] = 1
    
    # Weather
    if f'weather_main_{weather_main}' in features:
        features[f'weather_main_{weather_main}'] = 1
    
    weather_map = {
        'Clear': 'sky is clear', 'Clouds': 'overcast clouds',
        'Rain': 'light rain', 'Snow': 'light snow',
        'Mist': 'mist', 'Fog': 'fog', 'Drizzle': 'drizzle',
        'Thunderstorm': 'thunderstorm', 'Haze': 'haze',
        'Smoke': 'smoke', 'Squall': 'squall'
    }
    desc = weather_map.get(weather_main, 'sky is clear')
    if f'weather_description_{desc}' in features:
        features[f'weather_description_{desc}'] = 1
    
    # Temp level - Modèle a: Chaud/Frais/Froid/Très Froid
    if temp < 0:
        tlevel = 'Très Froid'
    elif temp < 10:
        tlevel = 'Froid'
    elif temp < 20:
        tlevel = 'Frais'
    else:
        tlevel = 'Chaud'  # 20+ = Chaud
    if f'temp_level_{tlevel}' in features:
        features[f'temp_level_{tlevel}'] = 1
    
    # Cloud category
    if clouds <= 25:
        ccat = 'Peu Nuageux'
    elif clouds <= 50:
        ccat = 'Partiellement Nuageux'
    elif clouds <= 75:
        ccat = 'Nuageux'
    else:
        ccat = 'Très Nuageux'
    if f'cloud_category_{ccat}' in features:
        features[f'cloud_category_{ccat}'] = 1
    
    X = pd.DataFrame([features])
    X = X[FEATURE_NAMES]
    return X

def get_traffic_level(volume):
    if volume < 2000:
        return 'Fluide', 'success', 'Trafic fluide'
    elif volume < 4000:
        return 'Modéré', 'warning', 'Trafic modéré'
    else:
        return 'Dense', 'danger', 'Trafic dense'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        date = datetime.strptime(data['date'], '%Y-%m-%d')
        hour = int(data['hour'])
        temp = float(data['temperature'])
        is_raining = data.get('is_raining', False)
        is_snowing = data.get('is_snowing', False)
        clouds = int(data['clouds'])
        weather_main = data['weather_main']
        is_holiday = data.get('is_holiday', False)
        
        print(f"\nPrediction: {date.strftime('%Y-%m-%d')} {hour}h, {temp}C, {weather_main}, {clouds}%")
        
        X = create_input_features(date, hour, temp, is_raining, is_snowing, clouds, weather_main, is_holiday)
        prediction = model.predict(X)[0]
        prediction = max(0, int(round(prediction)))
        level, level_class, message = get_traffic_level(prediction)
        
        print(f"Result: {prediction:,} vehicles/hour ({level})\n")
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'level': level,
            'level_class': level_class,
            'message': message
        })
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    print(f"\nTraffic Lens | R2: {results['r2']:.2%} | http://localhost:5001")
app.run(debug=True, host='127.0.0.1', port=5001)

